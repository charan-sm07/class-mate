import React, { createContext, useContext, useState } from 'react';
import type { Enums } from '@/integrations/supabase/types';

type AppRole = Enums<'app_role'>;

interface DemoContextType {
  isDemo: boolean;
  demoRole: AppRole | null;
  startDemo: (role: AppRole) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemo, setIsDemo] = useState(false);
  const [demoRole, setDemoRole] = useState<AppRole | null>(null);

  const startDemo = (role: AppRole) => {
    setIsDemo(true);
    setDemoRole(role);
  };

  const exitDemo = () => {
    setIsDemo(false);
    setDemoRole(null);
  };

  return (
    <DemoContext.Provider value={{ isDemo, demoRole, startDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};
