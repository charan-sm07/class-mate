import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { demoMonitoringData } from '@/lib/demoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, AlertTriangle, QrCode, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminMonitoring = () => {
  const { isDemo } = useDemo();
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [suspiciousFlags, setSuspiciousFlags] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState<any[]>([]);

  const fetchData = async () => {
    if (isDemo) {
      setLiveSessions(demoMonitoringData.liveSessions);
      setSuspiciousFlags(demoMonitoringData.suspiciousFlags);
      setRecentAttendance(demoMonitoringData.recentAttendance);
      setLowAttendanceStudents(demoMonitoringData.lowAttendanceStudents);
      return;
    }

    const { data: sessions } = await supabase
      .from('class_sessions')
      .select('*, subjects(name, code), classes(name)')
      .eq('session_status', 'active')
      .order('created_at', { ascending: false });
    setLiveSessions(sessions || []);

    const { data: flags } = await supabase
      .from('suspicious_flags')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (flags && flags.length > 0) {
      const studentIds = [...new Set(flags.map(f => f.student_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').in('user_id', studentIds);
      const profileMap: Record<string, string> = {};
      (profiles || []).forEach(p => { profileMap[p.user_id] = p.full_name; });
      setSuspiciousFlags(flags.map(f => ({ ...f, student_name: profileMap[f.student_id] || 'Unknown' })));
    } else {
      setSuspiciousFlags([]);
    }

    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: recent } = await supabase
      .from('attendance_records')
      .select('*, subjects(name)')
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: false })
      .limit(20);
    
    if (recent && recent.length > 0) {
      const studentIds = [...new Set(recent.map(r => r.student_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, roll_number').in('user_id', studentIds);
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
      setRecentAttendance(recent.map(r => ({ ...r, student_profile: profileMap[r.student_id] })));
    } else {
      setRecentAttendance([]);
    }

    const { data: allRecords } = await supabase.from('attendance_records').select('student_id, status');
    if (allRecords) {
      const byStudent: Record<string, { present: number; total: number }> = {};
      allRecords.forEach(r => {
        if (!byStudent[r.student_id]) byStudent[r.student_id] = { present: 0, total: 0 };
        byStudent[r.student_id].total++;
        if (r.status === 'present' || r.status === 'late') byStudent[r.student_id].present++;
      });
      const lowStudents = Object.entries(byStudent)
        .filter(([, v]) => v.total >= 5 && (v.present / v.total) * 100 < 75)
        .map(([id, v]) => ({ student_id: id, percentage: Math.round((v.present / v.total) * 100), total: v.total }))
        .sort((a, b) => a.percentage - b.percentage);

      if (lowStudents.length > 0) {
        const ids = lowStudents.map(s => s.student_id);
        const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, roll_number').in('user_id', ids);
        const profileMap: Record<string, any> = {};
        (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
        setLowAttendanceStudents(lowStudents.map(s => ({ ...s, ...profileMap[s.student_id] })));
      }
    }
  };

  useEffect(() => {
    fetchData();
    if (isDemo) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) return;
    const channel = supabase
      .channel('monitoring')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_sessions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suspicious_flags' }, () => fetchData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_records' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isDemo]);

  const resolveFlag = async (flagId: string) => {
    if (isDemo) {
      setSuspiciousFlags(prev => prev.filter(f => f.id !== flagId));
      toast.success('Flag resolved (demo)');
      return;
    }
    await supabase.from('suspicious_flags').update({ resolved: true } as any).eq('id', flagId);
    setSuspiciousFlags(prev => prev.filter(f => f.id !== flagId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Live Monitoring</h2>
        <p className="text-muted-foreground text-sm">Real-time attendance activity across campus</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Live Sessions</p>
              <p className="text-3xl font-display font-bold">{liveSessions.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Suspicious Alerts</p>
              <p className="text-3xl font-display font-bold text-destructive">{suspiciousFlags.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent">
              <AlertTriangle className="h-6 w-6 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Below 75%</p>
              <p className="text-3xl font-display font-bold">{lowAttendanceStudents.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-secondary">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <QrCode className="h-5 w-5" /> Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No active sessions right now</p>
          ) : (
            <div className="space-y-3">
              {liveSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">{(s as any).subjects?.name} ({(s as any).subjects?.code})</p>
                    <p className="text-sm text-muted-foreground">{(s as any).classes?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(s.start_time).toLocaleTimeString()} — {new Date(s.end_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground animate-pulse">LIVE</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {suspiciousFlags.length > 0 && (
        <Card className="border-0 shadow-card border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Suspicious Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspiciousFlags.map(f => (
                <div key={f.id} className="flex items-center justify-between rounded-xl bg-destructive/5 border border-destructive/20 p-4">
                  <div>
                    <p className="font-medium text-sm">{f.student_name}</p>
                    <p className="text-sm text-muted-foreground">{f.flag_type === 'same_location' ? 'Possible proxy attendance — same GPS location as another student' : f.flag_type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(f.created_at).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => resolveFlag(f.id)} className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Recent Attendance (Last Hour)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentAttendance.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-sm">{r.student_profile?.full_name || '—'}</TableCell>
                    <TableCell className="text-sm">{r.subjects?.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'present' ? 'default' : 'destructive'} className={r.status === 'present' ? 'bg-success' : ''}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.qr_verified ? 'QR' : 'Manual'} {r.face_verified ? '+ Face' : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {lowAttendanceStudents.length > 0 && (
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Students Below 75% Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Classes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowAttendanceStudents.map(s => (
                  <TableRow key={s.student_id}>
                    <TableCell className="font-medium text-sm">{s.full_name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.roll_number || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{s.percentage}%</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminMonitoring;
