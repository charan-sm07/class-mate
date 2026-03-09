import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from './dashboard/AdminDashboard';
import FacultyDashboard from './dashboard/FacultyDashboard';
import StudentDashboard from './dashboard/StudentDashboard';
import { useAttendanceNotifications } from '@/hooks/use-attendance-notifications';

const Dashboard = () => {
  const { role: authRole } = useAuth();
  const { isDemo, demoRole } = useDemo();
  const role = isDemo ? demoRole : authRole;

  useAttendanceNotifications();

  const renderDashboard = () => {
    switch (role) {
      case 'admin': return <AdminDashboard />;
      case 'faculty': return <FacultyDashboard />;
      case 'student': return <StudentDashboard />;
      default: return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
    }
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
};

export default Dashboard;
