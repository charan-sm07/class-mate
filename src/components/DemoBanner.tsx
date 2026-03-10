import { useDemo } from '@/contexts/DemoContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Shield, BookOpen, Users } from 'lucide-react';
import type { Enums } from '@/integrations/supabase/types';

type AppRole = Enums<'app_role'>;

const roleConfig: { role: AppRole; icon: typeof Shield; label: string }[] = [
  { role: 'admin', icon: Shield, label: 'Admin' },
  { role: 'faculty', icon: BookOpen, label: 'Faculty' },
  { role: 'student', icon: Users, label: 'Student' },
];

const DemoBanner = () => {
  const { isDemo, demoRole, startDemo, exitDemo } = useDemo();
  const navigate = useNavigate();

  if (!isDemo) return null;

  const switchRole = (role: AppRole) => {
    startDemo(role);
    navigate('/dashboard');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-3 bg-primary px-4 py-2 text-primary-foreground text-sm shadow-lg">
      <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground text-[10px]">DEMO</Badge>
      <span className="hidden sm:inline font-medium">Switch role:</span>
      <div className="flex gap-1.5">
        {roleConfig.map(r => (
          <Button
            key={r.role}
            size="sm"
            variant={demoRole === r.role ? 'secondary' : 'ghost'}
            className={demoRole !== r.role ? 'text-primary-foreground hover:bg-primary-foreground/20' : ''}
            onClick={() => switchRole(r.role)}
          >
            <r.icon className="h-3.5 w-3.5 mr-1.5" />
            {r.label}
          </Button>
        ))}
      </div>
      <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20 ml-2" onClick={() => { exitDemo(); navigate('/'); }}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DemoBanner;
