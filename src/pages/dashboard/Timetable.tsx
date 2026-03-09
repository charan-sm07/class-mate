import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar, Clock, Inbox } from 'lucide-react';
import { demoTimetableSlots } from '@/lib/demoData';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS = [1, 2, 3, 4, 5, 6];

const Timetable = () => {
  const { user, role: authRole } = useAuth();
  const { isDemo, demoRole } = useDemo();
  const role = isDemo ? demoRole : authRole;
  const [slots, setSlots] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isDemo);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formFacultyId, setFormFacultyId] = useState('');
  const [formDay, setFormDay] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formRoom, setFormRoom] = useState('');

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (isDemo) {
      setSlots(demoTimetableSlots);
      setLoading(false);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from('timetable_slots')
        .select('*, subjects(name, code), classes(name, section), profiles!timetable_slots_faculty_id_fkey(full_name)')
        .order('day_of_week')
        .order('start_time');

      if (data) {
        const facIds = [...new Set(data.map((s: any) => s.faculty_id))];
        if (facIds.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', facIds as string[]);
          const profMap = new Map(profs?.map(p => [p.user_id, p.full_name]) || []);
          data.forEach((s: any) => { s.faculty_name = profMap.get(s.faculty_id) || 'Unknown'; });
        }
      }
      setSlots(data || []);
      setLoading(false);
    };

    const fetchMeta = async () => {
      const [{ data: cls }, { data: subs }] = await Promise.all([
        supabase.from('classes').select('id, name, section'),
        supabase.from('subjects').select('id, name, code, class_id, faculty_id'),
      ]);
      setClasses(cls || []);
      setSubjects(subs || []);

      const { data: facRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'faculty');
      if (facRoles) {
        const { data: facProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', facRoles.map(r => r.user_id));
        setFaculty(facProfiles || []);
      }
    };

    fetchSlots();
    if (isAdmin) fetchMeta();
  }, [user, role, isDemo]);

  useEffect(() => {
    if (isDemo) {
      if (role === 'student') setSelectedClass('class-1');
      return;
    }
    if (role === 'student' && user) {
      supabase.from('profiles').select('class_id').eq('user_id', user.id).single()
        .then(({ data }) => { if (data?.class_id) setSelectedClass(data.class_id); });
    }
  }, [user, role, isDemo]);

  const filteredSlots = role === 'student'
    ? slots.filter(s => s.class_id === selectedClass)
    : role === 'faculty'
    ? slots.filter(s => isDemo || s.faculty_id === user?.id)
    : selectedClass
    ? slots.filter(s => s.class_id === selectedClass)
    : slots;

  const handleAdd = async () => {
    if (!formClassId || !formSubjectId || !formFacultyId || !formDay || !formStart || !formEnd) {
      toast.error('Please fill all required fields');
      return;
    }
    if (isDemo) {
      toast.success('Timetable slot added (demo)');
      setDialogOpen(false);
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from('timetable_slots').insert({
      class_id: formClassId,
      subject_id: formSubjectId,
      faculty_id: formFacultyId,
      day_of_week: parseInt(formDay),
      start_time: formStart,
      end_time: formEnd,
      room: formRoom || null,
    });
    if (error) {
      toast.error('Failed to add slot');
    } else {
      toast.success('Timetable slot added');
      setDialogOpen(false);
      setFormClassId(''); setFormSubjectId(''); setFormFacultyId('');
      setFormDay(''); setFormStart(''); setFormEnd(''); setFormRoom('');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) {
      toast.success('Slot removed (demo)');
      setSlots(prev => prev.filter(s => s.id !== id));
      return;
    }
    const { error } = await (supabase as any).from('timetable_slots').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else toast.success('Slot removed');
  };

  const byDay = WEEKDAYS.reduce((acc, day) => {
    acc[day] = filteredSlots.filter(s => s.day_of_week === day)
      .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {} as Record<number, any[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Timetable</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage class timetables' : 'Your weekly schedule'}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && !isDemo && (
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} {c.section || ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isAdmin && !isDemo && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient" className="gap-2"><Plus className="h-4 w-4" /> Add Slot</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">Add Timetable Slot</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label>Class</Label>
                    <Select value={formClassId} onValueChange={setFormClassId}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.section || ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Select value={formSubjectId} onValueChange={setFormSubjectId}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects.filter(s => !formClassId || s.class_id === formClassId).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Faculty</Label>
                    <Select value={formFacultyId} onValueChange={setFormFacultyId}>
                      <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                      <SelectContent>
                        {faculty.map(f => <SelectItem key={f.user_id} value={f.user_id}>{f.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Day</Label>
                    <Select value={formDay} onValueChange={setFormDay}>
                      <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                      <SelectContent>
                        {WEEKDAYS.map(d => <SelectItem key={d} value={d.toString()}>{DAYS[d]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Start Time</Label><Input type="time" value={formStart} onChange={e => setFormStart(e.target.value)} /></div>
                    <div><Label>End Time</Label><Input type="time" value={formEnd} onChange={e => setFormEnd(e.target.value)} /></div>
                  </div>
                  <div><Label>Room (optional)</Label><Input placeholder="e.g. Room 201" value={formRoom} onChange={e => setFormRoom(e.target.value)} /></div>
                  <Button variant="gradient" className="w-full" onClick={handleAdd} disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Slot'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {filteredSlots.length === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Inbox className="h-12 w-12 mb-3 opacity-40" />
            <p className="font-medium">No timetable slots found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {WEEKDAYS.map(day => (
            <Card key={day} className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {DAYS[day]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(byDay[day] || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No classes</p>
                ) : (
                  (byDay[day] || []).map((slot: any) => (
                    <div key={slot.id} className="rounded-xl border border-border p-3 space-y-1 group relative">
                      <p className="font-medium text-sm">{slot.subjects?.name || 'Unknown'}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                      </div>
                      <p className="text-xs text-muted-foreground">{slot.faculty_name}</p>
                      {slot.room && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{slot.room}</Badge>
                      )}
                      {isAdmin && !isDemo && (
                        <Button
                          variant="ghost" size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => handleDelete(slot.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetable;
