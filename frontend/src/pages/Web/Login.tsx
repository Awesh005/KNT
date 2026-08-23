import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User as UserIcon, Lock, AlertCircle } from 'lucide-react';
import { dashboardPath } from '@/utils/portal';
import { useAuthStore } from '@/stores/authStore';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardBody, CardHeader } from '@/components/common/Card';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, verify2fa, isAuthenticated, isLoading, error, user, requires2fa, pendingVerification } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Redirect if already authenticated as a normal user
  useEffect(() => {
    if (isAuthenticated && user) {
      if (['Admin', 'Super Admin'].includes(user.role)) {
        useAuthStore.getState().logout();
        useAuthStore.setState({ error: 'Administrators must login via the Admin Portal.' });
      } else {
        const from = location.state?.from?.pathname || dashboardPath(user.role);
        navigate(from === '/' ? dashboardPath(user.role) : from);
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requires2fa) {
      try {
        await verify2fa(otp);
      } catch {
        // Error is already stored in authStore
      }
      return;
    }
    if (isLogin) {
      try {
        await login(email, password);
      } catch {
        // Error is already stored in authStore
      }
    } else {
      try {
        await register(name, email, password);
      } catch {
        // Error is already stored in authStore
      }
    }
  };

  return (
    <div className="min-h-screen bg-fog-gray flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-goldenrod/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-deep-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center mb-6 focus:outline-none">
            <img src="/KNT-Logo.png" alt="KNT World Welfare Foundation Logo" className="w-16 h-16 object-contain mb-2" />
            <span className="text-[14px] font-bold tracking-[0.2em] uppercase text-charcoal leading-none">
              KNT WORLD WELFARE
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-charcoal/70 mt-1">
              Foundation
            </span>
          </Link>
          <Typography variant="h2" className="!text-3xl">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </Typography>
          <Typography variant="body" className="mt-2 text-charcoal/60">
            {isLogin ? 'Sign in to manage your campaigns and donations.' : 'Join our community to start supporting causes.'}
          </Typography>
        </div>

        <Card className="border-charcoal/10 shadow-[0_24px_54px_rgba(15,26,22,0.12)]">
          <CardHeader className="flex flex-row p-0 border-b border-charcoal/10">
            <button
              type="button"
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                isLogin ? 'text-charcoal bg-charcoal/5 border-b-2 border-goldenrod' : 'text-charcoal/40 hover:text-charcoal hover:bg-fog-gray'
              }`}
              onClick={() => { setIsLogin(true); useAuthStore.setState({ error: null }) }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                !isLogin ? 'text-charcoal bg-charcoal/5 border-b-2 border-goldenrod' : 'text-charcoal/40 hover:text-charcoal hover:bg-fog-gray'
              }`}
              onClick={() => { setIsLogin(false); useAuthStore.setState({ error: null }) }}
            >
              Register
            </button>
          </CardHeader>
          
          <CardBody className="p-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {pendingVerification && !isLogin && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl text-sm">
                Account created. Check your email and verify before signing in.
              </div>
            )}
            {location.search.includes('verified=1') && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl text-sm">Email verified. You can sign in.</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {requires2fa ? (
                <Input label="Authenticator code" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              ) : (
                <>
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="pb-5">
                      <Input 
                        label="Full Name" 
                        placeholder="John Doe" 
                        type="text"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        icon={<UserIcon className="w-4 h-4" />}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Input 
                label="Email Address" 
                placeholder="hello@example.com" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />

              <Input 
                label="Password" 
                placeholder="••••••••" 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
              />

              {isLogin && (
                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-[11px] text-charcoal/60 hover:text-charcoal transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}
                </>
              )}

              <Button 
                type="submit" 
                className="w-full mt-2" 
                size="lg"
                isLoading={isLoading}
              >
                {requires2fa ? 'Verify code' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
              
            </form>

            <div className="mt-6 pt-6 border-t border-charcoal/10 text-center">
              <Typography variant="small" className="text-charcoal/50">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-charcoal hover:text-goldenrod transition-colors focus:outline-none"
                >
                  {isLogin ? 'Register now' : 'Sign in'}
                </button>
              </Typography>
            </div>
            
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
