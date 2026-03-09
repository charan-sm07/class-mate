import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, BookOpen, Users, ArrowLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Enums } from '@/integrations/supabase/types';

type AppRole = Enums<'app_role'>;

const roles: { role: AppRole; icon: typeof Shield; title: string; desc: string; gradient: string }[] = [
  { role: 'admin', icon: Shield, title: 'Admin', desc: 'Full platform access — manage departments, classes, faculty, students, and view analytics.', gradient: 'gradient-primary' },
  { role: 'faculty', icon: BookOpen, title: 'Faculty', desc: 'Create sessions, mark attendance via QR/manual, view history and leave requests.', gradient: 'gradient-secondary' },
  { role: 'student', icon: Users, title: 'Student', desc: 'Scan QR to mark attendance, view your stats, request leaves, and check timetable.', gradient: 'gradient-accent' },
];

const Demo = () => {
  const navigate = useNavigate();
  const { startDemo } = useDemo();

  const handleSelect = (role: AppRole) => {
    startDemo(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">AttendEase Demo</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <Play className="h-3.5 w-3.5 fill-primary text-primary" /> Demo Mode
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Choose a Role</h1>
          <p className="text-muted-foreground">
            Explore AttendEase with sample data. No account needed — pick a role to see the dashboard.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3 w-full max-w-3xl">
          {roles.map((r, i) => (
            <motion.div
              key={r.role}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
            >
              <Card
                className="group relative border-0 shadow-card overflow-hidden cursor-pointer hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                onClick={() => handleSelect(r.role)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${r.gradient}`}>
                    <r.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                  </div>
                  <Button variant="gradient" className="w-full mt-2 gap-2">
                    Enter as {r.title} <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Demo;
