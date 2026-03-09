import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpen, Building2, ClipboardCheck, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDemo } from '@/contexts/DemoContext';
import { demoAdminStats, demoAdminAttendance, demoAdminPieData } from '@/lib/demoData';

const COLORS = ['hsl(250, 85%, 60%)', 'hsl(180, 60%, 50%)', 'hsl(340, 80%, 58%)', 'hsl(38, 92%, 50%)'];

const AdminDashboard = () => {
  const { isDemo } = useDemo();
  const [stats, setStats] = useState({ students: 0, faculty: 0, departments: 0, subjects: 0 });
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (isDemo) {
      setStats(demoAdminStats);
      setAttendanceData(demoAdminAttendance);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      const [students, faculty, departments, subjects] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('user_roles').select('id', { count: 'exact' }).eq('role', 'faculty'),
        supabase.from('departments').select('id', { count: 'exact' }),
        supabase.from('subjects').select('id', { count: 'exact' }),
      ]);
      setStats({
        students: students.count || 0,
        faculty: faculty.count || 0,
        departments: departments.count || 0,
        subjects: subjects.count || 0,
      });

      const { data } = await supabase
        .from('attendance_records')
        .select('date, status')
        .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);

      if (data) {
        const grouped: Record<string, { present: number; absent: number; late: number }> = {};
        data.forEach(r => {
          if (!grouped[r.date]) grouped[r.date] = { present: 0, absent: 0, late: 0 };
          grouped[r.date][r.status as 'present' | 'absent' | 'late']++;
        });
        setAttendanceData(
          Object.entries(grouped).map(([date, counts]) => ({
            date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
            ...counts,
          }))
        );
      }
      setLoading(false);
    };

    fetchAll();
  }, [isDemo]);

  const statCards = [
    { label: 'Students', value: stats.students, icon: Users, gradient: 'gradient-primary' },
    { label: 'Faculty', value: stats.faculty, icon: BookOpen, gradient: 'gradient-secondary' },
    { label: 'Departments', value: stats.departments, icon: Building2, gradient: 'gradient-accent' },
    { label: 'Subjects', value: stats.subjects, icon: ClipboardCheck, gradient: 'gradient-hero' },
  ];

  const pieData = isDemo ? demoAdminPieData : [
    { name: 'Present', value: attendanceData.reduce((s, d) => s + d.present, 0) || 1 },
    { name: 'Absent', value: attendanceData.reduce((s, d) => s + d.absent, 0) || 0 },
    { name: 'Late', value: attendanceData.reduce((s, d) => s + d.late, 0) || 0 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-8 w-12" /></div>
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasNoData = !isDemo && stats.students === 0 && stats.faculty === 0 && stats.departments === 0;

  return (
    <div className="space-y-6">
      {hasNoData && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center">
          <LayoutDashboard className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="font-display font-semibold text-lg text-foreground">Welcome to AttendEase</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">Get started by adding departments, classes, subjects, and users from the sidebar menu.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => (
          <Card key={s.label} className="border-0 shadow-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-display font-bold mt-1">{s.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.gradient}`}>
                  <s.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Weekly Attendance</CardTitle></CardHeader>
          <CardContent>
            {attendanceData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <ClipboardCheck className="h-10 w-10 mb-2 opacity-40" /><p className="text-sm">No attendance data this week</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                  <XAxis dataKey="date" /><YAxis /><Tooltip />
                  <Bar dataKey="present" fill="hsl(145, 65%, 42%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Attendance Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
