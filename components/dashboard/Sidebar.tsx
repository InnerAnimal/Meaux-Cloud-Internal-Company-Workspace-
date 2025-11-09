import { Section } from '@/app/dashboard/page';

interface SidebarProps {
  currentSection: Section;
  setCurrentSection: (section: Section) => void;
}

export default function Sidebar({ currentSection, setCurrentSection }: SidebarProps) {
  const navItems = [
    { id: 'overview', icon: 'fa-tachometer-alt', label: 'Overview' },
    { id: 'gmail', icon: 'fa-envelope', label: 'Email' },
    { id: 'calendar', icon: 'fa-calendar', label: 'Calendar' },
    { id: 'meet', icon: 'fa-video', label: 'Google Meet' },
    { id: 'drive', icon: 'fa-folder', label: 'Google Drive' },
    { id: 'cloud', icon: 'fa-server', label: 'Cloud Storage' },
    { id: 'payments', icon: 'fa-credit-card', label: 'Stripe' },
    { id: 'database', icon: 'fa-database', label: 'Supabase' },
    { id: 'hosting', icon: 'fa-globe', label: 'Render' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-border overflow-y-auto z-50 hidden md:block">
      <div className="p-8 border-b border-border">
        <div className="flex items-center gap-3">
          <i className="fas fa-cloud text-4xl text-primary"></i>
          <span className="text-2xl font-bold text-primary">Meauxbility Cloud</span>
        </div>
      </div>

      <ul className="py-4">
        {navItems.map((item) => (
          <li key={item.id} className="mb-2">
            <button
              onClick={() => setCurrentSection(item.id as Section)}
              className={`w-full flex items-center gap-3 px-8 py-3 text-left transition-all border-l-4 ${
                currentSection === item.id
                  ? 'bg-gray-100 text-primary border-primary'
                  : 'text-secondary border-transparent hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
