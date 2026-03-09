import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Mail, Lock, ArrowRight, QrCode, BarChart3, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary">
        {/* Floating shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[10%] h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-[15%] right-[5%] h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-[50%] left-[60%] h-40 w-40 rounded-full bg-white/10 blur-xl" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">AttendEase</span>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight">
                Track attendance
                <br />
                <span className="text-white/70">smarter, not harder.</span>
              </h1>
              <p className="mt-4 text-white/60 text-lg max-w-md">
                QR codes, geofencing, and real-time analytics — all in one platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-6"
            >
              {[
                { icon: QrCode, label: 'QR Scan' },
                { icon: BarChart3, label: 'Analytics' },
                { icon: Shield, label: 'Secure' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-white/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <item.icon className="h-4 w-4 text-white/80" />
                  </div>
                  <span className="text-sm font-medium text-white/70">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-white/30 text-sm"
          >
            © {new Date().getFullYear()} AttendEase. Built for modern colleges.
          </motion.p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        <div className="absolute top-[20%] right-[10%] h-64 w-64 rounded-full gradient-primary opacity-[0.04] blur-[80px]" />
        <div className="absolute bottom-[20%] left-[10%] h-48 w-48 rounded-full gradient-secondary opacity-[0.04] blur-[60px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">AttendEase</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-3.5 h-4 w-4 transition-colors duration-200 ${focused === 'email' ? 'text-primary' : 'text-muted-foreground'}`} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className="pl-11 h-12 rounded-xl border-border bg-muted/30 transition-all duration-200 focus:bg-background focus:shadow-card"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-3.5 h-4 w-4 transition-colors duration-200 ${focused === 'password' ? 'text-primary' : 'text-muted-foreground'}`} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="pl-11 h-12 rounded-xl border-border bg-muted/30 transition-all duration-200 focus:bg-background focus:shadow-card"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-12 rounded-xl text-base font-semibold gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;