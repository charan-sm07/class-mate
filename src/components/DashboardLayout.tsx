import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Users, BookOpen, QrCode, BarChart3, LogOut, Menu, X, GraduationCap, UserCog, Building2, ClipboardCheck, School, Settings, Moon, Sun, Activity, Play, FileText, CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoProfiles } from '@/lib/demoData';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { role: authRole, profile: authProfile, signOut } = useAuth();
  const { isDemo, demoRole, exitDemo } = useDemo();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = isDemo ? demoRole : authRole;
  const profile = isDemo ? demoProfiles[demoRole!] : authProfile;

  const navItems = {
    admin: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/dashboard/students', icon: Users, label: 'Students' },
      { to: '/dashboard/faculty', icon: UserCog, label: 'Faculty' },
      { to: '/dashboard/departments', icon: Building2, label: 'Departments' },
      { to: '/dashboard/classes', icon: School, label: 'Classes' },
      { to: '/dashboard/subjects', icon: BookOpen, label: 'Subjects' },
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/dashboard/monitoring', icon: Activity, label: 'Monitoring' },
      { to: '/dashboard/timetable', icon: CalendarDays, label: 'Timetable' },
    ],
    faculty: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/dashboard/sessions', icon: Play, label: 'Class Sessions' },
      { to: '/dashboard/mark-attendance', icon: ClipboardCheck, label: 'Mark Attendance' },
      { to: '/dashboard/qr-attendance', icon: QrCode, label: 'QR Attendance' },
      { to: '/dashboard/attendance-history', icon: BarChart3, label: 'History' },
      { to: '/dashboard/leave-requests', icon: FileText, label: 'Leave Requests' },
      { to: '/dashboard/timetable', icon: CalendarDays, label: 'Timetable' },
    ],
    student: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/dashboard/my-attendance', icon: ClipboardCheck, label: 'My Attendance' },
      { to: '/dashboard/scan-qr', icon: QrCode, label: 'Scan QR' },
      { to: '/dashboard/leave-requests', icon: FileText, label: 'Leave Requests' },
      { to: '/dashboard/timetable', icon: CalendarDays, label: 'Timetable' },
    ],
  };

  const items = role ? navItems[role] : [];
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const handleSignOut = async () => {
    if (isDemo) {
      exitDemo();
      navigate('/');
      return;
    }
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-sidebar-foreground">AttendEase</span>
          {isDemo && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">DEMO</Badge>}
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                location.pathname === item.to
                  ? "gradient-primary text-primary-foreground shadow-elevated"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3 rounded-xl p-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="gradient-secondary text-secondary-foreground text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{profile?.full_name}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{role}{isDemo ? ' (demo)' : ''}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" className="flex-1 justify-start gap-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> {isDemo ? 'Exit Demo' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b border-border px-6 glass sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-display font-semibold text-lg flex-1">
            {items.find(i => i.to === location.pathname)?.label || 'Dashboard'}
          </h2>
          {!isDemo && <NotificationBell />}
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
