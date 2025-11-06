interface HostingSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function HostingSection({ showNotification }: HostingSectionProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Render Hosting</h2>
      <p className="text-secondary mb-6">Application hosting and deployment</p>

      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Deployment Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <i className="fas fa-circle text-[6px] mr-2"></i>
              Live
            </span>
          </div>
          <div className="text-sm text-secondary">Last deployed: Just now</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-semibold mb-2">Application URL</div>
          <a
            href="https://innerautodidact.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            https://innerautodidact.com
          </a>
        </div>
      </div>

      <button
        onClick={() => window.open('https://dashboard.render.com', '_blank')}
        className="w-full px-4 py-2 bg-[#46e3b7] text-gray-900 rounded-lg font-medium hover:bg-[#3dd1a6] transition-colors"
      >
        <i className="fas fa-external-link-alt mr-2"></i>
        Open Render Dashboard
      </button>
    </div>
  );
}
