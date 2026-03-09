import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck, TrendingUp, AlertTriangle, BookOpen, AlertCircle, Inbox } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { demoStudentRecords, demoStudentSubjectStats } from '@/lib/demoData';

const COLORS = ['hsl(145, 65%, 42%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)'];

const StudentDashboard = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [records, setRecords] = useState<any[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (isDemo) {
      setRecords(demoStudentRecords);
      setSubjectStats(demoStudentSubjectStats);
      return;
    }
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('attendance_records')
        .select('*, subjects(name, code)')
        .eq('student_id', user.id)
        .order('date', { ascending: false });

      if (data) {
        setRecords(data);
        const bySubject: Record<string, { name: string; present: number; total: number }> = {};
        data.forEach(r => {
          const key = r.subject_id;
          if (!bySubject[key]) bySubject[key] = { name: r.subjects?.name || 'Unknown', present: 0, total: 0 };
          bySubject[key].total++;
          if (r.status === 'present' || r.status === 'late') bySubject[key].present++;
        });
        setSubjectStats(Object.values(bySubject));
      }
      setLoading(false);
    };
    fetchData();
  }, [user, isDemo]);

  const totalPresent = records.filter(r => r.status === 'present' || r.status === 'late').length;
  const totalRecords = records.length;
  const percentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
  const isWarning = percentage < 75 && percentage >= 65 && totalRecords > 0;
  const isCritical = percentage < 65 && totalRecords > 0;

  const pieData = [
    { name: 'Present', value: records.filter(r => r.status === 'present').length || 0 },
    { name: 'Absent', value: records.filter(r => r.status === 'absent').length || 0 },
    { name: 'Late', value: records.filter(r => r.status === 'late').length || 0 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-0 shadow-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-14" /></div>
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
      {isCritical && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/15 border-2 border-destructive/30 p-4 animate-pulse">
          <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
          <div>
            <p className="font-bold text-destructive">CRITICAL: Attendance at {percentage}%!</p>
            <p className="text-sm text-destructive/80">Your attendance is critically low. Contact your faculty immediately.</p>
          </div>
        </div>
      )}
      {isWarning && (
        <div className="flex items-center gap-3 rounded-xl bg-warning/10 border border-warning/30 p-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Warning: Attendance at {percentage}%</p>
            <p className="text-sm text-muted-foreground">Your attendance is below 75%. Attend classes regularly.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Overall Attendance</p><p className="text-3xl font-display font-bold">{percentage}%</p></div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isCritical || isWarning ? 'gradient-accent' : 'gradient-primary'}`}>
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Classes</p><p className="text-3xl font-display font-bold">{totalRecords}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-secondary"><ClipboardCheck className="h-6 w-6 text-secondary-foreground" /></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Subjects</p><p className="text-3xl font-display font-bold">{subjectStats.length}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero"><BookOpen className="h-6 w-6 text-primary-foreground" /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Attendance Overview</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {totalRecords === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <Inbox className="h-10 w-10 mb-2 opacity-40" /><p className="text-sm">No attendance records yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Subject-wise Attendance</CardTitle></CardHeader>
          <CardContent>
            {subjectStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mb-2 opacity-40" /><p className="text-sm">No attendance records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectStats.map((s, i) => {
                  const pct = Math.round((s.present / s.total) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.present}/{s.total} classes</p></div>
                      <Badge variant={pct >= 75 ? 'default' : 'destructive'} className={pct >= 75 ? 'bg-success' : ''}>{pct}%</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader><CardTitle className="font-display">Recent Attendance</CardTitle></CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-40" /><p className="text-sm">No attendance records yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><p className="font-medium text-sm">{r.subjects?.name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p></div>
                  <div className="flex items-center gap-2">
                    {r.qr_verified && <span className="text-xs text-muted-foreground">QR</span>}
                    {r.face_verified && <span className="text-xs text-muted-foreground">Face</span>}
                    <Badge variant={r.status === 'present' ? 'default' : r.status === 'late' ? 'secondary' : 'destructive'} className={r.status === 'present' ? 'bg-success' : ''}>{r.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
