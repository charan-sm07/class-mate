import { format, subDays } from 'date-fns';

const today = new Date();

export const demoProfiles = {
  admin: { full_name: 'Dr. Admin User', email: 'admin@demo.attendease.com', phone: '+91 98765 43210', avatar_url: null, department_id: null, class_id: null, roll_number: null },
  faculty: { full_name: 'Prof. Arun Kumar', email: 'arun.kumar@demo.attendease.com', phone: '+91 98765 12345', avatar_url: null, department_id: 'dept-1', class_id: null, roll_number: null },
  student: { full_name: 'Rahul Mehta', email: 'rahul.m@demo.attendease.com', phone: '+91 99887 76655', avatar_url: null, department_id: 'dept-1', class_id: 'class-1', roll_number: 'CS2024-042' },
};

export const demoAdminStats = {
  students: 248,
  faculty: 32,
  departments: 6,
  subjects: 45,
};

const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = subDays(today, 6 - i);
  return format(d, 'EEE');
});

export const demoAdminAttendance = weekDays.map(day => ({
  date: day,
  present: Math.floor(Math.random() * 40 + 180),
  absent: Math.floor(Math.random() * 20 + 10),
  late: Math.floor(Math.random() * 15 + 5),
}));

export const demoAdminPieData = [
  { name: 'Present', value: 1260 },
  { name: 'Absent', value: 105 },
  { name: 'Late', value: 63 },
];

export const demoFacultySubjects = [
  { id: 's1', name: 'Data Structures', code: 'CS301', classes: { name: 'CSE-A 3rd Year' } },
  { id: 's2', name: 'Algorithms', code: 'CS302', classes: { name: 'CSE-B 3rd Year' } },
  { id: 's3', name: 'Database Systems', code: 'CS303', classes: { name: 'CSE-A 3rd Year' } },
  { id: 's4', name: 'Operating Systems', code: 'CS304', classes: { name: 'CSE-C 3rd Year' } },
];

export const demoFacultyAttendance = weekDays.map(day => ({
  date: day,
  present: Math.floor(Math.random() * 15 + 45),
  absent: Math.floor(Math.random() * 8 + 2),
}));

