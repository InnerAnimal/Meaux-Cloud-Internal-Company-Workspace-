import React from 'react'

const OverviewSection: React.FC = () => {
  return (
    <section id="overview-section" className="content-section active">
      <div className="header">
        <h1>Dashboard Overview</h1>
        <div className="header-actions">
          <button className="header-btn">
            <i className="fas fa-sync"></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <div className="quick-action" onClick={() => window.location.hash = '#meoxtalk'}>
          <svg className="quick-action-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#1F97A9" opacity="0.1"/>
            <path d="M22 28H22.02M32 28H32.02M42 28H42.02M24 40H18C17.4696 40 16.9609 39.7893 16.5858 39.4142C16.2107 39.0391 16 38.5304 16 38V22C16 21.4696 16.2107 20.9609 16.5858 20.5858C16.9609 20.2107 17.4696 20 18 20H46C46.5304 20 47.0391 20.2107 47.4142 20.5858C47.7893 20.9609 48 21.4696 48 22V38C48 38.5304 47.7893 39.0391 47.4142 39.4142C47.0391 39.7893 46.5304 40 46 40H36L24 48V40Z" stroke="#1F97A9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>MeauxTalk</h3>
          <p>Team messaging</p>
        </div>
        <div className="quick-action" onClick={() => window.location.hash = '#meauxboard'}>
          <svg className="quick-action-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#1F97A9" opacity="0.1"/>
            <rect x="16" y="16" width="12" height="12" rx="2" stroke="#1F97A9" strokeWidth="3"/>
            <rect x="16" y="32" width="12" height="16" rx="2" stroke="#1F97A9" strokeWidth="3"/>
            <rect x="32" y="16" width="16" height="32" rx="2" stroke="#1F97A9" strokeWidth="3"/>
          </svg>
          <h3>MeauxBoard</h3>
          <p>Project management</p>
        </div>
        <div className="quick-action" onClick={() => window.location.hash = '#meauxdocs'}>
          <svg className="quick-action-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#1F97A9" opacity="0.1"/>
            <path d="M24 30H40M24 38H40M42 52H22C21.4696 52 20.9609 51.7893 20.5858 51.4142C20.2107 51.0391 20 50.5304 20 50V14C20 13.4696 20.2107 12.9609 20.5858 12.5858C20.9609 12.2107 21.4696 12 22 12H35L44 21V50C44 50.5304 43.7893 51.0391 43.4142 51.4142C43.0391 51.7893 42.5304 52 42 52Z" stroke="#1F97A9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>MeauxDocs</h3>
          <p>Team documentation</p>
        </div>
        <div className="quick-action" onClick={() => window.location.hash = '#meet'}>
          <svg className="quick-action-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#1F97A9" opacity="0.1"/>
            <path d="M36 26L46.5528 19.7236C47.2177 19.3912 48 19.8747 48 20.618V43.382C48 44.1253 47.2177 44.6088 46.5528 44.2764L36 38M20 46H32C33.1046 46 34 45.1046 34 44V20C34 18.8954 33.1046 18 32 18H20C18.8954 18 18 18.8954 18 20V44C18 45.1046 18.8954 46 20 46Z" stroke="#1F97A9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Start Meeting</h3>
          <p>Daily video calls</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Quick Stats</h2>
      <div className="services-grid">
        <div className="stats-card">
          <h3 style={{ marginBottom: '1rem' }}>Storage Usage</h3>
          <div className="stat-item">
            <span className="stat-label">Google Drive</span>
            <span className="stat-value">2.1 / 4 TB</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">iCloud</span>
            <span className="stat-value">1.8 / 4 TB</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cloudflare R2</span>
            <span className="stat-value">Ready</span>
          </div>
        </div>

        <div className="stats-card">
          <h3 style={{ marginBottom: '1rem' }}>Team Activity</h3>
          <div className="stat-item">
            <span className="stat-label">Active Projects</span>
            <span className="stat-value">12</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Team Members</span>
            <span className="stat-value">8</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Deployments Today</span>
            <span className="stat-value">3</span>
          </div>
        </div>

        <div className="stats-card">
          <h3 style={{ marginBottom: '1rem' }}>System Status</h3>
          <div className="stat-item">
            <span className="stat-label">All Services</span>
            <span className="status-badge status-online">
              <i className="fas fa-circle"></i>
              Operational
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Backup</span>
            <span className="stat-value" style={{ fontSize: '0.875rem' }}>2 hours ago</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Uptime</span>
            <span className="stat-value" style={{ fontSize: '0.875rem' }}>99.9%</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OverviewSection

