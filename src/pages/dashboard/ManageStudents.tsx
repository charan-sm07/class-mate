import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { demoStudents } from '@/lib/demoData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Search } from 'lucide-react';

const ManageStudents = () => {
  const { isDemo } = useDemo();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isDemo) {
      setStudents(demoStudents);
      return;
    }
    const fetchStudents = async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'student');
      if (!roles?.length) return;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, departments(name), classes(name)')
        .in('user_id', roles.map(r => r.user_id))
        .order('full_name');
      setStudents(profiles || []);
    };
    fetchStudents();
  }, [isDemo]);

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_number || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Students</h2>
          <p className="text-muted-foreground text-sm">{students.length} students enrolled</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" /><p>{search ? 'No matching students' : 'No students registered yet'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Roll No</TableHead><TableHead>Department</TableHead><TableHead>Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                    <TableCell>{s.roll_number ? <Badge variant="outline">{s.roll_number}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                    <TableCell className="text-sm">{s.departments?.name || '—'}</TableCell>
                    <TableCell className="text-sm">{s.classes?.name || '—'}</TableCell>
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

export default ManageStudents;
