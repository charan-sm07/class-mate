import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all students
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
    let alertsSent = 0;

    for (const studentId of studentIds) {
      // Get attendance records
      const { data: records } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('student_id', studentId);

      if (!records || records.length < 5) continue;

      const total = records.length;
      const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const percentage = Math.round((present / total) * 100);

      if (percentage >= 75) continue;

      // Check if we already sent a notification today
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', studentId)
        .eq('type', 'attendance_warning')
        .gte('created_at', `${today}T00:00:00Z`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const isCritical = percentage < 65;
      const title = isCritical ? '🚨 Critical: Attendance Below 65%' : '⚠️ Warning: Attendance Below 75%';
      const message = isCritical
        ? `Your overall attendance is at ${percentage}%. You may face academic consequences. Please attend classes regularly.`
        : `Your overall attendance is at ${percentage}%. It's dropping below the required 75% threshold. Please improve your attendance.`;

      await supabase.from('notifications').insert({
        user_id: studentId,
        title,
        message,
        type: 'attendance_warning',
      });

      alertsSent++;
    }

    return new Response(JSON.stringify({ success: true, alertsSent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
