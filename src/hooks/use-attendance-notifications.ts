import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useAttendanceNotifications = () => {
  const { user, role } = useAuth();

  useEffect(() => {
    if (!user || !role) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (role === 'student') {
      // Notify student when their attendance is recorded
      const attendanceChannel = supabase
        .channel('student-attendance-notif')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'attendance_records',
            filter: `student_id=eq.${user.id}`,
          },
          async (payload) => {
            const record = payload.new as any;
            const { data: subject } = await supabase
              .from('subjects')
              .select('name')
              .eq('id', record.subject_id)
              .single();

            const subjectName = subject?.name || 'a subject';

            if (record.status === 'present') {
              toast.success(`Attendance marked: Present`, {
                description: `You've been marked present for ${subjectName}`,
              });
            } else if (record.status === 'late') {
              toast.warning(`Attendance marked: Late`, {
                description: `You've been marked late for ${subjectName}`,
              });
            } else if (record.status === 'absent') {
              toast.error(`Marked Absent`, {
                description: `You were marked absent for ${subjectName}`,
              });
            }
          }
        )
        .subscribe();
      channels.push(attendanceChannel);

      // Notify student when a new session starts for their class
      const sessionChannel = supabase
        .channel('student-session-notif')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'class_sessions',
          },
          async (payload) => {
            const session = payload.new as any;
            // Check if this session is for the student's class
            const { data: profile } = await supabase
              .from('profiles')
              .select('class_id')
              .eq('user_id', user.id)
              .single();

            if (profile?.class_id && profile.class_id === session.class_id) {
              const { data: subject } = await supabase
                .from('subjects')
                .select('name')
                .eq('id', session.subject_id)
                .single();

              toast.info(`📢 New Session Started`, {
                description: `${subject?.name || 'A class'} session is now active. Scan QR to mark attendance!`,
                duration: 10000,
              });
            }
          }
        )
        .subscribe();
      channels.push(sessionChannel);
    }

    if (role === 'faculty') {
      // Notify faculty when a student marks attendance via QR
      const facultyChannel = supabase
        .channel('faculty-attendance-notif')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'attendance_records',
            filter: `qr_verified=eq.true`,
          },
          async (payload) => {
            const record = payload.new as any;
            // Only notify if this is for the faculty's session
            if (!record.session_id) return;
            const { data: session } = await supabase
              .from('class_sessions')
              .select('faculty_id')
              .eq('id', record.session_id)
              .single();

            if (session?.faculty_id === user.id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, roll_number')
                .eq('user_id', record.student_id)
                .single();

              toast.success(`Student checked in`, {
                description: `${profile?.full_name || 'A student'} ${profile?.roll_number ? `(${profile.roll_number})` : ''} marked present via QR`,
              });
            }
          }
        )
        .subscribe();
      channels.push(facultyChannel);

      // Notify faculty about suspicious flags
      const flagChannel = supabase
        .channel('faculty-flag-notif')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'suspicious_flags',
          },
          async (payload) => {
            const flag = payload.new as any;
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', flag.student_id)
              .single();

            toast.error(`⚠️ Suspicious Activity`, {
              description: `${profile?.full_name || 'A student'}: ${flag.flag_type === 'same_location' ? 'Possible proxy attendance detected' : flag.flag_type}`,
              duration: 10000,
            });
          }
        )
        .subscribe();
      channels.push(flagChannel);
    }

    if (role === 'admin') {
      // Notify admin about suspicious flags
      const adminFlagChannel = supabase
        .channel('admin-flag-notif')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'suspicious_flags',
          },
          () => {
            toast.error(`⚠️ New Suspicious Flag`, {
              description: 'A new suspicious activity has been detected. Check monitoring.',
              duration: 8000,
            });
          }
        )
        .subscribe();
      channels.push(adminFlagChannel);
    }

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [user, role]);
};
