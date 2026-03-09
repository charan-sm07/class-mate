import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { demoFacultySubjects } from '@/lib/demoData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QrCode, RefreshCw, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

const QRAttendance = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [qrSession, setQrSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setSubjects(demoFacultySubjects);
      setLoadingSubjects(false);
      return;
    }
    if (!user) return;
    setLoadingSubjects(true);
    supabase
      .from('subjects')
      .select('*, classes(id, name)')
      .eq('faculty_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading subjects:', error);
          toast.error('Failed to load subjects');
        }
        setSubjects(data || []);
        setLoadingSubjects(false);
      });
  }, [user, isDemo]);

  useEffect(() => {
    if (!qrSession) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(qrSession.expires_at).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setQrSession(null);
        toast.info('QR code expired');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [qrSession]);

  const generateQR = async () => {
    if (!selectedSubject) return;

    if (isDemo) {
      const qrCode = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      setQrSession({ qr_code: qrCode, expires_at: expiresAt });
      toast.success('QR code generated! (demo)');
      return;
    }

    if (!user) return;
    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject?.class_id) {
      toast.error('Subject has no class assigned. Please assign a class to this subject first.');
      return;
    }

    setLoading(true);
    const qrCode = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase.from('qr_sessions').insert({
      subject_id: selectedSubject,
      class_id: subject.class_id,
      faculty_id: user.id,
      qr_code: qrCode,
      expires_at: expiresAt,
    }).select().single();

    setLoading(false);

    if (error) {
      console.error('QR session error:', error);
      toast.error('Failed to create QR session');
      return;
    }
    setQrSession(data);
    toast.success('QR code generated! Students can scan to mark attendance.');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <QrCode className="h-6 w-6" /> QR Code Attendance
          </CardTitle>
          <CardDescription>Generate a QR code for students to scan and mark attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Subject</Label>
            {loadingSubjects ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading subjects...
              </div>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No subjects assigned to you. Ask an admin to assign subjects to your account.
              </p>
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
          <Button variant="gradient" onClick={generateQR} disabled={!selectedSubject || loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
            Generate QR Code
          </Button>
        </CardContent>
      </Card>

      {qrSession && (
        <Card className="border-0 shadow-card">
          <CardContent className="p-8 flex flex-col items-center space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-elevated">
              <QRCodeSVG value={qrSession.qr_code} size={256} level="H" includeMargin />
            </div>
            <div className="text-center space-y-1">
              <p className="text-2xl font-display font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-muted-foreground">Time remaining</p>
              <p className="text-xs text-muted-foreground mt-2">
                Students can also enter this code manually: <span className="font-mono font-semibold text-foreground">{qrSession.qr_code.slice(0, 8)}...</span>
              </p>
            </div>
            <Button variant="outline" onClick={generateQR} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRAttendance;
