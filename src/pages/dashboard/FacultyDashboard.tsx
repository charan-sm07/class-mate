import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Users, ClipboardCheck, TrendingUp, Inbox } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { demoFacultySubjects, demoFacultyAttendance } from '@/lib/demoData';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (isDemo) {
      setSubjects(demoFacultySubjects);
      setRecentAttendance(demoFacultyAttendance);
      return;
    }
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: subs } = await supabase.from('subjects').select('*, classes(name)').eq('faculty_id', user.id);
      setSubjects(subs || []);

      const { data: records } = await supabase
        .from('attendance_records')
        .select('date, status')
        .eq('marked_by', user.id)
        .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);

      if (records) {
        const grouped: Record<string, { present: number; absent: number }> = {};
        records.forEach(r => {
          if (!grouped[r.date]) grouped[r.date] = { present: 0, absent: 0 };
          if (r.status === 'present') grouped[r.date].present++;
          else grouped[r.date].absent++;
        });
        setRecentAttendance(
          Object.entries(grouped).map(([date, counts]) => ({
            date: new Date(date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
            ...counts,
          }))
        );
      }
      setLoading(false);
    };
    fetchData();
  }, [user, isDemo]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-0 shadow-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-12" /></div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">My Subjects</p><p className="text-3xl font-display font-bold">{subjects.length}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary"><BookOpen className="h-6 w-6 text-primary-foreground" /></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Classes Today</p><p className="text-3xl font-display font-bold">{subjects.length}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-secondary"><Users className="h-6 w-6 text-secondary-foreground" /></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Records This Week</p><p className="text-3xl font-display font-bold">{recentAttendance.reduce((s, d) => s + d.present + d.absent, 0)}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent"><ClipboardCheck className="h-6 w-6 text-accent-foreground" /></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
              <p className="text-3xl font-display font-bold">
                {recentAttendance.length > 0
                  ? Math.round((recentAttendance.reduce((s, d) => s + d.present, 0) / Math.max(recentAttendance.reduce((s, d) => s + d.present + d.absent, 0), 1)) * 100) + '%'
                  : 'N/A'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero"><TrendingUp className="h-6 w-6 text-primary-foreground" /></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader><CardTitle className="font-display">Weekly Attendance Overview</CardTitle></CardHeader>
        <CardContent>
          {recentAttendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ClipboardCheck className="h-10 w-10 mb-2 opacity-40" /><p className="text-sm">No attendance records this week</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="date" /><YAxis /><Tooltip />
                <Bar dataKey="present" fill="hsl(145, 65%, 42%)" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader><CardTitle className="font-display">My Subjects</CardTitle></CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-40" /><p className="text-sm">No subjects assigned yet</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {subjects.map(sub => (
                <div key={sub.id} className="rounded-xl border border-border p-4 hover:shadow-card transition-shadow">
                  <p className="font-semibold">{sub.name}</p>
                  <p className="text-sm text-muted-foreground">{sub.code} • {sub.classes?.name || 'No class'}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyDashboard;
