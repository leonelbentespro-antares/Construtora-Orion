import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export type AttachmentType = 'image' | 'audio' | 'video' | 'document'

export interface ChatAttachment {
  url:  string
  type: AttachmentType
  name: string
  size: number
  path: string
}

export interface ChatMessage {
  id:              string
  consultation_id: string
  sender_id:       string
  sender_role:     string
  content:         string
  attachments:     ChatAttachment[]
  read_at:         string | null
  created_at:      string
}

export function useChat(consultationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const [uploading,setUploading]= useState(false)
  const { user, profile } = useAuth()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Initial load
  useEffect(() => {
    if (!consultationId) { setLoading(false); return }
    setLoading(true)
    supabase.schema('jurisflow')
      .from('consultation_messages')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []) as ChatMessage[])
        setLoading(false)
      })
  }, [consultationId])

  // Realtime subscription
  useEffect(() => {
    if (!consultationId) return

    const channel = supabase
      .channel(`chat:${consultationId}`)
      .on(
        'postgres_changes' as any,
        {
          event:  'INSERT',
          schema: 'jurisflow',
          table:  'consultation_messages',
          filter: `consultation_id=eq.${consultationId}`,
        },
        (payload: { new: ChatMessage }) => {
          setMessages((prev) => {
            // avoid duplicates (optimistic vs realtime)
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [consultationId])

  const sendMessage = useCallback(
    async (content: string, attachments: ChatAttachment[] = []) => {
      if (!consultationId || !user || !profile) return
      if (!content.trim() && attachments.length === 0) return

      setSending(true)

      // Optimistic insert
      const optimistic: ChatMessage = {
        id:              `opt-${Date.now()}`,
        consultation_id: consultationId,
        sender_id:       user.id,
        sender_role:     profile.role,
        content,
        attachments,
        read_at:         null,
        created_at:      new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])

      await supabase.schema('jurisflow').from('consultation_messages').insert({
        consultation_id: consultationId,
        sender_id:       user.id,
        sender_role:     profile.role as any,
        content,
        attachments:     attachments as any,
      })

      setSending(false)
    },
    [consultationId, user, profile]
  )

  const uploadAndSend = useCallback(
    async (file: File) => {
      if (!consultationId || !user) return
      setUploading(true)

      const ext  = file.name.split('.').pop() ?? 'bin'
      const path = `${consultationId}/${user.id}/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('chat-attachments')
        .upload(path, file, { upsert: false })

      if (error) { setUploading(false); return }

      const { data: signed } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(path, 60 * 60 * 24) // 24h

      if (!signed?.signedUrl) { setUploading(false); return }

      const type: AttachmentType =
        file.type.startsWith('image/') ? 'image'    :
        file.type.startsWith('audio/') ? 'audio'    :
        file.type.startsWith('video/') ? 'video'    : 'document'

      await sendMessage('', [{
        url:  signed.signedUrl,
        type,
        name: file.name,
        size: file.size,
        path,
      }])

      setUploading(false)
    },
    [consultationId, user, sendMessage]
  )

  return { messages, loading, sending, uploading, sendMessage, uploadAndSend }
}
