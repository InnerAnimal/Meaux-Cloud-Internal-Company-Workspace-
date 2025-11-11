import React from 'react'

const DriveSection: React.FC = () => {
  return (
    <section id="drive-section" className="content-section active">
      <div className="header">
        <h1>Google Drive</h1>
        <div className="header-actions">
          <button className="header-btn">
            <i className="fas fa-search"></i> Search
          </button>
          <button className="header-btn btn-primary">
            <i className="fas fa-upload"></i> Upload
          </button>
        </div>
      </div>

      <div className="service-card">
        <h3>Storage Overview</h3>
        <div className="progress-bar" style={{ margin: '1rem 0' }}>
          <div className="progress-fill" style={{ width: '52%' }}></div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          2.1 TB of 4 TB used (52%)
        </p>
        <button className="btn btn-primary">
          <i className="fab fa-google-drive"></i> Open Google Drive
        </button>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '2rem 0 1rem' }}>Recent Files</h2>
      <div className="services-grid">
        <div className="service-card" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--background-color)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-file-pdf" style={{ fontSize: '1.5rem', color: 'var(--danger-color)' }}></i>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Brand-Guidelines-2025.pdf</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Updated 2 hours ago</div>
            </div>
          </div>
        </div>
        <div className="service-card" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--background-color)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-file-image" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>meaux-logo-final.svg</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Updated yesterday</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DriveSection

