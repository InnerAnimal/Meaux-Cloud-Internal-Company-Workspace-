'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { MessageSquare, Send } from 'lucide-react'

interface Message {
    id: string
    content: string
    sender_id: string
    created_at: string
    profiles?: {
        full_name: string
        initials: string
    }
}

export default function MeauxTalkPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadMessages()

        const channel = supabase
            .channel('messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                loadMessages()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function loadMessages() {
        const { data } = await supabase
            .from('messages')
            .select('*, profiles:profiles!messages_sender_id_fkey(*)')
            .order('created_at', { ascending: true })
            .limit(50)

        if (data) setMessages(data as any)
    }

    async function sendMessage() {
        if (!newMessage.trim()) return

        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            await supabase.from('messages').insert({
                content: newMessage,
                sender_id: user.id,
                recipient_id: user.id, // For now, team-wide chat
            })
            setNewMessage('')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">MeauxTalk</h1>
                <p className="text-muted-foreground">Team messaging</p>
            </div>

            <div className="glassmorphic rounded-xl p-6 h-[600px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                                {msg.profiles?.initials || 'U'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                        {msg.profiles?.full_name || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(msg.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

