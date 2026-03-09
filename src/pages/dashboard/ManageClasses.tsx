import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { demoClasses, demoDepartments } from '@/lib/demoData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const ManageClasses = () => {
  const { isDemo } = useDemo();
  const [classes, setClasses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', department_id: '', year: '1', section: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    if (isDemo) {
      setClasses(demoClasses);
      setDepartments(demoDepartments);
      return;
    }
    const [c, d] = await Promise.all([
      supabase.from('classes').select('*, departments(name)').order('name'),
      supabase.from('departments').select('*').order('name'),
    ]);
    setClasses(c.data || []);
    setDepartments(d.data || []);
  };

  useEffect(() => { fetchData(); }, [isDemo]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.department_id) { toast.error('Fill required fields'); return; }
    if (isDemo) {
      toast.success(editId ? 'Class updated (demo)' : 'Class created (demo)');
      setForm({ name: '', department_id: '', year: '1', section: '' }); setEditId(null); setDialogOpen(false);
      return;
    }
    const payload = { name: form.name, department_id: form.department_id, year: parseInt(form.year), section: form.section || null };
    if (editId) {
      const { error } = await supabase.from('classes').update(payload).eq('id', editId);
      if (error) { toast.error(error.message); return; }
      toast.success('Class updated');
    } else {
      const { error } = await supabase.from('classes').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Class created');
    }
    setForm({ name: '', department_id: '', year: '1', section: '' });
    setEditId(null); setDialogOpen(false); fetchData();
  };

  const handleEdit = (cls: any) => {
    setForm({ name: cls.name, department_id: cls.department_id, year: String(cls.year), section: cls.section || '' });
    setEditId(cls.id); setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) { toast.success('Class deleted (demo)'); return; }
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Class deleted'); fetchData();
  };

  const openNew = () => { setForm({ name: '', department_id: '', year: '1', section: '' }); setEditId(null); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Classes</h2>
          <p className="text-muted-foreground text-sm">Manage classes and sections</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Add Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editId ? 'Edit' : 'Add'} Class</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Class Name*</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="CS-A" /></div>
              <div className="space-y-2"><Label>Department*</Label>
                <Select value={form.department_id} onValueChange={v => setForm(f => ({ ...f, department_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Year*</Label>
                  <Select value={form.year} onValueChange={v => setForm(f => ({ ...f, year: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Section</Label><Input value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} placeholder="A" /></div>
              </div>
              <Button variant="gradient" className="w-full" onClick={handleSave}>{editId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mb-4 opacity-50" /><p>No classes yet. Add one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Year</TableHead><TableHead>Section</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm">{c.departments?.name}</TableCell>
                    <TableCell><span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-semibold">Year {c.year}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.section || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default ManageClasses;
