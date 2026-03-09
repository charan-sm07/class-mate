import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { demoSubjects, demoDepartments, demoClasses, demoFaculty } from '@/lib/demoData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const ManageSubjects = () => {
  const { isDemo } = useDemo();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', code: '', department_id: '', class_id: '', faculty_id: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAll = async () => {
    if (isDemo) {
      setSubjects(demoSubjects);
      setDepartments(demoDepartments);
      setClasses(demoClasses);
      setFaculty(demoFaculty.map(f => ({ user_id: f.user_id, full_name: f.full_name })));
      return;
    }
    const [s, d, c] = await Promise.all([
      supabase.from('subjects').select('*, departments(name), classes(name)').order('name'),
      supabase.from('departments').select('*').order('name'),
      supabase.from('classes').select('*').order('name'),
    ]);
    setSubjects(s.data || []);
    setDepartments(d.data || []);
    setClasses(c.data || []);

    const { data: facultyRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'faculty');
    if (facultyRoles?.length) {
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').in('user_id', facultyRoles.map(r => r.user_id));
      setFaculty(profiles || []);
    }
  };

  useEffect(() => { fetchAll(); }, [isDemo]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim() || !form.department_id) { toast.error('Fill required fields'); return; }
    if (isDemo) {
      toast.success(editId ? 'Subject updated (demo)' : 'Subject created (demo)');
      setForm({ name: '', code: '', department_id: '', class_id: '', faculty_id: '' }); setEditId(null); setDialogOpen(false);
      return;
    }
    const payload = {
      name: form.name, code: form.code, department_id: form.department_id,
      class_id: form.class_id || null, faculty_id: form.faculty_id || null,
    };
    if (editId) {
      const { error } = await supabase.from('subjects').update(payload).eq('id', editId);
      if (error) { toast.error(error.message); return; }
      toast.success('Subject updated');
    } else {
      const { error } = await supabase.from('subjects').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Subject created');
    }
    setForm({ name: '', code: '', department_id: '', class_id: '', faculty_id: '' }); setEditId(null); setDialogOpen(false);
    fetchAll();
  };

  const handleEdit = (sub: any) => {
    setForm({ name: sub.name, code: sub.code, department_id: sub.department_id, class_id: sub.class_id || '', faculty_id: sub.faculty_id || '' });
    setEditId(sub.id); setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) { toast.success('Subject deleted (demo)'); return; }
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Subject deleted'); fetchAll();
  };

  const openNew = () => { setForm({ name: '', code: '', department_id: '', class_id: '', faculty_id: '' }); setEditId(null); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Subjects</h2>
          <p className="text-muted-foreground text-sm">Manage subjects and assign faculty</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Add Subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editId ? 'Edit' : 'Add'} Subject</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Subject Name*</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Data Structures" /></div>
              <div className="space-y-2"><Label>Code*</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="CS201" /></div>
              <div className="space-y-2"><Label>Department*</Label>
                <Select value={form.department_id} onValueChange={v => setForm(f => ({ ...f, department_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Class</Label>
                <Select value={form.class_id} onValueChange={v => setForm(f => ({ ...f, class_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select class (optional)" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - Year {c.year}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Faculty</Label>
                <Select value={form.faculty_id} onValueChange={v => setForm(f => ({ ...f, faculty_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Assign faculty (optional)" /></SelectTrigger>
                  <SelectContent>{faculty.map(f => <SelectItem key={f.user_id} value={f.user_id}>{f.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button variant="gradient" className="w-full" onClick={handleSave}>{editId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4 opacity-50" /><p>No subjects yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead><TableHead>Code</TableHead><TableHead>Department</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell><span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-md text-xs font-semibold">{s.code}</span></TableCell>
                    <TableCell className="text-sm">{s.departments?.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.classes?.name || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
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

export default ManageSubjects;