export const demoStudentRecords = [
  { id: 'r1', subject_id: 's1', subjects: { name: 'Data Structures', code: 'CS301' }, date: format(subDays(today, 0), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
  { id: 'r2', subject_id: 's2', subjects: { name: 'Algorithms', code: 'CS302' }, date: format(subDays(today, 0), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
  { id: 'r3', subject_id: 's3', subjects: { name: 'Database Systems', code: 'CS303' }, date: format(subDays(today, 1), 'yyyy-MM-dd'), status: 'late', qr_verified: true, face_verified: false },
  { id: 'r4', subject_id: 's1', subjects: { name: 'Data Structures', code: 'CS301' }, date: format(subDays(today, 1), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
  { id: 'r5', subject_id: 's4', subjects: { name: 'Operating Systems', code: 'CS304' }, date: format(subDays(today, 2), 'yyyy-MM-dd'), status: 'absent', qr_verified: false, face_verified: false },
  { id: 'r6', subject_id: 's2', subjects: { name: 'Algorithms', code: 'CS302' }, date: format(subDays(today, 2), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
  { id: 'r7', subject_id: 's3', subjects: { name: 'Database Systems', code: 'CS303' }, date: format(subDays(today, 3), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
  { id: 'r8', subject_id: 's1', subjects: { name: 'Data Structures', code: 'CS301' }, date: format(subDays(today, 3), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
  { id: 'r9', subject_id: 's4', subjects: { name: 'Operating Systems', code: 'CS304' }, date: format(subDays(today, 4), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
  { id: 'r10', subject_id: 's2', subjects: { name: 'Algorithms', code: 'CS302' }, date: format(subDays(today, 4), 'yyyy-MM-dd'), status: 'absent', qr_verified: false, face_verified: false },
  { id: 'r11', subject_id: 's3', subjects: { name: 'Database Systems', code: 'CS303' }, date: format(subDays(today, 5), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
  { id: 'r12', subject_id: 's1', subjects: { name: 'Data Structures', code: 'CS301' }, date: format(subDays(today, 5), 'yyyy-MM-dd'), status: 'present', qr_verified: true, face_verified: false },
];

export const demoStudentSubjectStats = [
  { name: 'Data Structures', present: 4, total: 4 },
  { name: 'Algorithms', present: 2, total: 3 },
  { name: 'Database Systems', present: 3, total: 3 },
  { name: 'Operating Systems', present: 1, total: 2 },
];

// Monthly attendance data for MyAttendance page
export const demoMonthlyAttendance = [
  { month: 'Jan 26', present: 18, absent: 2 },
  { month: 'Feb 26', present: 20, absent: 3 },
  { month: 'Mar 26', present: 10, absent: 1 },
];

// Leave requests demo data
export const demoLeaveRequests = {
  student: [
    { id: 'lr1', student_id: 'demo-student', subject_id: 's1', class_id: 'class-1', leave_date: format(subDays(today, 2), 'yyyy-MM-dd'), reason: 'Medical appointment - doctor visit for regular checkup.', status: 'approved', review_note: 'Approved. Get well soon.', reviewed_by: 'demo-faculty', created_at: format(subDays(today, 4), 'yyyy-MM-dd'), subjects: { name: 'Data Structures', code: 'CS301' } },
    { id: 'lr2', student_id: 'demo-student', subject_id: 's2', class_id: 'class-1', leave_date: format(subDays(today, 1), 'yyyy-MM-dd'), reason: 'Family emergency - need to travel home urgently.', status: 'pending', review_note: null, reviewed_by: null, created_at: format(subDays(today, 1), 'yyyy-MM-dd'), subjects: { name: 'Algorithms', code: 'CS302' } },
    { id: 'lr3', student_id: 'demo-student', subject_id: 's3', class_id: 'class-1', leave_date: format(subDays(today, 10), 'yyyy-MM-dd'), reason: 'Participated in inter-college hackathon.', status: 'rejected', review_note: 'Hackathon is not a valid reason for leave.', reviewed_by: 'demo-faculty', created_at: format(subDays(today, 12), 'yyyy-MM-dd'), subjects: { name: 'Database Systems', code: 'CS303' } },
  ],
  faculty: [
    { id: 'lr1', student_id: 'demo-s1', subject_id: 's1', class_id: 'class-1', leave_date: format(subDays(today, 1), 'yyyy-MM-dd'), reason: 'Medical appointment.', status: 'pending', review_note: null, reviewed_by: null, created_at: format(subDays(today, 1), 'yyyy-MM-dd'), subjects: { name: 'Data Structures', code: 'CS301' }, student_profile: { full_name: 'Rahul Mehta', roll_number: 'CS2024-042' } },
    { id: 'lr2', student_id: 'demo-s2', subject_id: 's2', class_id: 'class-1', leave_date: format(subDays(today, 2), 'yyyy-MM-dd'), reason: 'Family function.', status: 'pending', review_note: null, reviewed_by: null, created_at: format(subDays(today, 2), 'yyyy-MM-dd'), subjects: { name: 'Algorithms', code: 'CS302' }, student_profile: { full_name: 'Priya Sharma', roll_number: 'CS2024-018' } },
    { id: 'lr3', student_id: 'demo-s3', subject_id: 's1', class_id: 'class-1', leave_date: format(subDays(today, 5), 'yyyy-MM-dd'), reason: 'Sports day participation.', status: 'approved', review_note: 'Approved.', reviewed_by: 'demo-faculty', created_at: format(subDays(today, 6), 'yyyy-MM-dd'), subjects: { name: 'Data Structures', code: 'CS301' }, student_profile: { full_name: 'Aditya Singh', roll_number: 'CS2024-005' } },
  ],
};

// Timetable demo data
export const demoTimetableSlots = [
  { id: 'ts1', class_id: 'class-1', subject_id: 's1', faculty_id: 'f1', day_of_week: 1, start_time: '09:00:00', end_time: '10:00:00', room: 'Room 201', subjects: { name: 'Data Structures', code: 'CS301' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Arun Kumar' },
  { id: 'ts2', class_id: 'class-1', subject_id: 's2', faculty_id: 'f2', day_of_week: 1, start_time: '10:15:00', end_time: '11:15:00', room: 'Room 202', subjects: { name: 'Algorithms', code: 'CS302' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Neha Gupta' },
  { id: 'ts3', class_id: 'class-1', subject_id: 's3', faculty_id: 'f1', day_of_week: 2, start_time: '09:00:00', end_time: '10:00:00', room: 'Lab 101', subjects: { name: 'Database Systems', code: 'CS303' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Arun Kumar' },
  { id: 'ts4', class_id: 'class-1', subject_id: 's4', faculty_id: 'f3', day_of_week: 2, start_time: '11:30:00', end_time: '12:30:00', room: 'Room 203', subjects: { name: 'Operating Systems', code: 'CS304' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Ravi Patel' },
  { id: 'ts5', class_id: 'class-1', subject_id: 's1', faculty_id: 'f1', day_of_week: 3, start_time: '09:00:00', end_time: '10:00:00', room: 'Room 201', subjects: { name: 'Data Structures', code: 'CS301' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Arun Kumar' },
  { id: 'ts6', class_id: 'class-1', subject_id: 's2', faculty_id: 'f2', day_of_week: 3, start_time: '14:00:00', end_time: '15:00:00', room: 'Room 202', subjects: { name: 'Algorithms', code: 'CS302' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Neha Gupta' },
  { id: 'ts7', class_id: 'class-1', subject_id: 's3', faculty_id: 'f1', day_of_week: 4, start_time: '10:15:00', end_time: '11:15:00', room: 'Lab 101', subjects: { name: 'Database Systems', code: 'CS303' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Arun Kumar' },
  { id: 'ts8', class_id: 'class-1', subject_id: 's4', faculty_id: 'f3', day_of_week: 4, start_time: '14:00:00', end_time: '15:00:00', room: 'Room 203', subjects: { name: 'Operating Systems', code: 'CS304' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Ravi Patel' },
  { id: 'ts9', class_id: 'class-1', subject_id: 's1', faculty_id: 'f1', day_of_week: 5, start_time: '09:00:00', end_time: '10:00:00', room: 'Room 201', subjects: { name: 'Data Structures', code: 'CS301' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Arun Kumar' },
  { id: 'ts10', class_id: 'class-1', subject_id: 's2', faculty_id: 'f2', day_of_week: 5, start_time: '11:30:00', end_time: '12:30:00', room: 'Room 202', subjects: { name: 'Algorithms', code: 'CS302' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Neha Gupta' },
  { id: 'ts11', class_id: 'class-1', subject_id: 's3', faculty_id: 'f1', day_of_week: 6, start_time: '09:00:00', end_time: '10:00:00', room: 'Lab 101', subjects: { name: 'Database Systems', code: 'CS303' }, classes: { name: 'CSE-A', section: '3rd Year' }, faculty_name: 'Prof. Arun Kumar' },
];

// Attendance history demo data (faculty view)
export const demoAttendanceHistory = [
  { id: 'ah1', date: format(subDays(today, 0), 'yyyy-MM-dd'), status: 'present', qr_verified: true, subjects: { name: 'Data Structures', code: 'CS301' }, student_profile: { full_name: 'Rahul Mehta', roll_number: 'CS2024-042' } },
  { id: 'ah2', date: format(subDays(today, 0), 'yyyy-MM-dd'), status: 'present', qr_verified: true, subjects: { name: 'Data Structures', code: 'CS301' }, student_profile: { full_name: 'Priya Sharma', roll_number: 'CS2024-018' } },
  { id: 'ah3', date: format(subDays(today, 0), 'yyyy-MM-dd'), status: 'absent', qr_verified: false, subjects: { name: 'Data Structures', code: 'CS301' }, student_profile: { full_name: 'Aditya Singh', roll_number: 'CS2024-005' } },
  { id: 'ah4', date: format(subDays(today, 1), 'yyyy-MM-dd'), status: 'present', qr_verified: true, subjects: { name: 'Algorithms', code: 'CS302' }, student_profile: { full_name: 'Rahul Mehta', roll_number: 'CS2024-042' } },
  { id: 'ah5', date: format(subDays(today, 1), 'yyyy-MM-dd'), status: 'late', qr_verified: true, subjects: { name: 'Algorithms', code: 'CS302' }, student_profile: { full_name: 'Priya Sharma', roll_number: 'CS2024-018' } },
  { id: 'ah6', date: format(subDays(today, 2), 'yyyy-MM-dd'), status: 'present', qr_verified: true, subjects: { name: 'Database Systems', code: 'CS303' }, student_profile: { full_name: 'Aditya Singh', roll_number: 'CS2024-005' } },
  { id: 'ah7', date: format(subDays(today, 2), 'yyyy-MM-dd'), status: 'present', qr_verified: true, subjects: { name: 'Database Systems', code: 'CS303' }, student_profile: { full_name: 'Rahul Mehta', roll_number: 'CS2024-042' } },
  { id: 'ah8', date: format(subDays(today, 3), 'yyyy-MM-dd'), status: 'absent', qr_verified: false, subjects: { name: 'Operating Systems', code: 'CS304' }, student_profile: { full_name: 'Priya Sharma', roll_number: 'CS2024-018' } },
];

// Session management demo data (faculty view)
export const demoFacultySessionSubjects = [
  { id: 's1', name: 'Data Structures', code: 'CS301', classes: { id: 'class-1', name: 'CSE-A 3rd Year' }, class_id: 'class-1' },
  { id: 's2', name: 'Algorithms', code: 'CS302', classes: { id: 'class-2', name: 'CSE-B 3rd Year' }, class_id: 'class-2' },
];

// Demo departments
export const demoDepartments = [
  { id: 'dept-1', name: 'Computer Science', code: 'CS', created_at: '2025-06-01T00:00:00Z' },
  { id: 'dept-2', name: 'Electronics & Communication', code: 'ECE', created_at: '2025-06-01T00:00:00Z' },
  { id: 'dept-3', name: 'Mechanical Engineering', code: 'ME', created_at: '2025-06-01T00:00:00Z' },
  { id: 'dept-4', name: 'Civil Engineering', code: 'CE', created_at: '2025-06-01T00:00:00Z' },
  { id: 'dept-5', name: 'Electrical Engineering', code: 'EE', created_at: '2025-06-01T00:00:00Z' },
  { id: 'dept-6', name: 'Information Technology', code: 'IT', created_at: '2025-06-01T00:00:00Z' },
];

// Demo classes
export const demoClasses = [
  { id: 'class-1', name: 'CSE-A', department_id: 'dept-1', year: 3, section: 'A', created_at: '2025-06-01T00:00:00Z', departments: { name: 'Computer Science' } },
  { id: 'class-2', name: 'CSE-B', department_id: 'dept-1', year: 3, section: 'B', created_at: '2025-06-01T00:00:00Z', departments: { name: 'Computer Science' } },
  { id: 'class-3', name: 'ECE-A', department_id: 'dept-2', year: 2, section: 'A', created_at: '2025-06-01T00:00:00Z', departments: { name: 'Electronics & Communication' } },
  { id: 'class-4', name: 'ME-A', department_id: 'dept-3', year: 1, section: 'A', created_at: '2025-06-01T00:00:00Z', departments: { name: 'Mechanical Engineering' } },
];

// Demo subjects (for admin manage page)
export const demoSubjects = [
  { id: 's1', name: 'Data Structures', code: 'CS301', department_id: 'dept-1', class_id: 'class-1', faculty_id: 'f1', departments: { name: 'Computer Science' }, classes: { name: 'CSE-A' } },
  { id: 's2', name: 'Algorithms', code: 'CS302', department_id: 'dept-1', class_id: 'class-2', faculty_id: 'f2', departments: { name: 'Computer Science' }, classes: { name: 'CSE-B' } },
  { id: 's3', name: 'Database Systems', code: 'CS303', department_id: 'dept-1', class_id: 'class-1', faculty_id: 'f1', departments: { name: 'Computer Science' }, classes: { name: 'CSE-A' } },
  { id: 's4', name: 'Operating Systems', code: 'CS304', department_id: 'dept-1', class_id: 'class-1', faculty_id: 'f3', departments: { name: 'Computer Science' }, classes: { name: 'CSE-A' } },
  { id: 's5', name: 'Digital Electronics', code: 'ECE201', department_id: 'dept-2', class_id: 'class-3', faculty_id: 'f4', departments: { name: 'Electronics & Communication' }, classes: { name: 'ECE-A' } },
];

// Demo students (for admin manage page)
export const demoStudents = [
  { id: 'p1', user_id: 'demo-s1', full_name: 'Rahul Mehta', email: 'rahul.m@demo.com', roll_number: 'CS2024-042', department_id: 'dept-1', class_id: 'class-1', departments: { name: 'Computer Science' }, classes: { name: 'CSE-A' } },
  { id: 'p2', user_id: 'demo-s2', full_name: 'Priya Sharma', email: 'priya.s@demo.com', roll_number: 'CS2024-018', department_id: 'dept-1', class_id: 'class-1', departments: { name: 'Computer Science' }, classes: { name: 'CSE-A' } },
  { id: 'p3', user_id: 'demo-s3', full_name: 'Aditya Singh', email: 'aditya.s@demo.com', roll_number: 'CS2024-005', department_id: 'dept-1', class_id: 'class-1', departments: { name: 'Computer Science' }, classes: { name: 'CSE-A' } },
  { id: 'p4', user_id: 'demo-s4', full_name: 'Sneha Patel', email: 'sneha.p@demo.com', roll_number: 'CS2024-031', department_id: 'dept-1', class_id: 'class-2', departments: { name: 'Computer Science' }, classes: { name: 'CSE-B' } },
  { id: 'p5', user_id: 'demo-s5', full_name: 'Vikram Reddy', email: 'vikram.r@demo.com', roll_number: 'ECE2024-012', department_id: 'dept-2', class_id: 'class-3', departments: { name: 'Electronics & Communication' }, classes: { name: 'ECE-A' } },
  { id: 'p6', user_id: 'demo-s6', full_name: 'Ananya Iyer', email: 'ananya.i@demo.com', roll_number: 'CS2024-007', department_id: 'dept-1', class_id: 'class-1', departments: { name: 'Computer Science' }, classes: { name: 'CSE-A' } },
  { id: 'p7', user_id: 'demo-s7', full_name: 'Karthik Nair', email: 'karthik.n@demo.com', roll_number: 'CS2024-022', department_id: 'dept-1', class_id: 'class-1', departments: { name: 'Computer Science' }, classes: { name: 'CSE-A' } },
  { id: 'p8', user_id: 'demo-s8', full_name: 'Divya Mishra', email: 'divya.m@demo.com', roll_number: 'CS2024-015', department_id: 'dept-1', class_id: 'class-2', departments: { name: 'Computer Science' }, classes: { name: 'CSE-B' } },
];

// Demo faculty (for admin manage page)
export const demoFaculty = [
  { id: 'fp1', user_id: 'f1', full_name: 'Prof. Arun Kumar', email: 'arun.k@demo.com', department_id: 'dept-1', departments: { name: 'Computer Science' }, subjectCount: 3 },
  { id: 'fp2', user_id: 'f2', full_name: 'Prof. Neha Gupta', email: 'neha.g@demo.com', department_id: 'dept-1', departments: { name: 'Computer Science' }, subjectCount: 1 },
  { id: 'fp3', user_id: 'f3', full_name: 'Prof. Ravi Patel', email: 'ravi.p@demo.com', department_id: 'dept-1', departments: { name: 'Computer Science' }, subjectCount: 1 },
  { id: 'fp4', user_id: 'f4', full_name: 'Prof. Sunita Verma', email: 'sunita.v@demo.com', department_id: 'dept-2', departments: { name: 'Electronics & Communication' }, subjectCount: 1 },
  { id: 'fp5', user_id: 'f5', full_name: 'Prof. Manoj Desai', email: 'manoj.d@demo.com', department_id: 'dept-3', departments: { name: 'Mechanical Engineering' }, subjectCount: 0 },
];

// Demo analytics data
export const demoAnalyticsData = {
  overallPercentage: 82,
  totalRecords: 1428,
  dailyData: Array.from({ length: 14 }, (_, i) => {
    const d = subDays(today, 13 - i);
    return {
      date: format(d, 'MMM d'),
      present: Math.floor(Math.random() * 30 + 170),
      absent: Math.floor(Math.random() * 15 + 10),
      late: Math.floor(Math.random() * 10 + 3),
    };
  }),
  monthlyData: [
    { month: 'Jan 26', percentage: 84 },
    { month: 'Feb 26', percentage: 81 },
    { month: 'Mar 26', percentage: 86 },
  ],
  subjectData: [
    { name: 'Data Structures', percentage: 88, present: 176, total: 200 },
    { name: 'Algorithms', percentage: 79, present: 158, total: 200 },
    { name: 'Database Systems', percentage: 85, present: 170, total: 200 },
    { name: 'Operating Systems', percentage: 74, present: 148, total: 200 },
    { name: 'Digital Electronics', percentage: 90, present: 180, total: 200 },
  ],
  statusData: [
    { name: 'Present', value: 1120 },
    { name: 'Absent', value: 210 },
    { name: 'Late', value: 98 },
  ],
  deptData: [
    { name: 'Computer Science', percentage: 83, present: 652, total: 785 },
    { name: 'Electronics', percentage: 87, present: 348, total: 400 },
    { name: 'Mechanical', percentage: 78, present: 195, total: 250 },
  ],
  topAbsentees: [
    { student_id: 'demo-s5', full_name: 'Vikram Reddy', roll_number: 'ECE2024-012', percentage: 62, total: 50 },
    { student_id: 'demo-s8', full_name: 'Divya Mishra', roll_number: 'CS2024-015', percentage: 70, total: 40 },
    { student_id: 'demo-s4', full_name: 'Sneha Patel', roll_number: 'CS2024-031', percentage: 73, total: 45 },
  ],
};

// Demo admin monitoring data
export const demoMonitoringData = {
  liveSessions: [
    { id: 'ls1', session_status: 'active', start_time: new Date(Date.now() - 1800000).toISOString(), end_time: new Date(Date.now() + 1800000).toISOString(), subjects: { name: 'Data Structures', code: 'CS301' }, classes: { name: 'CSE-A' } },
    { id: 'ls2', session_status: 'active', start_time: new Date(Date.now() - 900000).toISOString(), end_time: new Date(Date.now() + 2700000).toISOString(), subjects: { name: 'Digital Electronics', code: 'ECE201' }, classes: { name: 'ECE-A' } },
  ],
  suspiciousFlags: [
    { id: 'sf1', student_id: 'demo-s4', flag_type: 'same_location', created_at: new Date(Date.now() - 600000).toISOString(), resolved: false, student_name: 'Sneha Patel' },
  ],
  recentAttendance: [
    { id: 'ra1', student_id: 'demo-s1', status: 'present', timestamp: new Date(Date.now() - 300000).toISOString(), qr_verified: true, face_verified: true, subjects: { name: 'Data Structures' }, student_profile: { full_name: 'Rahul Mehta', roll_number: 'CS2024-042' } },
    { id: 'ra2', student_id: 'demo-s2', status: 'present', timestamp: new Date(Date.now() - 240000).toISOString(), qr_verified: true, face_verified: false, subjects: { name: 'Data Structures' }, student_profile: { full_name: 'Priya Sharma', roll_number: 'CS2024-018' } },
    { id: 'ra3', student_id: 'demo-s3', status: 'late', timestamp: new Date(Date.now() - 120000).toISOString(), qr_verified: true, face_verified: true, subjects: { name: 'Data Structures' }, student_profile: { full_name: 'Aditya Singh', roll_number: 'CS2024-005' } },
  ],
  lowAttendanceStudents: [
    { student_id: 'demo-s5', full_name: 'Vikram Reddy', roll_number: 'ECE2024-012', percentage: 62, total: 50 },
    { student_id: 'demo-s8', full_name: 'Divya Mishra', roll_number: 'CS2024-015', percentage: 70, total: 40 },
  ],
};

// Demo mark attendance students
export const demoMarkAttendanceStudents = [
  { user_id: 'demo-s1', full_name: 'Rahul Mehta', email: 'rahul.m@demo.com', roll_number: 'CS2024-042' },
  { user_id: 'demo-s2', full_name: 'Priya Sharma', email: 'priya.s@demo.com', roll_number: 'CS2024-018' },
  { user_id: 'demo-s3', full_name: 'Aditya Singh', email: 'aditya.s@demo.com', roll_number: 'CS2024-005' },
  { user_id: 'demo-s6', full_name: 'Ananya Iyer', email: 'ananya.i@demo.com', roll_number: 'CS2024-007' },
  { user_id: 'demo-s7', full_name: 'Karthik Nair', email: 'karthik.n@demo.com', roll_number: 'CS2024-022' },
];
