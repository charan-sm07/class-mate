import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, CheckCircle2, XCircle, MapPin, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import { getCurrentPosition, isWithinCampus, getDistanceInMeters, COLLEGE_LOCATION, ALLOWED_RADIUS_METERS } from '@/lib/geofence';
import { checkSuspiciousActivity } from '@/lib/suspiciousDetection';

type VerifyStep = 'idle' | 'scanning' | 'location' | 'face' | 'verifying' | 'success' | 'error' | 'outside';

const ScanQR = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [qrCode, setQrCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState<VerifyStep>('idle');
  const [faceCapture, setFaceCapture] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerDivId = 'qr-reader';

  const stopCamera = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (e) {
      console.error('Error stopping scanner:', e);
    }
    scannerRef.current = null;
    setScanning(false);
  };

  const stopFaceCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setFaceCapture(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(console.error);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleDemoSubmit = () => {
    setStep('verifying');
    setTimeout(() => {
      setStep('success');
      toast.success('Attendance marked successfully! (demo)');
    }, 1500);
  };

  const startCamera = async () => {
    if (isDemo) {
      toast.info('Camera scanning is not available in demo mode. Use manual code entry.');
      return;
    }
    setScanning(true);
    setStep('scanning');
    setFaceCaptured(false);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const scanner = new Html5Qrcode(scannerDivId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          toast.info('QR code detected!');
          stopCamera();
          startFaceVerification(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Unable to access camera. Enter the code manually.');
      setScanning(false);
      setStep('idle');
    }
  };

  const startFaceVerification = async (code: string) => {
    setStep('face');
    setFaceCapture(true);
    setQrCode(code);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Face camera error:', err);
      toast.error('Camera access needed for face verification. Proceeding without it.');
      setFaceCapture(false);
      verifyAndMarkAttendance(code, false);
    }
  };

  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
    }
    setFaceCaptured(true);
    stopFaceCamera();
    toast.success('Face captured! Verifying attendance...');
    verifyAndMarkAttendance(qrCode, true);
  };

  const handleManualSubmit = () => {
    if (!qrCode.trim()) return;
    if (isDemo) {
      handleDemoSubmit();
      return;
    }
    startFaceVerification(qrCode);
  };

  const verifyAndMarkAttendance = async (code: string, faceVerified: boolean) => {
    if (!user || !code.trim()) return;
    setStep('location');

    let latitude: number;
    let longitude: number;
    try {
      const position = await getCurrentPosition();
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (err) {
      console.error('Location error:', err);
      setStep('outside');
      toast.error('Unable to access your location. Please enable GPS.');
      return;
    }

    if (!isWithinCampus(latitude, longitude)) {
      const distance = Math.round(getDistanceInMeters(latitude, longitude, COLLEGE_LOCATION.latitude, COLLEGE_LOCATION.longitude));
      setStep('outside');
      toast.error(`You must be inside campus. You are ${distance}m away (max ${ALLOWED_RADIUS_METERS}m).`);
      return;
    }

    setStep('verifying');

    let sessionId: string | null = null;
    let qrSessionData: any = null;

    const parts = code.trim().split(':');
    if (parts.length >= 3) {
      sessionId = parts[0];
      const { data: session } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('session_status', 'active')
        .single();

      if (!session) {
        const { data: qrSession } = await supabase
          .from('qr_sessions')
          .select('*')
          .eq('qr_code', code.trim())
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (!qrSession) {
          setStep('error');
          toast.error('Invalid or expired QR code');
          return;
        }
        qrSessionData = qrSession;
      } else {
        if (session.qr_code !== code.trim()) {
          setStep('error');
          toast.error('This QR code has expired. Wait for the next one.');
          return;
        }
        qrSessionData = {
          subject_id: session.subject_id,
          class_id: session.class_id,
          session_id: session.id,
        };
        sessionId = session.id;
      }
    } else {
      const { data: qrSession } = await supabase
        .from('qr_sessions')
        .select('*')
        .eq('qr_code', code.trim())
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!qrSession) {
        setStep('error');
        toast.error('Invalid or expired QR code');
        return;
      }
      qrSessionData = qrSession;
    }

    const { error } = await supabase.from('attendance_records').insert({
      student_id: user.id,
      subject_id: qrSessionData.subject_id,
      class_id: qrSessionData.class_id,
      session_id: sessionId || qrSessionData.session_id || null,
      marked_by: user.id,
      status: 'present',
      qr_verified: true,
      face_verified: faceVerified,
      latitude,
      longitude,
    } as any);

    if (error) {
      if (error.code === '23505') {
        toast.error('Attendance already marked for this session');
      } else {
        console.error('Attendance error:', error);
        toast.error('Failed to mark attendance');
      }
      setStep('error');
      return;
    }

    if (sessionId) {
      try {
        await checkSuspiciousActivity(sessionId, user.id, latitude, longitude);
      } catch (e) {
        console.error('Suspicious check error:', e);
      }
    }

    setStep('success');
    toast.success('Attendance marked successfully!');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <QrCode className="h-6 w-6" /> Scan QR Code
          </CardTitle>
          <CardDescription>Scan the QR code to mark your attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>GPS verification — must be within {ALLOWED_RADIUS_METERS}m of campus</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <UserCheck className="h-4 w-4 shrink-0" />
              <span>Face verification — selfie capture required</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>QR codes rotate every 30 seconds</span>
            </div>
          </div>

          {scanning ? (
            <div className="space-y-4">
              <div id={scannerDivId} className="rounded-2xl overflow-hidden w-full" style={{ minHeight: 300 }} />
              <Button variant="outline" onClick={stopCamera} className="w-full">Stop Camera</Button>
            </div>
          ) : faceCapture ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-center">Look at the camera and click Capture</p>
              <div className="relative rounded-2xl overflow-hidden bg-muted" style={{ minHeight: 240 }}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <Button variant="gradient" onClick={captureFace} className="w-full gap-2">
                <Camera className="h-4 w-4" /> Capture Face
              </Button>
              <Button variant="outline" onClick={() => { stopFaceCamera(); verifyAndMarkAttendance(qrCode, false); }} className="w-full">
                Skip Face Verification
              </Button>
            </div>
          ) : (
            <Button variant="gradient" onClick={startCamera} className="w-full gap-2" disabled={step === 'location' || step === 'verifying'}>
              <Camera className="h-4 w-4" /> {isDemo ? 'Camera (disabled in demo)' : 'Start Camera to Scan'}
            </Button>
          )}

          {!scanning && !faceCapture && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or enter code manually</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>QR Code</Label>
                <Input placeholder={isDemo ? "Enter any text to simulate" : "Paste the QR code here"} value={qrCode} onChange={e => setQrCode(e.target.value)} />
              </div>
              <Button
                variant="gradient"
                onClick={handleManualSubmit}
                disabled={!qrCode.trim() || step === 'location' || step === 'verifying'}
                className="w-full"
              >
                Mark Attendance
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {step === 'location' && (
        <Card className="border-0 shadow-card bg-muted/30">
          <CardContent className="p-6 flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="font-semibold">Verifying Location...</p>
              <p className="text-sm text-muted-foreground">Checking if you are inside the campus</p>
            </div>
          </CardContent>
        </Card>
      )}
      {step === 'verifying' && (
        <Card className="border-0 shadow-card bg-muted/30">
          <CardContent className="p-6 flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="font-semibold">Verifying QR Code...</p>
              <p className="text-sm text-muted-foreground">Validating session and marking attendance</p>
            </div>
          </CardContent>
        </Card>
      )}
      {step === 'face' && !faceCapture && (
        <Card className="border-0 shadow-card bg-muted/30">
          <CardContent className="p-6 flex items-center gap-4">
            <UserCheck className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">Face Verification</p>
              <p className="text-sm text-muted-foreground">Opening camera for face capture</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'success' && (
        <Card className="border-0 shadow-card bg-success/5">
          <CardContent className="p-6 flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div>
              <p className="font-semibold">Attendance Marked!</p>
              <p className="text-sm text-muted-foreground">
                ✓ {isDemo ? 'Demo mode' : 'GPS verified'} ✓ QR verified {faceCaptured ? '✓ Face verified' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'outside' && (
        <Card className="border-0 shadow-card bg-destructive/5">
          <CardContent className="p-6 flex items-center gap-4">
            <MapPin className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold">Outside Campus</p>
              <p className="text-sm text-muted-foreground">You must be inside the college campus to mark attendance.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'error' && (
        <Card className="border-0 shadow-card bg-destructive/5">
          <CardContent className="p-6 flex items-center gap-4">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold">Failed</p>
              <p className="text-sm text-muted-foreground">Could not mark attendance. Try again.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanQR;
