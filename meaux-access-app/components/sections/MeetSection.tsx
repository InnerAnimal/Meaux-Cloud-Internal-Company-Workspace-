import React, { useState } from 'react'

const MeetSection: React.FC = () => {
  const [meetingLink, setMeetingLink] = useState<string | null>(null)

  const createDailyRoom = async () => {
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to create room')
      }
      
      const data = await response.json()
      setMeetingLink(data.url)
    } catch (error) {
      console.error('Daily.co error:', error)
      alert('Failed to create meeting room. Check API configuration.')
    }
  }

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      const videoPreview = document.getElementById('videoPreview')
      if (videoPreview) {
        videoPreview.innerHTML = '<video autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem;"></video>'
        const video = videoPreview.querySelector('video') as HTMLVideoElement
        if (video) video.srcObject = stream
      }
    } catch (error) {
      alert('Could not access camera/microphone. Check permissions.')
    }
  }

  return (
    <section id="meet-section" className="content-section active">
      <div className="header">
        <h1>Daily Video Meetings</h1>
        <div className="header-actions">
          <button className="header-btn btn-primary" onClick={createDailyRoom}>
            <i className="fas fa-plus"></i>
            Create Room
          </button>
        </div>
      </div>

      <div className="services-grid">
        <div className="service-card" style={{ gridColumn: 'span 2' }}>
          <div className="video-preview" id="videoPreview">
            <div style={{ textAlign: 'center' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ marginTop: '1rem' }}>Camera preview</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem' }}>Click "Test Camera" below</p>
            </div>
          </div>
          <div className="video-controls" style={{ marginTop: '1rem' }}>
            <button className="control-btn" onClick={testCamera}>
              <i className="fas fa-video"></i>
            </button>
            <button className="control-btn">
              <i className="fas fa-microphone"></i>
            </button>
            <button className="control-btn">
              <i className="fas fa-cog"></i>
            </button>
            <button className="control-btn">
              <i className="fas fa-desktop"></i>
            </button>
            <button className="control-btn danger">
              <i className="fas fa-phone-slash"></i>
            </button>
          </div>
        </div>
        <div className="service-card">
          <h3>Quick Actions</h3>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={testCamera}>
            <i className="fas fa-video"></i> Test Camera
          </button>
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={createDailyRoom}>
            <i className="fas fa-plus"></i> Create Room
          </button>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            <i className="fas fa-sign-in-alt"></i> Join Room
          </button>
        </div>
        <div className="service-card">
          <h3>Meeting Info</h3>
          {meetingLink && (
            <p style={{ fontFamily: 'monospace', background: 'var(--background-color)', padding: '0.75rem', borderRadius: '0.5rem', margin: '0.75rem 0', fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {meetingLink}
            </p>
          )}
          <p>{meetingLink ? 'Meeting room ready!' : 'No active meeting'}</p>
          {meetingLink && (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} onClick={() => {
              navigator.clipboard.writeText(meetingLink)
              alert('Meeting link copied!')
            }}>
              <i className="fas fa-copy"></i> Copy Link
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default MeetSection

