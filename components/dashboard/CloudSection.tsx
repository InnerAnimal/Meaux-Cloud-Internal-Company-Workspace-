interface CloudSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function CloudSection({ showNotification }: CloudSectionProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Google Cloud Storage</h2>
      <p className="text-secondary mb-6">Project: Meauxbility-Core (gen-lang-client-0938727621)</p>

      {/* Storage Bar */}
      <div className="bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">700GB</div>
          <div className="text-sm text-secondary">Used</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">1.3TB</div>
          <div className="text-sm text-secondary">Available</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">2TB</div>
          <div className="text-sm text-secondary">Total</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => showNotification('Refreshing storage stats...', 'info')}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          <i className="fas fa-sync mr-2"></i>
          Refresh Stats
        </button>
        <button
          onClick={() => showNotification('Storage optimization complete!', 'success')}
          className="flex-1 px-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          <i className="fas fa-cog mr-2"></i>
          Optimize Storage
        </button>
      </div>
    </div>
  );
}
