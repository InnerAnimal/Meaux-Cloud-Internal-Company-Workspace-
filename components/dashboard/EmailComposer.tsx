'use client';

import { useState } from 'react';

interface EmailComposerProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onClose?: () => void;
}

const SENDER_ADDRESSES = [
  { email: 'info@inneranimals.com', name: 'Inner Animals', verified: true },
  { email: 'noreply@inneranimals.com', name: 'Inner Animals (No Reply)', verified: true },
  { email: 'sam@meauxbility.org', name: 'Sam - Meauxbility', verified: false },
  { email: 'contact@meauxbility.com', name: 'Meauxbility Contact', verified: false },
  { email: 'support@meauxbility.org', name: 'Meauxbility Support', verified: false },
];

export default function EmailComposer({ showNotification, onClose }: EmailComposerProps) {
  const [from, setFrom] = useState(SENDER_ADDRESSES[0].email);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [useHtml, setUseHtml] = useState(false);

  const handleSend = async () => {
    // Validate inputs
    if (!to.trim()) {
      showNotification('Please enter a recipient email address', 'error');
      return;
    }

    if (!subject.trim()) {
      showNotification('Please enter a subject', 'error');
      return;
    }

    if (!message.trim()) {
      showNotification('Please enter a message', 'error');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: to.split(',').map(e => e.trim()),
          subject,
          ...(useHtml ? { html: message } : { text: message }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Email sent successfully!', 'success');
        // Reset form
        setTo('');
        setSubject('');
        setMessage('');
        if (onClose) onClose();
      } else {
        showNotification(data.error || 'Failed to send email', 'error');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showNotification('Failed to send email. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleTestEmail = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: to || 'info@inneranimals.com',
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Test email sent! Check your inbox.', 'success');
      } else {
        showNotification(data.error || 'Failed to send test email', 'error');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showNotification('Failed to send test email', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Compose Email</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* From */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            From
          </label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          >
            {SENDER_ADDRESSES.map((sender) => (
              <option key={sender.email} value={sender.email}>
                {sender.name} ({sender.email}) {!sender.verified && '⚠️ Unverified'}
              </option>
            ))}
          </select>
          <p className="text-xs text-secondary mt-1">
            <i className="fas fa-info-circle mr-1"></i>
            Only verified domains can send emails. Add domains in Resend first.
          </p>
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            To
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com (separate multiple with commas)"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          />
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-secondary">
              Message
            </label>
            <label className="flex items-center text-sm text-secondary">
              <input
                type="checkbox"
                checked={useHtml}
                onChange={(e) => setUseHtml(e.target.checked)}
                className="mr-2"
                disabled={sending}
              />
              HTML Mode
            </label>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={useHtml ? '<h1>Your HTML content here...</h1>' : 'Your message here...'}
            rows={8}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            disabled={sending}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Send Email
              </>
            )}
          </button>
          <button
            onClick={handleTestEmail}
            disabled={sending}
            className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-flask mr-2"></i>
            Send Test
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          <strong>Note:</strong> Make sure your domain is verified in Resend before sending emails.
          Unverified domains will fail to send.
        </div>
      </div>
    </div>
  );
}
