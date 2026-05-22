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

export interface TypingUser {
  userId: string
  name:   string
}

export function useChat(consultationId: string | null) {
  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [loading,     setLoading]     = useState(true)
  const [sending,     setSending]     = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})
  const { user, profile } = useAuth()
  const channelRef         = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimeouts     = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

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

  // Realtime: messages + typing broadcast
  useEffect(() => {
    if (!consultationId || !user) return

    const channel = supabase
      .channel(`chat:${consultationId}`)
      // new messages
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
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      // typing indicator
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: TypingUser }) => {
        if (payload.userId === user.id) return
        setTypingUsers((prev) => ({ ...prev, [payload.userId]: payload.name }))
        // clear after 3s of silence
        if (typingTimeouts.current[payload.userId]) {
          clearTimeout(typingTimeouts.current[payload.userId])
        }
        typingTimeouts.current[payload.userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev }
            delete next[payload.userId]
            return next
          })
        }, 3000)
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      Object.values(typingTimeouts.current).forEach(clearTimeout)
    }
  }, [consultationId, user])

  // Broadcast typing event (debounced by caller)
  const sendTyping = useCallback(() => {
    if (!channelRef.current || !user || !profile) return
    channelRef.current.send({
      type:    'broadcast',
      event:   'typing',
      payload: { userId: user.id, name: profile.full_name ?? 'Usuário' } as TypingUser,
    })
  }, [user, profile])

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
        .createSignedUrl(path, 60 * 60 * 24)

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

  const otherTyping = Object.values(typingUsers)

  return {
    messages, loading, sending, uploading,
    otherTyping,
    sendMessage, uploadAndSend, sendTyping,
  }
}
