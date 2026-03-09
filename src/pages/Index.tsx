import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, QrCode, BarChart3, Shield, ArrowRight,
  MapPin, Bell, Users, CheckCircle2, Smartphone, Clock,
  Zap, Star, ChevronRight, Play
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const stats = [
  { value: '99.9%', label: 'Uptime', icon: Zap },
  { value: '<2s', label: 'QR Scan Speed', icon: QrCode },
  { value: '200m', label: 'Geofence Radius', icon: MapPin },
  { value: '3', label: 'Role Dashboards', icon: Users },
];

const features = [
  { icon: QrCode, title: 'QR Code Attendance', desc: 'Generate rotating, time-limited QR codes. Students scan to mark attendance in seconds.', color: 'primary' },
  { icon: MapPin, title: 'GPS Geofencing', desc: 'Verify students are physically present within a 200m campus radius.', color: 'secondary' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Track daily, monthly, subject-wise attendance trends with interactive dashboards.', color: 'accent' },
  { icon: Shield, title: 'Fraud Detection', desc: 'Automatic detection of duplicate GPS coordinates and suspicious patterns.', color: 'primary' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Automated notifications when attendance drops below 75%.', color: 'secondary' },
  { icon: Users, title: 'Role-Based Access', desc: 'Separate dashboards for Admin, Faculty, and Students with secure access.', color: 'accent' },
];

const howItWorks = [
  { step: '01', title: 'Faculty Creates Session', desc: 'Start a class session and generate a rotating QR code.', icon: Clock },
  { step: '02', title: 'Students Scan QR', desc: 'Students scan the QR code within the geofenced campus area.', icon: Smartphone },
  { step: '03', title: 'Multi-Step Verification', desc: 'GPS location verifies the student is physically present.', icon: CheckCircle2 },
  { step: '04', title: 'Instant Analytics', desc: 'Real-time data flows into analytics dashboards for all roles.', icon: BarChart3 },
];

const testimonials = [
  { name: 'Dr. Priya Sharma', role: 'HOD, Computer Science', text: 'AttendEase reduced proxy attendance by 95%. The QR + GPS combo is brilliant.' },
  { name: 'Rahul M.', role: 'Final Year Student', text: 'No more manual roll calls. Just scan and go — it saves so much time every class.' },
  { name: 'Prof. Arun Kumar', role: 'Faculty, ECE Dept', text: 'The analytics dashboard gives me instant insights. I can track trends in real-time.' },
];

const Index = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50"
      >
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-elevated">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">AttendEase</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </nav>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="gradient" size="sm" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <div ref={heroRef} className="relative pt-24">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full gradient-primary opacity-[0.08] blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-40 -left-40 h-[500px] w-[500px] rounded-full gradient-secondary opacity-[0.06] blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full gradient-accent opacity-[0.06] blur-[100px]"
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div
            initial="hidden" animate="visible" custom={0} variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary mb-8 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Smart QR Attendance System
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold leading-[1.05] mb-6 tracking-tight"
          >
            Attendance
            <br />
            <span className="relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                Reimagined
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full gradient-primary origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            QR scans, GPS geofencing, and real-time analytics —
            all in one platform built for modern colleges.
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="gradient" size="lg" className="gap-2 text-base px-8 h-13 shadow-elevated" onClick={() => navigate('/signup')}>
              Start Free <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-13 gap-2" onClick={() => navigate('/demo')}>
              <Play className="h-4 w-4 fill-current" /> Try Demo
            </Button>
          </motion.div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="hidden lg:flex absolute top-32 -left-4 items-center gap-2 bg-card/80 backdrop-blur-lg border border-border rounded-2xl px-4 py-3 shadow-card"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Attendance</div>
              <div className="text-sm font-semibold">Verified ✓</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="hidden lg:flex absolute top-48 -right-4 items-center gap-2 bg-card/80 backdrop-blur-lg border border-border rounded-2xl px-4 py-3 shadow-card"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-xs text-muted-foreground">QR Scan</div>
              <div className="text-sm font-semibold">&lt;2s Speed</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 -mt-16">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label} custom={i} variants={fadeUp}
              className="group rounded-2xl bg-card/80 backdrop-blur-lg border border-border/60 p-6 text-center shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-center mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          custom={0} variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-widest mb-3">
            <Star className="h-4 w-4 fill-primary" /> Features
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-2">Everything You Need</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
            A complete attendance management system with powerful verification, analytics, and automation.
          </p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title} custom={i} variants={fadeUp}
              className="group relative rounded-2xl bg-card/60 backdrop-blur-sm p-8 border border-border/60 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${
                f.color === 'primary' ? 'from-primary/5 to-transparent' :
                f.color === 'secondary' ? 'from-secondary/5 to-transparent' :
                'from-accent/5 to-transparent'
              }`} />
              <div className="relative z-10">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110 ${
                  f.color === 'primary' ? 'gradient-primary' :
                  f.color === 'secondary' ? 'gradient-secondary' :
                  'gradient-accent'
                }`}>
                  <f.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={0} variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-secondary uppercase tracking-widest mb-3">
              <Zap className="h-4 w-4" /> How It Works
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-2">Four Simple Steps</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />

            {howItWorks.map((item, i) => (
              <motion.div key={item.step} custom={i} variants={fadeUp} className="relative text-center">
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-card mb-5">
                  <item.icon className="h-7 w-7 text-primary" />
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-primary-foreground">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-6xl mx-auto px-6 py-28">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          custom={0} variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-accent uppercase tracking-widest mb-3">
            <Users className="h-4 w-4" /> Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-2">Loved by Educators</h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name} custom={i} variants={fadeUp}
              className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/60 p-8 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 italic">"{t.text}"</p>
              <div>
                <div className="font-display font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          custom={0} variants={fadeUp}
          className="relative rounded-3xl gradient-primary p-12 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready to Transform Attendance?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Join colleges that have switched to smart, automated attendance tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-base gap-2 px-8 font-semibold"
                onClick={() => navigate('/signup')}
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-primary-foreground hover:bg-white/10 text-base px-8"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">AttendEase</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AttendEase</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
