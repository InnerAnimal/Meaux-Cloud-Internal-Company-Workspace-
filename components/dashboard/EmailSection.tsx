'use client';

import { useState } from 'react';
import EmailComposer from './EmailComposer';
import EmailHistory from './EmailHistory';
import DomainStatus from './DomainStatus';

interface EmailSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

type TabType = 'compose' | 'history' | 'domains';

export default function EmailSection({ showNotification }: EmailSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('compose');

  const tabs = [
    { id: 'compose' as TabType, label: 'Compose', icon: 'fa-edit' },
    { id: 'history' as TabType, label: 'History', icon: 'fa-history' },
    { id: 'domains' as TabType, label: 'Domains', icon: 'fa-globe' },
  ];

  return (
    <div className="space-y-6">
      {/* Email System Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Unified Email System</h2>
            <p className="text-blue-100 mb-4">
              Manage emails across all your domains in one place
            </p>
            <div className="flex gap-4 text-sm">
              <div className="bg-blue-400/30 backdrop-blur-sm rounded-lg px-4 py-2">
                <i className="fas fa-envelope mr-2"></i>
                <strong>3 Domains</strong> Configured
              </div>
              <div className="bg-blue-400/30 backdrop-blur-sm rounded-lg px-4 py-2">
                <i className="fas fa-paper-plane mr-2"></i>
                <strong>Resend API</strong> Powered
              </div>
              <div className="bg-blue-400/30 backdrop-blur-sm rounded-lg px-4 py-2">
                <i className="fas fa-dollar-sign mr-2"></i>
                <strong>$0-20/mo</strong> Cost
              </div>
            </div>
          </div>
          <div className="text-6xl opacity-20">
            <i className="fas fa-envelope-open-text"></i>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-border rounded-xl p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-secondary hover:bg-gray-100'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'compose' && (
          <EmailComposer showNotification={showNotification} />
        )}
        {activeTab === 'history' && (
          <EmailHistory showNotification={showNotification} />
        )}
        {activeTab === 'domains' && (
          <DomainStatus showNotification={showNotification} />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-blue-600"></i>
            </div>
            <h4 className="font-semibold">Documentation</h4>
          </div>
          <p className="text-sm text-secondary mb-3">
            Setup guide and best practices
          </p>
          <button
            onClick={() => {
              window.open('/docs/EMAIL-CONSOLIDATION-PLAN.md', '_blank');
            }}
            className="text-sm text-primary hover:underline font-medium"
          >
            View Setup Guide <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-green-600"></i>
            </div>
            <h4 className="font-semibold">Cost Savings</h4>
          </div>
          <p className="text-sm text-secondary mb-3">
            Save $40-160/month vs Google/iCloud
          </p>
          <p className="text-sm font-medium text-green-600">
            ~$672-1,920 yearly savings
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-external-link-alt text-purple-600"></i>
            </div>
            <h4 className="font-semibold">Resend Dashboard</h4>
          </div>
          <p className="text-sm text-secondary mb-3">
            Advanced analytics and settings
          </p>
          <button
            onClick={() => {
              window.open('https://resend.com/domains', '_blank');
            }}
            className="text-sm text-primary hover:underline font-medium"
          >
            Open Resend <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-primary mb-2">Setup Required</h4>
            <p className="text-sm text-secondary mb-3">
              To start using your unified email system, you need to:
            </p>
            <ol className="text-sm text-secondary space-y-2 ml-4 list-decimal">
              <li>Add your domains (<code className="bg-gray-100 px-2 py-1 rounded text-xs">inneranimals.com, meauxbility.org, meauxbility.com</code>) to Resend</li>
              <li>Configure DNS records (SPF, DKIM, DMARC) at your domain registrar</li>
              <li>Wait for DNS propagation (5-30 minutes)</li>
              <li>Verify domains using the "Domains" tab above</li>
              <li>Set up email forwarding via Cloudflare Email Routing (free)</li>
            </ol>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  window.open('https://resend.com/domains', '_blank');
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Domains in Resend
              </button>
              <button
                onClick={() => setActiveTab('domains')}
                className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                <i className="fas fa-check mr-2"></i>
                Check Verification Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
