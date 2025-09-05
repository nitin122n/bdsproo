export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">BDS PRO</h1>
          <p className="text-gray-600">Welcome back to your trading platform</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Login Temporarily Disabled</h2>
            <p className="text-gray-600 mb-6">We're currently updating our authentication system. Please check back later.</p>
            <a 
              href="/" 
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
