import { Section } from '@/app/dashboard/page';

interface OverviewSectionProps {
  setCurrentSection: (section: Section) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function OverviewSection({ setCurrentSection, showNotification }: OverviewSectionProps) {
  const quickActions = [
    { icon: 'fa-envelope', title: 'Check Email', description: 'View latest messages', section: 'gmail' as Section },
    { icon: 'fa-video', title: 'Start Meeting', description: 'Create instant meeting', section: 'meet' as Section },
    { icon: 'fa-calendar-plus', title: 'Schedule Event', description: 'Add to calendar', section: 'calendar' as Section },
    { icon: 'fa-upload', title: 'Upload File', description: 'Add to Drive', section: 'drive' as Section },
  ];

  const services = [
    {
      name: 'Gmail',
      icon: 'fa-envelope',
      iconBg: 'bg-[#ea4335]',
      status: 'online',
      description: 'Email service connected and syncing',
      section: 'gmail' as Section,
    },
    {
      name: 'Google Calendar',
      icon: 'fa-calendar',
      iconBg: 'bg-[#4285f4]',
      status: 'online',
      description: 'Calendar events synced and updated',
      section: 'calendar' as Section,
    },
    {
      name: 'Google Meet',
      icon: 'fa-video',
      iconBg: 'bg-[#00ac47]',
      status: 'online',
      description: 'Video conferencing ready',
      section: 'meet' as Section,
    },
    {
      name: 'Google Drive',
      icon: 'fa-folder',
      iconBg: 'bg-[#ff9800]',
      status: 'online',
      description: 'File storage and collaboration',
      section: 'drive' as Section,
    },
    {
      name: 'Google Cloud',
      icon: 'fa-server',
      iconBg: 'bg-[#34a853]',
      status: 'online',
      description: '2TB storage optimized',
      section: 'cloud' as Section,
    },
    {
      name: 'Stripe',
      icon: 'fa-credit-card',
      iconBg: 'bg-[#635bff]',
      status: 'warning',
      description: 'Payment processing',
      section: 'payments' as Section,
    },
  ];

  return (
    <div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={() => setCurrentSection(action.section)}
            className="bg-white border border-border rounded-xl p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary"
          >
            <i className={`fas ${action.icon} text-4xl text-primary mb-2`}></i>
            <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
            <p className="text-sm text-secondary">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.name}
            className="bg-white border border-border rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center`}>
                <i className={`fas ${service.icon} text-2xl text-white`}></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    service.status === 'online'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <i className={`fas fa-circle text-[6px]`}></i>
                  {service.status === 'online' ? 'Online' : 'Needs Setup'}
                </span>
              </div>
            </div>
            <p className="text-secondary mb-4">{service.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSection(service.section)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                <i className="fas fa-eye mr-2"></i>
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
