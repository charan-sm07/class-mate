import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { demoStudentRecords, demoMonthlyAttendance } from '@/lib/demoData';

const MyAttendance = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [records, setRecords] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    if (isDemo) {
      setRecords(demoStudentRecords);
      setMonthlyData(demoMonthlyAttendance);
      return;
    }
    if (!user) return;
    supabase
      .from('attendance_records')
      .select('*, subjects(name, code)')
      .eq('student_id', user.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setRecords(data);
          const monthly: Record<string, { present: number; absent: number }> = {};
          data.forEach(r => {
            const month = new Date(r.date).toLocaleDateString('en', { month: 'short', year: '2-digit' });
            if (!monthly[month]) monthly[month] = { present: 0, absent: 0 };
            if (r.status === 'present' || r.status === 'late') monthly[month].present++;
            else monthly[month].absent++;
          });
          setMonthlyData(Object.entries(monthly).map(([month, counts]) => ({ month, ...counts })).reverse());
        }
      });
  }, [user, isDemo]);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Monthly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(145, 65%, 42%)" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Attendance Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No records yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {records.map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium text-sm">{r.subjects?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      {r.qr_verified && ' • QR Verified'}
                    </p>
                  </div>
                  <Badge variant={r.status === 'present' ? 'default' : r.status === 'late' ? 'secondary' : 'destructive'}
                    className={r.status === 'present' ? 'bg-success' : ''}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAttendance;
