import React from 'react'

const StripeSection: React.FC = () => {
  return (
    <section id="stripe-section" className="content-section active">
      <div className="header">
        <h1>Stripe Payments</h1>
        <div className="header-actions">
          <button className="header-btn btn-primary">
            <i className="fas fa-external-link-alt"></i> Open Dashboard
          </button>
        </div>
      </div>

      <div className="services-grid">
        <div className="stats-card">
          <h3 style={{ marginBottom: '1rem' }}>This Month</h3>
          <div className="stat-item">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">$12,450</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">156</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Success Rate</span>
            <span className="stat-value">98.7%</span>
          </div>
        </div>
        <div className="service-card">
          <h3>Recent Transactions</h3>
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600 }}>Grant Payment - $500</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>2 hours ago</div>
          </div>
          <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600 }}>Donation - $100</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>5 hours ago</div>
          </div>
          <div style={{ padding: '0.75rem 0' }}>
            <div style={{ fontWeight: 600 }}>Monthly Subscription - $29</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Yesterday</div>
          </div>
        </div>
        <div className="service-card">
          <h3>Quick Actions</h3>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }}>
            <i className="fab fa-stripe"></i> Stripe Dashboard
          </button>
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem' }}>
            <i className="fas fa-receipt"></i> View Invoices
          </button>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            <i className="fas fa-users"></i> Manage Customers
          </button>
        </div>
      </div>
    </section>
  )
}

export default StripeSection

