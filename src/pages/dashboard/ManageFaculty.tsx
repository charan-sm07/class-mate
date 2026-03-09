import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { demoFaculty } from '@/lib/demoData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCog, Search } from 'lucide-react';

const ManageFaculty = () => {
  const { isDemo } = useDemo();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isDemo) {
      setFaculty(demoFaculty);
      return;
    }
    const fetchFaculty = async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'faculty');
      if (!roles?.length) return;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, departments(name)')
        .in('user_id', roles.map(r => r.user_id))
        .order('full_name');
      
      const { data: subjects } = await supabase.from('subjects').select('faculty_id');
      const subjectCounts: Record<string, number> = {};
      (subjects || []).forEach(s => {
        if (s.faculty_id) subjectCounts[s.faculty_id] = (subjectCounts[s.faculty_id] || 0) + 1;
      });

      setFaculty((profiles || []).map(p => ({ ...p, subjectCount: subjectCounts[p.user_id] || 0 })));
    };
    fetchFaculty();
  }, [isDemo]);

  const filtered = faculty.filter(f =>
    f.full_name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Faculty</h2>
          <p className="text-muted-foreground text-sm">{faculty.length} faculty members</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search faculty..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <UserCog className="h-12 w-12 mb-4 opacity-50" /><p>{search ? 'No matching faculty' : 'No faculty registered yet'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Department</TableHead><TableHead>Subjects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{f.email}</TableCell>
                    <TableCell className="text-sm">{f.departments?.name || '—'}</TableCell>
                    <TableCell>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">{f.subjectCount}</span>
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

export default ManageFaculty;
