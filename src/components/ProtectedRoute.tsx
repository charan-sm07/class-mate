import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import type { Enums } from '@/integrations/supabase/types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Enums<'app_role'>[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, role, loading } = useAuth();
  const { isDemo, demoRole } = useDemo();

  // In demo mode, bypass auth checks
  if (isDemo) {
    if (allowedRoles && demoRole && !allowedRoles.includes(demoRole)) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
