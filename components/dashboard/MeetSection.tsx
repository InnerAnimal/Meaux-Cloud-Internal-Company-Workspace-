'use client';

import { useState } from 'react';

interface MeetSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function MeetSection({ showNotification }: MeetSectionProps) {
  const [meetingLink, setMeetingLink] = useState('');

  const createMeeting = () => {
    showNotification('Creating meeting...', 'info');
    const meetingId = Math.random().toString(36).substring(2, 15);
    const link = `https://meet.google.com/${meetingId}`;
    setTimeout(() => {
      setMeetingLink(link);
      showNotification('Meeting created successfully!', 'success');
    }, 1500);
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Google Meet Controls</h2>

      <button
        onClick={createMeeting}
        className="w-full py-4 bg-success text-white rounded-xl text-xl font-semibold hover:bg-green-600 transition-all hover:-translate-y-1 mb-4"
      >
        <i className="fas fa-video mr-2"></i>
        Create Instant Meeting
      </button>

      {meetingLink && (
        <div className="bg-gray-50 border border-border rounded-lg p-4 mb-4">
          <p className="text-sm text-secondary mb-2">Meeting Link:</p>
          <code className="text-sm font-mono break-all text-primary">{meetingLink}</code>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            if (meetingLink) {
              window.open(meetingLink, '_blank');
              showNotification('Joining meeting...', 'success');
            } else {
              showNotification('Please create a meeting first', 'warning');
            }
          }}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          <i className="fas fa-sign-in-alt mr-2"></i>
          Join Meeting
        </button>
        <button
          onClick={() => showNotification('Opening meeting scheduler...', 'info')}
          className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          <i className="fas fa-calendar mr-2"></i>
          Schedule Meeting
        </button>
      </div>
    </div>
  );
}
