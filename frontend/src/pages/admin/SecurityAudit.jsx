import LoginActivityDashboard from '../../components/admin/LoginActivityDashboard';

export default function SecurityAudit() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Security Audit</h1>
        <p className="text-slate-500">Monitor system access and authentication events.</p>
      </div>
      
      <LoginActivityDashboard />
    </div>
  );
}
