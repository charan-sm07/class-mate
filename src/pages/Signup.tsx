import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft,
  QrCode, BarChart3, Shield, IdCard, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { Enums } from '@/integrations/supabase/types';

const steps = ['Account', 'Details', 'Security'];

const getPasswordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
};

const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', 'bg-destructive', 'bg-destructive', 'bg-warning', 'bg-success', 'bg-success'];

const Signup = () => {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<Enums<'app_role'>>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const canNext = () => {
    if (step === 0) return fullName.trim().length >= 2 && email.includes('@');
    if (step === 1) return true; // studentId & role are optional/default
    if (step === 2) return password.length >= 6 && password === confirmPassword;
    return false;
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, fullName, role);
      toast.success('Account created! Check your email to confirm.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error('Google sign-up failed');
  };

  const inputClass = (field: string) =>
    `pl-11 h-12 rounded-xl border-border bg-muted/30 transition-all duration-200 ${
      focused === field ? 'bg-background shadow-card ring-2 ring-primary/20' : ''
    }`;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[8%] left-[8%] h-72 w-72 rounded-full bg-white/5 blur-2xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[12%] right-[5%] h-96 w-96 rounded-full bg-white/5 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 0.8, 1], y: [0, 40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[45%] left-[55%] h-48 w-48 rounded-full bg-white/10 blur-xl"
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
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
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">AttendEase</span>
          </motion.div>

          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight">
                Join AttendEase
              </h1>
              <p className="mt-4 text-white/60 text-lg max-w-md">
                Create your account to start tracking attendance smarter.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {[
                { icon: QrCode, title: 'QR Attendance', desc: 'Scan & mark in seconds' },
                { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track trends instantly' },
                { icon: Shield, title: 'Secure Data', desc: 'Role-based encrypted access' },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                    <item.icon className="h-5 w-5 text-white/80" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">{item.title}</p>
                    <p className="text-xs text-white/50">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/30 text-sm"
          >
            © {new Date().getFullYear()} AttendEase. Built for modern colleges.
          </motion.p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="absolute top-[15%] right-[8%] h-72 w-72 rounded-full gradient-primary opacity-[0.04] blur-[100px]" />
        <div className="absolute bottom-[15%] left-[8%] h-56 w-56 rounded-full gradient-accent opacity-[0.04] blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">AttendEase</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold">Create Account</h2>
            <p className="text-muted-foreground mt-2">Fill in your details to get started</p>
          </div>

          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {steps.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    i < step ? 'gradient-primary text-primary-foreground'
                    : i === step ? 'gradient-primary text-primary-foreground shadow-card scale-110'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <Progress value={((step + 1) / steps.length) * 100} className="h-1.5 rounded-full" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 2) setStep(step + 1);
              else handleSubmit();
            }}
          >
            <AnimatePresence mode="wait" custom={1}>
              {step === 0 && (
                <motion.div
                  key="step0"
                  custom={1}
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                    <div className="relative">
                      <User className={`absolute left-4 top-3.5 h-4 w-4 transition-colors ${focused === 'name' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Input
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        className={inputClass('name')}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">College Email</Label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-3.5 h-4 w-4 transition-colors ${focused === 'email' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Input
                        type="email"
                        placeholder="you@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        className={inputClass('email')}
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student / Faculty ID</Label>
                    <div className="relative">
                      <IdCard className={`absolute left-4 top-3.5 h-4 w-4 transition-colors ${focused === 'sid' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Input
                        placeholder="e.g. 21CS101"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        onFocus={() => setFocused('sid')}
                        onBlur={() => setFocused(null)}
                        className={inputClass('sid')}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as Enums<'app_role'>)}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-3.5 h-4 w-4 transition-colors ${focused === 'pw' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocused('pw')}
                        onBlur={() => setFocused(null)}
                        className={`${inputClass('pw')} pr-11`}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5 pt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-muted'}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${strength <= 2 ? 'text-destructive' : strength <= 3 ? 'text-warning' : 'text-success'}`}>
                          {strengthLabels[strength]}
                        </p>
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-3.5 h-4 w-4 transition-colors ${focused === 'cpw' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocused('cpw')}
                        onBlur={() => setFocused(null)}
                        className={`${inputClass('cpw')} pr-11`}
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground transition-colors">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <p className="text-xs text-destructive">Passwords don't match</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button type="button" variant="outline" className="h-12 rounded-xl gap-2 px-6" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              <Button
                type="submit"
                variant="gradient"
                className="flex-1 h-12 rounded-xl text-base font-semibold gap-2 group"
                disabled={!canNext() || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating...
                  </span>
                ) : step < 2 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google sign up */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl gap-3 text-sm font-medium"
            onClick={handleGoogleSignUp}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;