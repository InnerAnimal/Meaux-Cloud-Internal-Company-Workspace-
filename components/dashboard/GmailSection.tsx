interface GmailSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function GmailSection({ showNotification }: GmailSectionProps) {
  const emails = [
    {
      sender: 'Connor',
      subject: 'Project Update - Meauxbility',
      preview: "Hey Sam, here's the latest update on our project...",
      time: '2m ago',
      avatar: 'C',
    },
    {
      sender: 'Fred',
      subject: 'Meeting Tomorrow',
      preview: "Don't forget about our team meeting tomorrow at 2 PM...",
      time: '1h ago',
      avatar: 'F',
    },
    {
      sender: 'InnerAnimals',
      subject: 'New Support Request',
      preview: 'We have a new support request that needs attention...',
      time: '3h ago',
      avatar: 'I',
    },
  ];

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Recent Emails</h2>

      <div className="space-y-4">
        {emails.map((email, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 border-b border-border hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {email.avatar}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-primary">{email.sender}</div>
              <div className="text-secondary text-sm">{email.subject}</div>
              <div className="text-secondary text-xs">{email.preview}</div>
            </div>
            <div className="text-secondary text-xs">{email.time}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => showNotification('Refreshing emails...', 'info')}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          <i className="fas fa-sync mr-2"></i>
          Refresh
        </button>
        <button
          onClick={() => showNotification('Opening email composer...', 'success')}
          className="px-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          <i className="fas fa-edit mr-2"></i>
          Compose Email
        </button>
      </div>
    </div>
  );
}
