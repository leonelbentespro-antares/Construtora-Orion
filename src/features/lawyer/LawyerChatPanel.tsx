import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../../hooks/useChat'
import type { ChatAttachment } from '../../hooks/useChat'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'

// ─── Attachment renderer ──────────────────────────────────────────────────────

const AttachmentBubble: React.FC<{ a: ChatAttachment; own: boolean }> = ({ a, own }) => {
  if (a.type === 'image') return (
    <a href={a.url} target="_blank" rel="noopener noreferrer">
      <img src={a.url} alt={a.name}
        className="max-w-[200px] max-h-[160px] rounded-[10px] object-cover border border-white/20 cursor-zoom-in" />
    </a>
  )
  if (a.type === 'audio') return (
    <audio controls className="max-w-[240px] h-9">
      <source src={a.url} />
    </audio>
  )
  if (a.type === 'video') return (
    <video controls className="max-w-[220px] rounded-[10px]">
      <source src={a.url} />
    </video>
  )
  return (
    <a href={a.url} target="_blank" rel="noopener noreferrer"
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-[10px] border text-sm hover:opacity-80 transition-opacity',
        own ? 'border-white/30 text-white' : 'border-[#D1D1D6] text-[#1D1D1F] bg-white',
      ].join(' ')}>
      <span className="text-lg shrink-0">📄</span>
      <span className="truncate max-w-[150px] font-medium">{a.name}</span>
      <span className="text-xs opacity-60 shrink-0">↗</span>
    </a>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface LawyerChatPanelProps {
  consultationId: string
  clientName:     string
}

export const LawyerChatPanel: React.FC<LawyerChatPanelProps> = ({ consultationId, clientName }) => {
  const { user, profile } = useAuth()
  const { messages, loading, sending, uploading, otherTyping, sendMessage, uploadAndSend, sendTyping } =
    useChat(consultationId)

  const [text,      setText]      = useState('')
  const [recording, setRecording] = useState(false)
  const messagesEnd    = useRef<HTMLDivElement>(null)
  const fileInputRef   = useRef<HTMLInputElement>(null)
  const mediaRecorder  = useRef<MediaRecorder | null>(null)
  const audioChunks    = useRef<Blob[]>([])
  const typingTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Typing broadcast — debounced
  const handleTextChange = (val: string) => {
    setText(val)
    sendTyping()
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {}, 2000)
  }

  const handleSend = async () => {
    if (!text.trim()) return
    await sendMessage(text.trim())
    setText('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadAndSend(file)
    e.target.value = ''
  }

  // Audio recording (press & hold or toggle)
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunks.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        await uploadAndSend(file)
      }
      recorder.start()
      mediaRecorder.current = recorder
      setRecording(true)
    } catch {
      alert('Permissão de microfone negada.')
    }
  }, [uploadAndSend])

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop()
    setRecording(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[420px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-[#86868B]">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm">Nenhuma mensagem ainda. Inicie a conversa com o cliente!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id
            const time  = new Date(msg.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit',
            })
            const label = isOwn ? 'Você' : clientName

            return (
              <div key={msg.id} className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1',
                  isOwn ? 'bg-[#2563EB] text-white' : 'bg-[#DBEAFE] text-[#1D4ED8]',
                ].join(' ')}>
                  {label.charAt(0).toUpperCase()}
                </div>

                <div className={`max-w-[70%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                  {msg.attachments?.length > 0 && (
                    <div className="space-y-1">
                      {msg.attachments.map((a, i) => <AttachmentBubble key={i} a={a} own={isOwn} />)}
                    </div>
                  )}
                  {msg.content && (
                    <div className={[
                      'px-3.5 py-2 rounded-[14px] text-sm leading-relaxed',
                      isOwn
                        ? 'bg-[#2563EB] text-white rounded-tr-[4px]'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] rounded-tl-[4px]',
                    ].join(' ')}>
                      {msg.content}
                    </div>
                  )}
                  <span className="text-[10px] text-[#86868B]">{label} · {time}</span>
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {otherTyping.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex gap-2 items-center"
            >
              <div className="w-7 h-7 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[10px] font-bold text-[#1D4ED8] shrink-0">
                {otherTyping[0].charAt(0).toUpperCase()}
              </div>
              <div className="bg-[#F5F5F7] rounded-[14px] rounded-tl-[4px] px-4 py-2.5 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#86868B] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#86868B] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#86868B] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEnd} />
      </div>

      {/* Input bar */}
      <div className="border-t border-[#E5E5EA] pt-3 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
        />

        <div className="flex gap-2 items-end">
          {/* Attach file */}
          <button
            type="button"
            title="Anexar arquivo"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-9 w-9 rounded-[8px] border border-[#D1D1D6] flex items-center justify-center text-[#86868B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors shrink-0 disabled:opacity-40"
          >
            {uploading
              ? <div className="w-3.5 h-3.5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
            }
          </button>

          {/* Audio record */}
          <button
            type="button"
            title={recording ? 'Parar gravação' : 'Gravar áudio'}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={[
              'h-9 w-9 rounded-[8px] border flex items-center justify-center transition-all shrink-0',
              recording
                ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] animate-pulse'
                : 'border-[#D1D1D6] text-[#86868B] hover:border-[#2563EB] hover:text-[#2563EB]',
            ].join(' ')}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Text */}
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Responda ao cliente… (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none rounded-[10px] border border-[#D1D1D6] px-3 py-2 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
          />

          <Button
            variant="primary"
            size="sm"
            loading={sending}
            disabled={!text.trim() || uploading}
            onClick={handleSend}
          >
            Enviar
          </Button>
        </div>

        {recording && (
          <p className="text-xs text-[#DC2626] font-medium text-center animate-pulse">
            🔴 Gravando… solte para enviar
          </p>
        )}
      </div>
    </div>
  )
}
