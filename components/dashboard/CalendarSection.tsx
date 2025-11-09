interface CalendarSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function CalendarSection({ showNotification }: CalendarSectionProps) {
  const events = [
    { time: '9:00 AM', title: 'Team Standup', description: 'Daily team sync meeting' },
    { time: '2:00 PM', title: 'Client Meeting', description: 'Discuss project requirements' },
    { time: '4:00 PM', title: 'Code Review', description: 'Review latest changes' },
  ];

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Today&apos;s Schedule</h2>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 border-l-4 border-primary bg-gray-50 rounded-lg"
          >
            <div className="font-semibold text-primary min-w-[80px]">{event.time}</div>
            <div>
              <div className="font-semibold text-primary">{event.title}</div>
              <div className="text-secondary text-sm">{event.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => showNotification('Refreshing calendar...', 'info')}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          <i className="fas fa-sync mr-2"></i>
          Refresh
        </button>
        <button
          onClick={() => showNotification('Opening event creator...', 'success')}
          className="px-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Event
        </button>
      </div>
    </div>
  );
}
