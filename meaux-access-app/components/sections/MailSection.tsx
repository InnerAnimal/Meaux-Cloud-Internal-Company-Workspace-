import React from 'react'

const MailSection: React.FC = () => {
  const teamMembers = [
    { name: 'Sam', email: 'sam@meauxbility.org', avatar: 'S', color: 'var(--primary-color)' },
    { name: 'Connor McNeely', email: 'connor@meauxbility.org', avatar: 'C', color: '#64748b' },
    { name: 'Fred Williams', email: 'fred@inneranimals.com', avatar: 'F', color: 'var(--accent-orange)' },
  ]

  return (
    <section id="mail-section" className="content-section active">
      <div className="header">
        <h1>Team Mail Management</h1>
        <div className="header-actions">
          <button className="header-btn btn-primary">
            <i className="fas fa-user-plus"></i>
            Add Member
          </button>
        </div>
      </div>

      {teamMembers.map((member) => (
        <div key={member.email} className="service-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="user-avatar" style={{ background: member.color }}>{member.avatar}</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{member.name}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{member.email}</p>
              </div>
            </div>
            <span className="status-badge status-online">
              <i className="fas fa-circle"></i> Active
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary">
              <i className="fas fa-envelope"></i> View Mail
            </button>
            <button className="btn btn-secondary">
              <i className="fas fa-cog"></i> Settings
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}

export default MailSection

