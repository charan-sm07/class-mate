import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { demoDepartments } from '@/lib/demoData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const ManageDepartments = () => {
  const { isDemo } = useDemo();
  const [departments, setDepartments] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchDepartments = async () => {
    if (isDemo) {
      setDepartments(demoDepartments);
      return;
    }
    const { data } = await supabase.from('departments').select('*').order('name');
    setDepartments(data || []);
  };

  useEffect(() => { fetchDepartments(); }, [isDemo]);

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) { toast.error('Fill all fields'); return; }
    if (isDemo) {
      toast.success(editId ? 'Department updated (demo)' : 'Department created (demo)');
      setName(''); setCode(''); setEditId(null); setDialogOpen(false);
      return;
    }
    if (editId) {
      const { error } = await supabase.from('departments').update({ name, code }).eq('id', editId);
      if (error) { toast.error(error.message); return; }
      toast.success('Department updated');
    } else {
      const { error } = await supabase.from('departments').insert({ name, code });
      if (error) { toast.error(error.message); return; }
      toast.success('Department created');
    }
    setName(''); setCode(''); setEditId(null); setDialogOpen(false);
    fetchDepartments();
  };

  const handleEdit = (dept: any) => {
    setName(dept.name); setCode(dept.code); setEditId(dept.id); setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) { toast.success('Department deleted (demo)'); return; }
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Department deleted');
    fetchDepartments();
  };

  const openNew = () => { setName(''); setCode(''); setEditId(null); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Departments</h2>
          <p className="text-muted-foreground text-sm">Manage college departments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Add Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editId ? 'Edit' : 'Add'} Department</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Computer Science" /></div>
              <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="CS" /></div>
              <Button variant="gradient" className="w-full" onClick={handleSave}>{editId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-4 opacity-50" />
              <p>No departments yet. Add one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-semibold">{d.code}</span></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default ManageDepartments;
