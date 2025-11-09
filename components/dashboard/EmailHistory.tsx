'use client';

import { useState, useEffect } from 'react';

interface EmailComposerProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface EmailRecord {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  last_event?: string;
}

export default function EmailHistory({ showNotification }: EmailComposerProps) {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/history');
      const data = await response.json();

      if (data.success) {
        setEmails(data.emails || []);
        if (data.note) {
          showNotification(data.note, 'info');
        }
      } else {
        showNotification('Failed to load email history', 'error');
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
      showNotification('Failed to load email history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      opened: 'bg-purple-100 text-purple-800',
      bounced: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };

    const color = status ? statusColors[status] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
    const displayStatus = status || 'sent';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Email History</h3>
        <button
          onClick={fetchEmails}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <i className={`fas fa-sync ${loading ? 'fa-spin' : ''} mr-2`}></i>
          Refresh
        </button>
      </div>

      {loading && emails.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-secondary">Loading email history...</p>
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-inbox text-6xl text-secondary mb-4"></i>
          <p className="text-secondary text-lg">No emails sent yet</p>
          <p className="text-secondary text-sm mt-2">
            Send your first email using the composer above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <div
              key={email.id}
              className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-primary">{email.subject}</h4>
                    {getStatusBadge(email.last_event)}
                  </div>
                  <div className="text-sm text-secondary">
                    <i className="fas fa-envelope mr-1"></i>
                    To: {Array.isArray(email.to) ? email.to.join(', ') : email.to}
                  </div>
                  <div className="text-sm text-secondary">
                    <i className="fas fa-user mr-1"></i>
                    From: {email.from}
                  </div>
                </div>
                <div className="text-xs text-secondary">
                  {formatDate(email.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  ID: {email.id.substring(0, 12)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <i className="fas fa-exclamation-triangle mr-2"></i>
        <strong>Note:</strong> Full email history with advanced filtering requires Resend Pro plan.
        Free plan shows recent emails only.
      </div>
    </div>
  );
}
