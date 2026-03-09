import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, RefreshCw, Loader2, Play, Square, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { demoFacultySessionSubjects } from '@/lib/demoData';

const SessionManagement = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentQR, setCurrentQR] = useState('');
  const [qrTimeLeft, setQrTimeLeft] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(!isDemo);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isDemo) {
      setSubjects(demoFacultySessionSubjects);
      setLoadingSubjects(false);
      return;
    }
    if (!user) return;
    supabase
      .from('subjects')
      .select('*, classes(id, name)')
      .eq('faculty_id', user.id)
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load subjects');
        setSubjects(data || []);
        setLoadingSubjects(false);
      });

    supabase
      .from('class_sessions')
      .select('*, subjects(name, code), classes(name)')
      .eq('faculty_id', user.id)
      .eq('session_status', 'active')
      .then(({ data }) => {
        setActiveSessions(data || []);
        if (data && data.length > 0) {
          const session = data[0];
          setActiveSession(session);
          if (session.qr_code) setCurrentQR(session.qr_code);
        }
      });
  }, [user, isDemo]);

  const rotateQR = useCallback(async () => {
    if (!activeSession) return;
    if (isDemo) {
      const newQR = `demo:${activeSession.id}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
      setCurrentQR(newQR);
      setQrTimeLeft(30);
      return;
    }
    if (!user) return;
    const newQR = `${activeSession.id}:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
    const qrExpiry = new Date(Date.now() + 30 * 1000).toISOString();

    await supabase
      .from('class_sessions')
      .update({ qr_code: newQR, qr_expiry: qrExpiry } as any)
      .eq('id', activeSession.id);

    await supabase.from('qr_sessions').insert({
      subject_id: activeSession.subject_id,
      class_id: activeSession.class_id,
      faculty_id: user.id,
      qr_code: newQR,
      expires_at: qrExpiry,
    } as any);

    setCurrentQR(newQR);
    setQrTimeLeft(30);
  }, [activeSession, user, isDemo]);

  useEffect(() => {
    if (!activeSession) return;

    rotateQR();
    rotationRef.current = setInterval(rotateQR, 30000);

    timerRef.current = setInterval(() => {
      const endMs = new Date(activeSession.end_time).getTime();
      const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setSessionTimeLeft(remaining);
      
      setQrTimeLeft(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });

      if (remaining <= 0) {
        endSession(activeSession.id);
      }
    }, 1000);

    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, rotateQR]);

  const createSession = async () => {
    if (!selectedSubject || !startTime || !endTime) {
      toast.error('Please fill all fields');
      return;
    }
    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject?.class_id && !subject?.classes?.id) {
      toast.error('Subject has no class assigned');
      return;
    }

    if (isDemo) {
      const now = new Date();
      const start = new Date(`${now.toISOString().split('T')[0]}T${startTime}`);
      const end = new Date(`${now.toISOString().split('T')[0]}T${endTime}`);
      if (end <= start) { toast.error('End time must be after start time'); return; }
      const demoSession = {
        id: 'demo-session-' + Date.now(),
        subject_id: selectedSubject,
        class_id: subject.class_id || subject.classes?.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        subjects: { name: subject.name, code: subject.code },
        classes: { name: subject.classes?.name },
      };
      setActiveSession(demoSession);
      toast.success('Demo session started! QR codes will rotate every 30 seconds.');
      return;
    }

    setLoading(true);
    const now = new Date();
    const start = new Date(`${now.toISOString().split('T')[0]}T${startTime}`);
    const end = new Date(`${now.toISOString().split('T')[0]}T${endTime}`);

    if (end <= start) {
      toast.error('End time must be after start time');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('class_sessions')
      .insert({
        subject_id: selectedSubject,
        class_id: subject.class_id,
        faculty_id: user!.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        session_status: 'active',
      } as any)
      .select('*, subjects(name, code), classes(name)')
      .single();

    setLoading(false);

    if (error) {
      console.error('Session error:', error);
      toast.error('Failed to create session');
      return;
    }

    setActiveSession(data);
    setActiveSessions(prev => [...prev, data]);
    toast.success('Session started! QR codes will rotate every 30 seconds.');
  };

  const endSession = async (sessionId: string) => {
    if (isDemo) {
      if (rotationRef.current) clearInterval(rotationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveSession(null);
      setCurrentQR('');
      toast.success('Demo session ended.');
      return;
    }

    await supabase
      .from('class_sessions')
      .update({ session_status: 'completed' } as any)
      .eq('id', sessionId);

    try {
      await supabase.functions.invoke('mark-absent', {
        body: { session_id: sessionId },
      });
    } catch (e) {
      console.error('Auto-absence error:', e);
    }

    if (rotationRef.current) clearInterval(rotationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setActiveSession(null);
    setCurrentQR('');
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    toast.success('Session ended. Absent students have been marked automatically.');
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!activeSession ? (
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Play className="h-6 w-6" /> Start Class Session
            </CardTitle>
            <CardDescription>Create a session to generate rotating QR codes for attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              {loadingSubjects ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No subjects assigned.</p>
              ) : (
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger><SelectValue placeholder="Choose a subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.code}) {s.classes ? `- ${s.classes.name}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
            <Button variant="gradient" onClick={createSession} disabled={!selectedSubject || !startTime || !endTime || loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Start Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-card">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  <QrCode className="h-6 w-6" /> Active Session
                </CardTitle>
                <CardDescription>
                  {(activeSession as any).subjects?.name} — {(activeSession as any).classes?.name}
                </CardDescription>
              </div>
              <Badge className="bg-success text-success-foreground">LIVE</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-2xl bg-white p-6 shadow-elevated">
                  <QRCodeSVG value={currentQR} size={256} level="H" includeMargin />
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">QR Refresh</p>
                      <p className="text-lg font-display font-bold text-primary">{qrTimeLeft}s</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Session Time</p>
                      <p className="text-lg font-display font-bold">{formatTime(sessionTimeLeft)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    QR rotates every 30 seconds for security
                  </div>
                </div>
              </div>
              <Button variant="destructive" onClick={() => endSession(activeSession.id)} className="w-full gap-2">
                <Square className="h-4 w-4" /> End Session
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {activeSessions.length > 0 && !activeSession && (
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Clock className="h-5 w-5" /> Your Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-medium text-sm">{s.subjects?.name}</p>
                    <p className="text-xs text-muted-foreground">{s.classes?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveSession(s)}>View QR</Button>
                    <Button size="sm" variant="destructive" onClick={() => endSession(s.id)}>End</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionManagement;
