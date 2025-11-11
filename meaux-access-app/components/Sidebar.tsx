import React from 'react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'meoxtalk', label: 'MeauxTalk', icon: 'message' },
    { id: 'meauxboard', label: 'MeauxBoard', icon: 'board' },
    { id: 'meauxdocs', label: 'MeauxDocs', icon: 'document' },
    { id: 'mail', label: 'Mail', icon: 'mail' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'meet', label: 'Meet', icon: 'video' },
    { id: 'drive', label: 'Drive', icon: 'folder' },
    { id: 'meauxcloud', label: 'MeauxCloud', icon: 'cloud' },
    { id: 'stripe', label: 'Stripe', icon: 'credit-card' },
    { id: 'supabase', label: 'Supabase', icon: 'database' },
    { id: 'vercel', label: 'Vercel', icon: 'triangle' },
  ]

  const getIconSVG = (icon: string) => {
    const icons: Record<string, JSX.Element> = {
      grid: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      message: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C4.46957 16 3.96086 15.7893 3.58579 15.4142C3.21071 15.0391 3 14.5304 3 14V6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H19C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V14C21 14.5304 20.7893 15.0391 20.4142 15.4142C20.0391 15.7893 19.5304 16 19 16H14L9 21V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      board: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="13" y="3" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      document: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12H15M9 16H15M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      mail: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      calendar: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 10H21M8 3V6M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      video: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      folder: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      cloud: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 15C3 17.8284 4.64162 20.2663 7 21.2361M21 15C21 17.8284 19.3584 20.2663 17 21.2361M7 21.2361C7.87568 21.7044 8.90632 22 10 22H14C15.0937 22 16.1243 21.7044 17 21.2361M7 21.2361C4.79086 20.3884 3 18.3859 3 16V13.5C3 11.0147 4.79086 9.01224 7 8.16442M17 21.2361C19.2091 20.3884 21 18.3859 21 16V13.5C21 11.0147 19.2091 9.01224 17 8.16442M7 8.16442C7.87568 7.69555 8.90632 7.4 10 7.4H14C15.0937 7.4 16.1243 7.69555 17 8.16442M12 2V7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'credit-card': (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 10H22M7 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      database: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V7M4 7H20M4 7L6 5H18L20 7M9 11V15M12 9V15M15 13V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      triangle: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L3 21H21L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    }
    return icons[icon] || icons.grid
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg className="logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1F97A9', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#26B4C9', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path d="M 70 45 C 70 38 65 32 58 32 C 57 32 56 32 55 32 C 53 25 47 20 40 20 C 31 20 24 27 24 36 C 24 37 24 38 24 39 C 18 40 14 45 14 51 C 14 58 19 64 26 64 L 68 64 C 77 64 84 57 84 48 C 84 40 78 34 70 33 Z" fill="url(#cloudGradient)"/>
            <text x="50" y="58" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle">M</text>
            <circle cx="35" cy="75" r="3" fill="#1F97A9" opacity="0.6"/>
            <circle cx="50" cy="78" r="2.5" fill="#1F97A9" opacity="0.7"/>
            <circle cx="65" cy="75" r="3" fill="#1F97A9" opacity="0.6"/>
          </svg>
          <span>Meaux Access</span>
        </div>
      </div>

      <nav>
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <a
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  onSectionChange(item.id)
                }}
              >
                {getIconSVG(item.icon)}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="user-profile">
        <div className="user-info">
          <div className="user-avatar">S</div>
          <div>
            <div className="user-name">Sam</div>
            <div className="user-role">Founder & CEO</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

