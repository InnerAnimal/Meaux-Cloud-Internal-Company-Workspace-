'use client';

import { useState, useEffect } from 'react';

interface DomainStatusProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface Domain {
  id: string;
  name: string;
  status: string;
  created_at: string;
  region?: string;
  records?: {
    record: string;
    name: string;
    type: string;
    value: string;
    status: string;
  }[];
}

const CONFIGURED_DOMAINS = [
  'inneranimals.com',
  'meauxbility.org',
  'meauxbility.com',
];

export default function DomainStatus({ showNotification }: DomainStatusProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/domains');
      const data = await response.json();

      if (data.success) {
        setDomains(data.domains || []);
      } else {
        showNotification('Failed to load domain status', 'error');
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      showNotification('Failed to load domain status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async (domain: string) => {
    setVerifying(domain);
    try {
      const response = await fetch('/api/email/domains/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification(`Domain ${domain} verified successfully!`, 'success');
        fetchDomains(); // Refresh the list
      } else {
        showNotification(data.error || 'Failed to verify domain', 'error');
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      showNotification('Failed to verify domain', 'error');
    } finally {
      setVerifying(null);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'verified' || status === 'success') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <i className="fas fa-check-circle mr-1"></i>
          Verified
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          <i className="fas fa-clock mr-1"></i>
          Pending
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        <i className="fas fa-times-circle mr-1"></i>
        Not Verified
      </span>
    );
  };

  const getDomainStatus = (domainName: string) => {
    const domain = domains.find(d => d.name === domainName);
    return domain ? domain.status : 'not-added';
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Domain Verification</h3>
        <button
          onClick={fetchDomains}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <i className={`fas fa-sync ${loading ? 'fa-spin' : ''} mr-2`}></i>
          Refresh
        </button>
      </div>

      {loading && domains.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-secondary">Loading domains...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-secondary text-sm uppercase tracking-wide">
              Configured Domains
            </h4>
            {CONFIGURED_DOMAINS.map((domainName) => {
              const domain = domains.find(d => d.name === domainName);
              const status = getDomainStatus(domainName);
              const isVerified = status === 'verified' || status === 'success';

              return (
                <div
                  key={domainName}
                  className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-globe text-2xl text-primary"></i>
                      <div>
                        <h5 className="font-semibold text-primary">{domainName}</h5>
                        {domain && (
                          <p className="text-xs text-secondary">
                            Added {new Date(domain.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {domain ? (
                        <>
                          {getStatusBadge(domain.status)}
                          {!isVerified && (
                            <button
                              onClick={() => verifyDomain(domainName)}
                              disabled={verifying === domainName}
                              className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {verifying === domainName ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-1"></i>
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-check mr-1"></i>
                                  Verify DNS
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          Not Added to Resend
                        </span>
                      )}
                    </div>
                  </div>

                  {domain && domain.records && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs">
                      <p className="font-medium text-secondary mb-2">DNS Records:</p>
                      <div className="space-y-1">
                        {domain.records.map((record, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {record.status === 'verified' || record.status === 'success' ? (
                              <i className="fas fa-check-circle text-green-600"></i>
                            ) : (
                              <i className="fas fa-exclamation-circle text-yellow-600"></i>
                            )}
                            <span className="font-mono text-secondary">
                              {record.type}: {record.record}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!domain && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                      <i className="fas fa-info-circle mr-1"></i>
                      Add this domain in your Resend dashboard first, then refresh this page.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {domains.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-semibold text-secondary text-sm uppercase tracking-wide mb-4">
                All Domains in Resend ({domains.length})
              </h4>
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg text-sm"
                  >
                    <span className="font-medium">{domain.name}</span>
                    {getStatusBadge(domain.status)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <strong>Setup Required:</strong> Add your domains to Resend and configure DNS records.
            See <code className="bg-yellow-100 px-2 py-1 rounded">docs/EMAIL-CONSOLIDATION-PLAN.md</code> for instructions.
          </div>
        </>
      )}
    </div>
  );
}
