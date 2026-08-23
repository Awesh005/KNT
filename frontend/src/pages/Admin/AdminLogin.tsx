import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation, Link } from 'react-router';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, verify2fa, isLoading, error, isAuthenticated, user, requires2fa } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');

  // Redirect if already logged in as admin or reject if not admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin' || user.role === 'Super Admin') {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        useAuthStore.getState().logout();
        toast.error('Unauthorized access. Only administrators can access this portal.');
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requires2fa) {
      await verify2fa(otp);
      return;
    }
    if (!email || !password) return;
    try {
      await login(email, password);
    } catch {
      // Error is already stored in authStore; avoid uncaught promise in the console
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7]">
      {/* Left side - Branding/Image */}
      <div className="md:flex-1 bg-deep-green relative overflow-hidden flex flex-col items-center justify-center p-12 text-center hidden md:flex">
        {/* Abstract background blobs */}
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[140%] rounded-full bg-goldenrod/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[120%] rounded-full bg-black/20 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl shadow-lg mb-8 inline-block">
            <img src="/KNT-Logo.png" alt="KNT World Welfare Foundation" className="w-24 h-24 object-contain" />
          </div>
          <Typography variant="h1" className="text-white mb-4">
            Admin Portal
          </Typography>
          <Typography variant="body" className="text-white/80 max-w-md mx-auto">
            Secure access to manage campaigns, monitor donations, and oversee operations for KNT World Welfare Foundation.
          </Typography>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
        <div className="absolute top-6 right-6 md:top-8 md:right-8">
          <Link to="/" className="flex items-center text-charcoal/60 hover:text-deep-green text-sm font-bold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website
          </Link>
        </div>
        
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-deep-green/5 border border-charcoal/5">
          
          <div className="md:hidden flex flex-col items-center mb-8">
            <img src="/KNT-Logo.png" alt="KNT World Welfare Foundation" className="w-20 h-20 mb-4 object-contain" />
            <Typography variant="h2" className="text-deep-green">Admin Portal</Typography>
          </div>

          <div className="mb-8">
            <div className="w-12 h-12 bg-light-green text-deep-green rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <Typography variant="h3" className="mb-2">Welcome Back</Typography>
            <p className="text-charcoal/60 text-sm">Please sign in to your administrator account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-1.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {requires2fa ? (
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Authenticator code</label>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-charcoal/10 rounded-xl outline-none" placeholder="6-digit code" required />
              </div>
            ) : (
              <>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-charcoal mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal/40">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-charcoal text-sm"
                  placeholder="admin@kindsupport.org"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal/40">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-charcoal text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              </div>
              </>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full justify-center group"
              size="lg"
              disabled={isLoading || (requires2fa ? !otp : (!email || !password))}
            >
              {isLoading ? 'Authenticating...' : requires2fa ? 'Verify code' : 'Sign In to Portal'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-charcoal/5 text-center">
            <p className="text-xs text-charcoal/40 font-medium">
              Protected by Enterprise-grade Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
