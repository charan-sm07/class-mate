import DashboardLayout from '@/components/DashboardLayout';
import LeaveRequests from './dashboard/LeaveRequests';

const LeaveRequestsWrapper = () => (
  <DashboardLayout>
    <LeaveRequests />
  </DashboardLayout>
);

export default LeaveRequestsWrapper;