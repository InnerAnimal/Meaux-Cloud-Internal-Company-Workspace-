'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import OverviewSection from '@/components/dashboard/OverviewSection';
import GmailSection from '@/components/dashboard/GmailSection';
import CalendarSection from '@/components/dashboard/CalendarSection';
import MeetSection from '@/components/dashboard/MeetSection';
import DriveSection from '@/components/dashboard/DriveSection';
import CloudSection from '@/components/dashboard/CloudSection';
import PaymentsSection from '@/components/dashboard/PaymentsSection';
import DatabaseSection from '@/components/dashboard/DatabaseSection';
import HostingSection from '@/components/dashboard/HostingSection';
import Notification from '@/components/ui/Notification';

export type Section = 'overview' | 'gmail' | 'calendar' | 'meet' | 'drive' | 'cloud' | 'payments' | 'database' | 'hosting';

export default function Dashboard() {
  const [currentSection, setCurrentSection] = useState<Section>('overview');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />

      <main className="flex-1 ml-0 md:ml-[280px] p-8">
        <Header />

        {currentSection === 'overview' && <OverviewSection setCurrentSection={setCurrentSection} showNotification={showNotification} />}
        {currentSection === 'gmail' && <GmailSection showNotification={showNotification} />}
        {currentSection === 'calendar' && <CalendarSection showNotification={showNotification} />}
        {currentSection === 'meet' && <MeetSection showNotification={showNotification} />}
        {currentSection === 'drive' && <DriveSection showNotification={showNotification} />}
        {currentSection === 'cloud' && <CloudSection showNotification={showNotification} />}
        {currentSection === 'payments' && <PaymentsSection showNotification={showNotification} />}
        {currentSection === 'database' && <DatabaseSection showNotification={showNotification} />}
        {currentSection === 'hosting' && <HostingSection showNotification={showNotification} />}
      </main>

      {notification && <Notification message={notification.message} type={notification.type} />}
    </div>
  );
}
