import React from 'react'

const SupabaseSection: React.FC = () => {
  return (
    <section id="supabase-section" className="content-section active">
      <div className="header">
        <h1>Supabase Database</h1>
        <div className="header-actions">
          <button className="header-btn btn-primary">
            <i className="fas fa-external-link-alt"></i> Open Console
          </button>
        </div>
      </div>

      <div className="services-grid">
        <div className="stats-card">
          <h3 style={{ marginBottom: '1rem' }}>Database Stats</h3>
          <div className="stat-item">
            <span className="stat-label">Total Tables</span>
            <span className="stat-value">8</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Rows</span>
            <span className="stat-value">2,456</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Storage Used</span>
            <span className="stat-value">124 MB</span>
          </div>
        </div>
        <div className="service-card">
          <h3>Tables</h3>
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <span>profiles</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>8 rows</span>
          </div>
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <span>messages</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>324 rows</span>
          </div>
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <span>tasks</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>67 rows</span>
          </div>
          <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>documents</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>23 rows</span>
          </div>
        </div>
        <div className="service-card">
          <h3>Quick Actions</h3>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }}>
            <i className="fas fa-database"></i> SQL Editor
          </button>
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem' }}>
            <i className="fas fa-table"></i> Table Editor
          </button>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            <i className="fas fa-key"></i> API Keys
          </button>
        </div>
      </div>
    </section>
  )
}

export default SupabaseSection

