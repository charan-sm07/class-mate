import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { demoFacultySubjects, demoMarkAttendanceStudents } from '@/lib/demoData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const MarkAttendance = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setSubjects(demoFacultySubjects);
      return;
    }
    if (!user) return;
    supabase.from('subjects').select('*, classes(id, name)').eq('faculty_id', user.id).then(({ data }) => {
      setSubjects(data || []);
    });
  }, [user, isDemo]);

  useEffect(() => {
    if (!selectedSubject) return;
    if (isDemo) {
      setStudents(demoMarkAttendanceStudents);
      const initial: Record<string, 'present' | 'absent'> = {};
      demoMarkAttendanceStudents.forEach(p => { initial[p.user_id] = 'present'; });
      setAttendance(initial);
      return;
    }
    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject?.class_id) return;

    const fetchStudents = async () => {
      const { data: studentRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'student');
      if (!studentRoles) return;
      const studentIds = studentRoles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentIds)
        .eq('class_id', subject.class_id);
      
      setStudents(profiles || []);
      const initial: Record<string, 'present' | 'absent'> = {};
      (profiles || []).forEach(p => { initial[p.user_id] = 'present'; });
      setAttendance(initial);
    };
    fetchStudents();
  }, [selectedSubject, subjects, isDemo]);

  const handleSubmit = async () => {
    if (isDemo) {
      toast.success(`Attendance saved for ${students.length} students! (demo)`);
      return;
    }
    if (!user || !selectedSubject) return;
    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject?.class_id) return;

    setSaving(true);
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: studentId,
      subject_id: selectedSubject,
      class_id: subject.class_id,
      marked_by: user.id,
      status,
    }));

    const { error } = await supabase.from('attendance_records').upsert(records, {
      onConflict: 'student_id,subject_id,date',
    });

    if (error) {
      toast.error('Failed to save attendance');
    } else {
      toast.success(`Attendance saved for ${records.length} students!`);
    }
    setSaving(false);
  };

  const toggleAttendance = (userId: string) => {
    setAttendance(prev => ({
      ...prev,
      [userId]: prev[userId] === 'present' ? 'absent' : 'present',
    }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => { updated[s.user_id] = status; });
    setAttendance(updated);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger><SelectValue placeholder="Choose a subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} - {s.classes?.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card className="border-0 shadow-card">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-display">Students ({students.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll('present')}>All Present</Button>
              <Button variant="outline" size="sm" onClick={() => markAll('absent')}>All Absent</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map(student => (
                <div
                  key={student.user_id}
                  className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleAttendance(student.user_id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={attendance[student.user_id] === 'present'}
                      onCheckedChange={() => toggleAttendance(student.user_id)}
                    />
                    <div>
                      <p className="font-medium text-sm">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground">{student.roll_number || student.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    attendance[student.user_id] === 'present' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {attendance[student.user_id]}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="gradient" className="w-full mt-4" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarkAttendance;
