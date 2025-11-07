interface PaymentsSectionProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function PaymentsSection({ showNotification }: PaymentsSectionProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Stripe Payment Dashboard</h2>
      <p className="text-secondary mb-6">Payment processing configured and ready</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">$0.00</div>
          <div className="text-sm text-secondary">Total Revenue</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-sm text-secondary">Transactions</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-sm text-secondary">Active Subscriptions</div>
        </div>
      </div>

      <button
        onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
        className="w-full px-4 py-2 bg-[#635bff] text-white rounded-lg font-medium hover:bg-[#5149cc] transition-colors"
      >
        <i className="fas fa-external-link-alt mr-2"></i>
        Open Stripe Dashboard
      </button>
    </div>
  );
}
