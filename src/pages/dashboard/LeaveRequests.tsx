import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, FileText, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { demoLeaveRequests, demoFacultySubjects } from '@/lib/demoData';

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  approved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
};

const LeaveRequests = () => {
  const { user, role: authRole } = useAuth();
  const { isDemo, demoRole } = useDemo();
  const role = isDemo ? demoRole : authRole;
  const [requests, setRequests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isDemo);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [subjectId, setSubjectId] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  const [reason, setReason] = useState('');

  const isStudent = role === 'student';

  const fetchRequests = async () => {
    if (isDemo) {
      setRequests(isStudent ? demoLeaveRequests.student : demoLeaveRequests.faculty);
      if (isStudent) setSubjects(demoFacultySubjects.map(s => ({ id: s.id, name: s.name, code: s.code })));
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from('leave_requests')
      .select('*, subjects(name, code)')
      .order('created_at', { ascending: false });

    if (data && !isStudent) {
      const studentIds = [...new Set(data.map((r: any) => r.student_id))];
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, roll_number')
          .in('user_id', studentIds as string[]);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        data.forEach((r: any) => { r.student_profile = profileMap.get(r.student_id) || null; });
      }
    }
    setRequests(data || []);
    setLoading(false);
  };

  const fetchSubjects = async () => {
    if (isDemo || !user || !isStudent) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('class_id')
      .eq('user_id', user.id)
      .single();

    if (profile?.class_id) {
      const { data } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('class_id', profile.class_id);
      setSubjects(data || []);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchSubjects();
  }, [user, role, isDemo]);

  const handleSubmit = async () => {
    if (!subjectId || !leaveDate || !reason.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    if (isDemo) {
      toast.success('Leave request submitted (demo)');
      setDialogOpen(false);
      return;
    }
    if (reason.trim().length > 500) {
      toast.error('Reason must be under 500 characters');
      return;
    }

    setSubmitting(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('class_id')
      .eq('user_id', user!.id)
      .single();

    const { error } = await (supabase as any).from('leave_requests').insert({
      student_id: user!.id,
      subject_id: subjectId,
      class_id: profile?.class_id || '',
      leave_date: leaveDate,
      reason: reason.trim(),
    });

    if (error) {
      toast.error('Failed to submit leave request');
    } else {
      toast.success('Leave request submitted');
      setSubjectId('');
      setLeaveDate('');
      setReason('');
      setDialogOpen(false);
      fetchRequests();
    }
    setSubmitting(false);
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected', note?: string) => {
    if (isDemo) {
      toast.success(`Leave request ${status} (demo)`);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      return;
    }
    const { error } = await (supabase as any)
      .from('leave_requests')
      .update({ status, reviewed_by: user!.id, review_note: note || null })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update request');
    } else {
      toast.success(`Leave request ${status}`);
      fetchRequests();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-0 shadow-card">
            <CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Leave Requests</h1>
          <p className="text-sm text-muted-foreground">
            {isStudent ? 'Submit and track your leave requests' : 'Review and manage student leave requests'}
          </p>
        </div>
        {isStudent && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="gap-2">
                <Plus className="h-4 w-4" /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Submit Leave Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Subject</Label>
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Explain your reason for leave..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{reason.length}/500</p>
                </div>
                <Button variant="gradient" className="w-full" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {requests.length === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Inbox className="h-12 w-12 mb-3 opacity-40" />
            <p className="font-medium">No leave requests yet</p>
            {isStudent && <p className="text-sm mt-1">Click "New Request" to submit one</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <Card key={req.id} className="border-0 shadow-card">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shrink-0">
                      <FileText className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      {!isStudent && req.student_profile && (
                        <p className="font-semibold text-sm">
                          {req.student_profile.full_name}
                          {req.student_profile.roll_number && <span className="text-muted-foreground font-normal ml-2">({req.student_profile.roll_number})</span>}
                        </p>
                      )}
                      <p className="text-sm font-medium">{req.subjects?.name} ({req.subjects?.code})</p>
                      <p className="text-xs text-muted-foreground">
                        Date: {format(new Date(req.leave_date), 'dd MMM yyyy')} · 
                        Submitted: {format(new Date(req.created_at), 'dd MMM yyyy')}
                      </p>
                      <p className="text-sm mt-1 text-muted-foreground">{req.reason}</p>
                      {req.review_note && (
                        <p className="text-xs mt-1 italic text-muted-foreground">Faculty note: {req.review_note}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <Badge className={statusColors[req.status] || ''}>
                      {req.status}
                    </Badge>
                    {!isStudent && req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10"
                          onClick={() => handleReview(req.id, 'approved')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleReview(req.id, 'rejected')}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
