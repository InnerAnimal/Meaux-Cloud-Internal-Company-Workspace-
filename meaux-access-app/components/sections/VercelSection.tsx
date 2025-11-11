import React from 'react'

const VercelSection: React.FC = () => {
  return (
    <section id="vercel-section" className="content-section active">
      <div className="header">
        <h1>Vercel Deployments</h1>
        <div className="header-actions">
          <button className="header-btn btn-primary">
            <i className="fas fa-rocket"></i> Deploy Now
          </button>
        </div>
      </div>

      <div className="services-grid">
        <div className="service-card">
          <h3>Latest Deployment</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
            <span className="status-badge status-online">
              <i className="fas fa-circle"></i> Ready
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Deployed 2 hours ago</span>
          </div>
          <div style={{ background: 'var(--background-color)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '1rem' }}>
            main@a1b2c3d
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            <i className="fas fa-external-link-alt"></i> Visit Production
          </button>
        </div>
        <div className="service-card">
          <h3>Recent Deployments</h3>
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-badge status-online" style={{ padding: '0.125rem 0.5rem' }}>
                <i className="fas fa-check"></i>
              </span>
              <span style={{ fontWeight: 600 }}>Production</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>2 hours ago</div>
          </div>
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-badge status-online" style={{ padding: '0.125rem 0.5rem' }}>
                <i className="fas fa-check"></i>
              </span>
              <span style={{ fontWeight: 600 }}>Preview</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>5 hours ago</div>
          </div>
          <div style={{ padding: '0.75rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-badge status-online" style={{ padding: '0.125rem 0.5rem' }}>
                <i className="fas fa-check"></i>
              </span>
              <span style={{ fontWeight: 600 }}>Production</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Yesterday</div>
          </div>
        </div>
        <div className="service-card">
          <h3>Project Stats</h3>
          <div className="stat-item">
            <span className="stat-label">Total Deployments</span>
            <span className="stat-value">247</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Success Rate</span>
            <span className="stat-value">99.2%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Build Time</span>
            <span className="stat-value">45s</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VercelSection

