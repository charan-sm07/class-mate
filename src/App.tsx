import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Demo from "./pages/Demo";
import MarkAttendanceWrapper from "./pages/MarkAttendanceWrapper";
import QRAttendanceWrapper from "./pages/QRAttendanceWrapper";
import ScanQRWrapper from "./pages/ScanQRWrapper";
import MyAttendanceWrapper from "./pages/MyAttendanceWrapper";
import DepartmentsWrapper from "./pages/DepartmentsWrapper";
import SubjectsWrapper from "./pages/SubjectsWrapper";
import StudentsWrapper from "./pages/StudentsWrapper";
import FacultyWrapper from "./pages/FacultyWrapper";
import AnalyticsWrapper from "./pages/AnalyticsWrapper";
import ClassesWrapper from "./pages/ClassesWrapper";
import AttendanceHistoryWrapper from "./pages/AttendanceHistoryWrapper";
import ProfileWrapper from "./pages/ProfileWrapper";
import SessionManagementWrapper from "./pages/SessionManagementWrapper";
import AdminMonitoringWrapper from "./pages/AdminMonitoringWrapper";
import LeaveRequestsWrapper from "./pages/LeaveRequestsWrapper";
import TimetableWrapper from "./pages/TimetableWrapper";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DemoProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><ProfileWrapper /></ProtectedRoute>} />
            {/* Admin routes */}
            <Route path="/dashboard/students" element={<ProtectedRoute allowedRoles={['admin']}><StudentsWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/faculty" element={<ProtectedRoute allowedRoles={['admin']}><FacultyWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/departments" element={<ProtectedRoute allowedRoles={['admin']}><DepartmentsWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/subjects" element={<ProtectedRoute allowedRoles={['admin']}><SubjectsWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/classes" element={<ProtectedRoute allowedRoles={['admin']}><ClassesWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AnalyticsWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/monitoring" element={<ProtectedRoute allowedRoles={['admin']}><AdminMonitoringWrapper /></ProtectedRoute>} />
            {/* Faculty routes */}
            <Route path="/dashboard/sessions" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><SessionManagementWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/mark-attendance" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><MarkAttendanceWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/qr-attendance" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><QRAttendanceWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/attendance-history" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><AttendanceHistoryWrapper /></ProtectedRoute>} />
            {/* Student routes */}
            <Route path="/dashboard/scan-qr" element={<ProtectedRoute allowedRoles={['student']}><ScanQRWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/my-attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendanceWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/leave-requests" element={<ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}><LeaveRequestsWrapper /></ProtectedRoute>} />
            <Route path="/dashboard/timetable" element={<ProtectedRoute><TimetableWrapper /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </DemoProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
