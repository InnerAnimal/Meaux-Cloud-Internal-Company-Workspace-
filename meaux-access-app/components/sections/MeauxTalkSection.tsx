import React, { useState, useRef, useEffect } from 'react'

const MeauxTalkSection: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, author: 'Sam', avatar: 'S', time: '9:41 AM', text: 'Good morning team! Ready to launch Meaux Access today. This is going to revolutionize how we work together.', color: 'var(--primary-color)' },
    { id: 2, author: 'Connor McNeely', avatar: 'C', time: '9:43 AM', text: 'Absolutely! All the integrations are live. Supabase, Stripe, and Daily.co are all connected and tested.', color: '#64748b' },
    { id: 3, author: 'Fred Williams', avatar: 'F', time: '9:45 AM', text: 'The design is clean! Love how everything flows together. Internal apps are going to save us so much time.', color: 'var(--accent-orange)' },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return

    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

    setMessages([...messages, {
      id: messages.length + 1,
      author: 'Sam',
      avatar: 'S',
      time,
      text: input,
      color: 'var(--primary-color)'
    }])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <section id="meoxtalk-section" className="content-section active">
      <div className="header">
        <h1>MeauxTalk - Team Messaging</h1>
        <div className="header-actions">
          <button className="header-btn">
            <i className="fas fa-users"></i>
            Channels
          </button>
          <button className="header-btn">
            <i className="fas fa-search"></i>
            Search
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <div className="message-avatar" style={{ background: msg.color }}>{msg.avatar}</div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">{msg.author}</span>
                  <span className="message-time">{msg.time}</span>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Message the team..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="send-btn" onClick={sendMessage}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MeauxTalkSection

