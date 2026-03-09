import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: 'session_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all students in the class
    const { data: studentRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student');

    if (!studentRoles || studentRoles.length === 0) {
      return new Response(JSON.stringify({ message: 'No students found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const studentIds = studentRoles.map(r => r.user_id);

    // Get profiles for students in this class
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id')
      .in('user_id', studentIds)
      .eq('class_id', session.class_id);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No students in class' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const classStudentIds = profiles.map(p => p.user_id);

    // Get students who already marked attendance for this session
    const { data: presentRecords } = await supabase
      .from('attendance_records')
      .select('student_id')
      .eq('session_id', session_id);

    const presentStudentIds = new Set((presentRecords || []).map(r => r.student_id));

    // Mark absent for students who didn't attend
    const absentRecords = classStudentIds
      .filter(id => !presentStudentIds.has(id))
      .map(studentId => ({
        student_id: studentId,
        subject_id: session.subject_id,
        class_id: session.class_id,
        session_id: session_id,
        marked_by: session.faculty_id,
        status: 'absent',
        qr_verified: false,
        face_verified: false,
      }));

    if (absentRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert(absentRecords);

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to mark absent', details: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      message: `Marked ${absentRecords.length} students as absent`,
      absent_count: absentRecords.length,
      present_count: presentStudentIds.size,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
