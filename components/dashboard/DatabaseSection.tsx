interface DatabaseSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function DatabaseSection({ showNotification }: DatabaseSectionProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Supabase Database</h2>
      <p className="text-secondary mb-6">Database connected and running</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-circle text-green-500 text-xs"></i>
            <span className="font-semibold">Status: Online</span>
          </div>
          <div className="text-sm text-secondary">Database is healthy and operational</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-semibold mb-2">Project URL</div>
          <code className="text-xs break-all text-secondary">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
          </code>
        </div>
      </div>

      <button
        onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
        className="w-full px-4 py-2 bg-[#3ecf8e] text-white rounded-lg font-medium hover:bg-[#2fb87b] transition-colors"
      >
        <i className="fas fa-external-link-alt mr-2"></i>
        Open Supabase Dashboard
      </button>
    </div>
  );
}
