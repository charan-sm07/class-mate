import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { demoProfiles } from '@/lib/demoData';

const ProfileSettings = () => {
  const { user, profile: authProfile, role: authRole } = useAuth();
  const { isDemo, demoRole } = useDemo();
  const role = isDemo ? demoRole : authRole;
  const profile = isDemo ? demoProfiles[demoRole!] : authProfile;

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    roll_number: '',
    department_id: '',
    class_id: '',
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        roll_number: profile.roll_number || '',
        department_id: profile.department_id || '',
        class_id: profile.class_id || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (isDemo) {
      setDepartments([{ id: 'dept-1', name: 'Computer Science & Engineering' }, { id: 'dept-2', name: 'Electronics & Communication' }]);
      setClasses([{ id: 'class-1', name: 'CSE-A', year: 3, section: '3rd Year', department_id: 'dept-1' }]);
      return;
    }
    Promise.all([
      supabase.from('departments').select('*').order('name'),
      supabase.from('classes').select('*, departments(name)').order('name'),
    ]).then(([d, c]) => {
      setDepartments(d.data || []);
      setClasses(c.data || []);
    });
  }, [isDemo]);

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (isDemo) {
      toast.success('Profile updated (demo)');
      return;
    }
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        roll_number: form.roll_number.trim() || null,
        department_id: form.department_id || null,
        class_id: form.class_id || null,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
    }
    setSaving(false);
  };

  const initials = form.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const filteredClasses = form.department_id
    ? classes.filter(c => c.department_id === form.department_id)
    : classes;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="gradient-primary text-primary-foreground text-2xl font-display font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="font-display text-2xl">Profile Settings</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Full Name*</Label>
            <Input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={isDemo ? (profile as any)?.email || '' : user?.email || ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91 9876543210"
            />
          </div>

          {role === 'student' && (
            <div className="space-y-2">
              <Label>Roll Number</Label>
              <Input
                value={form.roll_number}
                onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))}
                placeholder="CS2024001"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={form.department_id}
              onValueChange={v => setForm(f => ({ ...f, department_id: v, class_id: '' }))}
            >
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {role === 'student' && (
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={form.class_id}
                onValueChange={v => setForm(f => ({ ...f, class_id: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {filteredClasses.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - Year {c.year}{c.section ? ` (${c.section})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold capitalize">Role:</span> {role}
            </p>
          </div>

          <Button variant="gradient" className="w-full gap-2" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
