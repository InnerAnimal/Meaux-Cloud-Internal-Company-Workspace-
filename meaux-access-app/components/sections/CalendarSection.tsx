import React from 'react'

const CalendarSection: React.FC = () => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date().getDate()

  return (
    <section id="calendar-section" className="content-section active">
      <div className="header">
        <h1>Team Calendar</h1>
        <div className="header-actions">
          <button className="header-btn">
            <i className="fas fa-filter"></i>
            Filter
          </button>
          <button className="header-btn btn-primary">
            <i className="fas fa-plus"></i>
            New Event
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        <div className="service-card" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>November 2025</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="header-btn" style={{ padding: '0.5rem' }}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="header-btn" style={{ padding: '0.5rem' }}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {weekDays.map((day) => (
              <div key={day} className="calendar-header">{day}</div>
            ))}
            {Array(5).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day"></div>
            ))}
            {days.map((day) => (
              <div
                key={day}
                className={`calendar-day ${day === today ? 'today' : ''} ${[17, 20].includes(day) ? 'has-event' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="service-card">
            <h3 style={{ marginBottom: '1rem' }}>Upcoming Events</h3>
            <div className="event-item">
              <div className="event-dot"></div>
              <div>
                <div style={{ fontWeight: 600 }}>Team Standup</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <i className="fas fa-clock"></i> Today, 10:00 AM
                </div>
              </div>
            </div>
            <div className="event-item">
              <div className="event-dot" style={{ background: 'var(--accent-orange)' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Client Demo</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <i className="fas fa-clock"></i> Nov 17, 2:00 PM
                </div>
              </div>
            </div>
            <div className="event-item">
              <div className="event-dot"></div>
              <div>
                <div style={{ fontWeight: 600 }}>Sprint Planning</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <i className="fas fa-clock"></i> Nov 20, 9:00 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CalendarSection

