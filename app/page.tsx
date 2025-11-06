import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex items-center justify-center gap-4">
          <i className="fas fa-cloud text-6xl text-primary"></i>
          <h1 className="text-6xl font-bold text-primary">
            Meauxbility Cloud
          </h1>
        </div>

        <p className="text-2xl text-secondary">
          Internal Company Communications & Workspace
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/dashboard"
            className="p-8 bg-white border border-border rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <i className="fas fa-tachometer-alt text-4xl text-primary mb-4"></i>
            <h2 className="text-2xl font-semibold mb-2">Dashboard</h2>
            <p className="text-secondary">Access your cloud services dashboard</p>
          </Link>

          <div className="p-8 bg-white border border-border rounded-xl shadow-md">
            <i className="fas fa-shield-alt text-4xl text-success mb-4"></i>
            <h2 className="text-2xl font-semibold mb-2">Secure</h2>
            <p className="text-secondary">Enterprise-grade security and encryption</p>
          </div>

          <div className="p-8 bg-white border border-border rounded-xl shadow-md">
            <i className="fas fa-sync text-4xl text-warning mb-4"></i>
            <h2 className="text-2xl font-semibold mb-2">Real-time Sync</h2>
            <p className="text-secondary">All your services in one place</p>
          </div>

          <div className="p-8 bg-white border border-border rounded-xl shadow-md">
            <i className="fas fa-users text-4xl text-secondary mb-4"></i>
            <h2 className="text-2xl font-semibold mb-2">Team Collaboration</h2>
            <p className="text-secondary">Built for seamless teamwork</p>
          </div>
        </div>

        <div className="mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors shadow-lg"
          >
            <i className="fas fa-rocket"></i>
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
