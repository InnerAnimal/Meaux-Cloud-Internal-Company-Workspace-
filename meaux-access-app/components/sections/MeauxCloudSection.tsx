import React from 'react'

const MeauxCloudSection: React.FC = () => {
  return (
    <section id="meauxcloud-section" className="content-section active">
      <div className="header">
        <h1>MeauxCloud Storage</h1>
        <div className="header-actions">
          <button className="header-btn btn-primary">
            <i className="fas fa-upload"></i> Upload File
          </button>
        </div>
      </div>

      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Unified cloud storage for your team across Google Drive, iCloud, and Cloudflare R2
      </p>

      <div className="service-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <polygon points="35,20 65,20 85,60 50,60" fill="#4285f4"/>
              <polygon points="15,60 50,60 35,87" fill="#34a853"/>
              <polygon points="50,60 85,60 70,87 35,87" fill="#fbbc04"/>
            </svg>
            <div>
              <h3 style={{ margin: 0 }}>Google Drive</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>4 TB Total</p>
            </div>
          </div>
          <span className="status-badge status-online">
            <i className="fas fa-circle"></i> Connected
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '52%' }}></div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          2.1 TB used • 1.9 TB available
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button className="btn btn-primary">
            <i className="fas fa-folder-open"></i> Browse
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-upload"></i> Upload
          </button>
        </div>
      </div>

      <div className="service-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M 70 45 C 70 38 65 32 58 32 C 57 32 56 32 55 32 C 53 25 47 20 40 20 C 31 20 24 27 24 36 C 24 37 24 38 24 39 C 18 40 14 45 14 51 C 14 58 19 64 26 64 L 68 64 C 77 64 84 57 84 48 C 84 40 78 34 70 33 Z" fill="#000000"/>
            </svg>
            <div>
              <h3 style={{ margin: 0 }}>iCloud Storage</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>4 TB Total</p>
            </div>
          </div>
          <span className="status-badge status-online">
            <i className="fas fa-circle"></i> Connected
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '45%' }}></div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          1.8 TB used • 2.2 TB available
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button className="btn btn-primary">
            <i className="fas fa-folder-open"></i> Browse
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-upload"></i> Upload
          </button>
        </div>
      </div>

      <div className="service-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" fill="#f38020"/>
              <path d="M 30 50 Q 35 35, 50 35 Q 65 35, 70 50 Q 65 65, 50 65 Q 35 65, 30 50" fill="white"/>
            </svg>
            <div>
              <h3 style={{ margin: 0 }}>Cloudflare R2</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Unlimited • Zero Egress</p>
            </div>
          </div>
          <span className="status-badge status-online">
            <i className="fas fa-circle"></i> Ready
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '1rem 0' }}>
          S3-compatible object storage with unlimited capacity. Perfect for website assets and media files.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary">
            <i className="fas fa-rocket"></i> Connect Storage
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-book"></i> Guide
          </button>
        </div>
      </div>
    </section>
  )
}

export default MeauxCloudSection

