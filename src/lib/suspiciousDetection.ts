import { supabase } from '@/integrations/supabase/client';
import { getDistanceInMeters } from './geofence';

/**
 * Check for suspicious activity: multiple students marking attendance
 * from the same GPS location within a short time window.
 */
export async function checkSuspiciousActivity(
  sessionId: string,
  studentId: string,
  latitude: number,
  longitude: number
) {
  // Get recent attendance records for this session with location data
  const { data: recentRecords } = await supabase
    .from('attendance_records')
    .select('student_id, latitude, longitude, timestamp')
    .eq('session_id', sessionId)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (!recentRecords || recentRecords.length === 0) return;

  const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

  for (const record of recentRecords) {
    if (record.student_id === studentId) continue;
    if (!record.latitude || !record.longitude) continue;

    const recordTime = new Date(record.timestamp).getTime();
    if (recordTime < twoMinutesAgo) continue;

    const distance = getDistanceInMeters(
      latitude, longitude,
      record.latitude, record.longitude
    );

    // If two different students marked from within 5 meters of each other within 2 minutes
    if (distance < 5) {
      // Flag both students
      await supabase.from('suspicious_flags').insert([
        {
          session_id: sessionId,
          student_id: studentId,
          flag_type: 'same_location',
          details: {
            distance_meters: Math.round(distance),
            other_student_id: record.student_id,
            latitude,
            longitude,
          },
        },
        {
          session_id: sessionId,
          student_id: record.student_id,
          flag_type: 'same_location',
          details: {
            distance_meters: Math.round(distance),
            other_student_id: studentId,
            latitude,
            longitude,
          },
        },
      ] as any);
    }
  }
}
