interface DriveSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function DriveSection({ showNotification }: DriveSectionProps) {
  const files = [
    {
      name: 'Project Proposal.pdf',
      type: 'PDF Document',
      modified: '2 hours ago',
      icon: 'fa-file-pdf',
    },
    {
      name: 'Logo Design.png',
      type: 'Image File',
      modified: '1 day ago',
      icon: 'fa-file-image',
    },
  ];

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Google Drive Files</h2>

      <div className="space-y-4">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 border-b border-border hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <i className={`fas ${file.icon}`}></i>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-primary">{file.name}</div>
              <div className="text-secondary text-sm">{file.type}</div>
              <div className="text-secondary text-xs">Last modified {file.modified}</div>
            </div>
            <div className="text-secondary text-xs">{file.modified}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => showNotification('Refreshing Drive files...', 'info')}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          <i className="fas fa-sync mr-2"></i>
          Refresh
        </button>
        <button
          onClick={() => showNotification('File upload ready', 'success')}
          className="px-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          <i className="fas fa-upload mr-2"></i>
          Upload File
        </button>
      </div>
    </div>
  );
}
