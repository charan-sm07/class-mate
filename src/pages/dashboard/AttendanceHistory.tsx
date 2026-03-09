import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText } from 'lucide-react';
import { exportToCSV } from '@/lib/exportCSV';
import { exportToPDF } from '@/lib/exportPDF';
import { demoAttendanceHistory, demoFacultySubjects } from '@/lib/demoData';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (isDemo) {
      setSubjects(demoFacultySubjects.map(s => ({ id: s.id, name: s.name, code: s.code })));
      setRecords(demoAttendanceHistory);
      return;
    }
    if (!user) return;
    supabase.from('subjects').select('id, name, code').eq('faculty_id', user.id).then(({ data }) => setSubjects(data || []));
  }, [user, isDemo]);

  useEffect(() => {
    if (isDemo) {
      let filtered = [...demoAttendanceHistory];
      if (selectedSubject !== 'all') {
        const sub = demoFacultySubjects.find(s => s.id === selectedSubject);
        if (sub) filtered = filtered.filter(r => r.subjects.name === sub.name);
      }
      setRecords(filtered);
      return;
    }
    if (!user) return;
    const fetchRecords = async () => {
      let query = supabase
        .from('attendance_records')
        .select('*, subjects(name, code)')
        .eq('marked_by', user.id)
        .order('date', { ascending: false });

      if (selectedSubject !== 'all') query = query.eq('subject_id', selectedSubject);
      if (dateFrom) query = query.gte('date', dateFrom);
      if (dateTo) query = query.lte('date', dateTo);

      const { data } = await query.limit(200);
      
      if (data) {
        const studentIds = [...new Set(data.map(r => r.student_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, roll_number')
          .in('user_id', studentIds);
        
        const profileMap: Record<string, any> = {};
        (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
        
        setRecords(data.map(r => ({ ...r, student_profile: profileMap[r.student_id] })));
      } else {
        setRecords([]);
      }
    };
    fetchRecords();
  }, [user, selectedSubject, dateFrom, dateTo, isDemo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Attendance History</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => exportToCSV(
            records.map(r => ({
              Date: r.date,
              Student: (r as any).student_profile?.full_name || '',
              'Roll No': (r as any).student_profile?.roll_number || '',
              Subject: r.subjects?.name || '',
              Status: r.status,
              'QR Verified': r.qr_verified ? 'Yes' : 'No',
            })),
            'attendance_history'
          )} disabled={records.length === 0}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => exportToPDF(
            records.map(r => ({
              Date: r.date,
              Student: (r as any).student_profile?.full_name || '',
              'Roll No': (r as any).student_profile?.roll_number || '',
              Subject: r.subjects?.name || '',
              Status: r.status,
            })),
            'attendance_history',
            'Attendance History Report'
          )} disabled={records.length === 0}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Records ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead><TableHead>Student</TableHead><TableHead>Roll No</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>QR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium text-sm">{(r as any).student_profile?.full_name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{(r as any).student_profile?.roll_number || '—'}</TableCell>
                    <TableCell className="text-sm">{r.subjects?.name}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'present' ? 'default' : r.status === 'late' ? 'secondary' : 'destructive'}
                        className={r.status === 'present' ? 'bg-success' : ''}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.qr_verified ? '✓' : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHistory;
