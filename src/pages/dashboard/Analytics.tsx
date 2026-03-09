import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { demoAnalyticsData, demoDepartments } from '@/lib/demoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { exportToCSV } from '@/lib/exportCSV';
import { exportToPDF } from '@/lib/exportPDF';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['hsl(145, 65%, 42%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(250, 85%, 60%)'];

const Analytics = () => {
  const { isDemo } = useDemo();
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [topAbsentees, setTopAbsentees] = useState<any[]>([]);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    if (isDemo) {
      setDepartments(demoDepartments);
      setDailyData(demoAnalyticsData.dailyData);
      setMonthlyData(demoAnalyticsData.monthlyData);
      setSubjectData(demoAnalyticsData.subjectData);
      setStatusData(demoAnalyticsData.statusData);
      setDeptData(demoAnalyticsData.deptData);
      setTopAbsentees(demoAnalyticsData.topAbsentees);
      setOverallPercentage(demoAnalyticsData.overallPercentage);
      return;
    }
    supabase.from('departments').select('*').order('name').then(({ data }) => setDepartments(data || []));
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) return;
    const fetchAnalytics = async () => {
      const { data: records } = await supabase
        .from('attendance_records')
        .select('date, status, subject_id, student_id, subjects(name, department_id)');
      if (!records) return;

      const filtered = selectedDept === 'all' ? records : records.filter((r: any) => r.subjects?.department_id === selectedDept);

      const totalPresent = filtered.filter((r: any) => r.status === 'present' || r.status === 'late').length;
      setOverallPercentage(filtered.length > 0 ? Math.round((totalPresent / filtered.length) * 100) : 0);

      const daily: Record<string, { present: number; absent: number; late: number }> = {};
      filtered.forEach((r: any) => {
        if (!daily[r.date]) daily[r.date] = { present: 0, absent: 0, late: 0 };
        daily[r.date][r.status as 'present' | 'absent' | 'late']++;
      });
      setDailyData(
        Object.entries(daily).sort(([a], [b]) => a.localeCompare(b)).slice(-14)
          .map(([date, counts]) => ({ date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }), ...counts }))
      );

      const monthly: Record<string, { present: number; total: number }> = {};
      filtered.forEach((r: any) => {
        const month = new Date(r.date).toLocaleDateString('en', { month: 'short', year: '2-digit' });
        if (!monthly[month]) monthly[month] = { present: 0, total: 0 };
        monthly[month].total++;
        if (r.status === 'present' || r.status === 'late') monthly[month].present++;
      });
      setMonthlyData(Object.entries(monthly).map(([month, { present, total }]) => ({
        month, percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      })));

      const bySub: Record<string, { name: string; present: number; total: number }> = {};
      filtered.forEach((r: any) => {
        const key = r.subject_id;
        if (!bySub[key]) bySub[key] = { name: r.subjects?.name || 'Unknown', present: 0, total: 0 };
        bySub[key].total++;
        if (r.status === 'present' || r.status === 'late') bySub[key].present++;
      });
      setSubjectData(Object.values(bySub).map(s => ({ ...s, percentage: Math.round((s.present / s.total) * 100) })));

      const statusCounts = { Present: 0, Absent: 0, Late: 0 };
      filtered.forEach((r: any) => {
        if (r.status === 'present') statusCounts.Present++;
        else if (r.status === 'absent') statusCounts.Absent++;
        else statusCounts.Late++;
      });
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      if (selectedDept === 'all') {
        const byDept: Record<string, { name: string; present: number; total: number }> = {};
        records?.forEach((r: any) => {
          const deptId = r.subjects?.department_id;
          if (!deptId) return;
          if (!byDept[deptId]) {
            const dept = departments.find(d => d.id === deptId);
            byDept[deptId] = { name: dept?.name || 'Unknown', present: 0, total: 0 };
          }
          byDept[deptId].total++;
          if (r.status === 'present' || r.status === 'late') byDept[deptId].present++;
        });
        setDeptData(Object.values(byDept).map(d => ({ ...d, percentage: Math.round((d.present / d.total) * 100) })));
      }

      const byStudent: Record<string, { present: number; total: number }> = {};
      filtered.forEach((r: any) => {
        if (!byStudent[r.student_id]) byStudent[r.student_id] = { present: 0, total: 0 };
        byStudent[r.student_id].total++;
        if (r.status === 'present' || r.status === 'late') byStudent[r.student_id].present++;
      });
      const absentees = Object.entries(byStudent)
        .filter(([, v]) => v.total >= 3)
        .map(([id, v]) => ({ student_id: id, percentage: Math.round((v.present / v.total) * 100), total: v.total }))
        .filter(s => s.percentage < 75)
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 10);

      if (absentees.length > 0) {
        const ids = absentees.map(a => a.student_id);
        const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, roll_number').in('user_id', ids);
        const profileMap: Record<string, any> = {};
        (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
        setTopAbsentees(absentees.map(a => ({ ...a, ...profileMap[a.student_id] })));
      } else {
        setTopAbsentees([]);
      }
    };

    fetchAnalytics();
  }, [selectedDept, departments, isDemo]);

  const exportData = dailyData.map(d => ({ Date: d.date, Present: d.present, Absent: d.absent, Late: d.late }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Analytics</h2>
          <p className="text-muted-foreground text-sm">Comprehensive attendance analytics</p>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-64 space-y-1">
            <Label className="text-xs">Filter by Department</Label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => exportToCSV(exportData, 'attendance_analytics')}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => exportToPDF(exportData, 'attendance_analytics', 'Attendance Analytics Report')}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
              <p className="text-3xl font-display font-bold">{overallPercentage}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-3xl font-display font-bold">{statusData.reduce((s, d) => s + d.value, 0)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-secondary">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Below 75%</p>
              <p className="text-3xl font-display font-bold text-destructive">{topAbsentees.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent">
              <AlertTriangle className="h-6 w-6 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Daily Attendance (Last 14 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="hsl(145, 65%, 42%)" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Absent" />
                <Bar dataKey="late" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Monthly Attendance Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="percentage" stroke="hsl(250, 85%, 60%)" strokeWidth={3} dot={{ r: 5, fill: 'hsl(250, 85%, 60%)' }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Status Distribution</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Subject-wise Attendance</CardTitle></CardHeader>
          <CardContent>
            {subjectData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="percentage" fill="hsl(180, 60%, 50%)" radius={[0, 4, 4, 0]} name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDept === 'all' && deptData.length > 0 && (
        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display">Department-wise Attendance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="percentage" fill="hsl(250, 85%, 60%)" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {topAbsentees.length > 0 && (
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Top Absentee Students (Below 75%)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Total Classes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAbsentees.map(s => (
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

export default Analytics;
