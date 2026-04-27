import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, CheckSquare, Hourglass, TrendingUp,
  User, Mail, CalendarDays, Shield, Award, Edit,
  Lock, KeyRound, CheckCircle2, ChevronDown, Bell, EyeOff, Eye
} from 'lucide-react';
import NotificationPreferences from '../../components/notifications/NotificationPreferences';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, changePassword } = useAuth();
  const userRole = user?.role ?? 'USER';

  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState({ msg: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, newPass: false, confirm: false });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwStatus({ msg: '', type: '' });

    if (form.newPass.length < 6) {
      setPwStatus({ msg: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (form.newPass !== form.confirm) {
      setPwStatus({ msg: 'New passwords do not match.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await changePassword(form.current, form.newPass);
      setPwStatus({ msg: 'Password changed successfully!', type: 'success' });
      setForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPwStatus({ msg: err.message || 'Failed to change password.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const activityStats = [
    { icon: Calendar, value: 12, label: 'Total Bookings', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: CheckSquare, value: 8, label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Hourglass, value: 3, label: 'Pending Tickets', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: TrendingUp, value: 1, label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const loginMethod = user?.email?.includes('@sliit.lk') ? 'SLIIT Email' : 'Campus Login';
  const joinDate = 'April 2026';
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-inter animate-in fade-in duration-500">
      
      {/* Header section similar to image */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account settings and personal information</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {activityStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-105`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                  <a href="#" className="text-xs text-indigo-600 font-semibold mt-1 inline-block hover:underline">View all &rarr;</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column (Profile Info) */}
        <div className="xl:col-span-7 space-y-8">
          
          {/* Main User Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            {/* Subtle background abstract */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user?.picture ? (
                    <img src={user.picture} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-emerald-400 text-white flex items-center justify-center text-4xl font-bold shadow-sm">
                      {user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Student Name'}</h2>
                  <p className="text-slate-500 text-sm mt-1">{user?.email || 'email@example.com'}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">Student</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{loginMethod}</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden sm:block">
                <span className="px-4 py-1.5 border border-indigo-200 text-indigo-600 bg-white text-xs font-bold rounded-full shadow-sm">STUDENT ACCOUNT</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-100 relative z-10">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Mail size={18} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><CalendarDays size={18} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Member Since</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{joinDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500"><Shield size={18} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Profile Valid</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{currentYear} - {currentYear + 1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Grid */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-indigo-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Edit size={16} /> Edit Information
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400"><Mail size={18} /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400"><User size={18} /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Role</p>
                  <p className="text-sm font-semibold text-slate-900">{userRole}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400"><User size={18} /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Full Name</p>
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400"><CalendarDays size={18} /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Member Since</p>
                  <p className="text-sm font-semibold text-slate-900">{joinDate}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400"><Shield size={18} /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Session Type</p>
                  <p className="text-sm font-semibold text-slate-900">{loginMethod}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400"><Award size={18} /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Profile Valid</p>
                  <p className="text-sm font-semibold text-slate-900">{currentYear} - {currentYear + 1}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Need Help Card */}
          <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full"><span className="font-bold text-lg">🎧</span></div>
               <div>
                 <h4 className="font-bold text-slate-900">Need Help?</h4>
                 <p className="text-sm text-slate-500">Can't find what you're looking for?</p>
               </div>
             </div>
             <button className="px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl border border-indigo-200 shadow-sm text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2">
               Visit Help Center <TrendingUp size={16} className="rotate-45" />
             </button>
          </div>

        </div>

        {/* Right Column (Security & Preferences) */}
        <div className="xl:col-span-5 space-y-8">
          
          {/* Security & Password */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Security & Password</h3>
              <p className="text-sm text-slate-500">Keep your account secure</p>
            </div>

            {pwStatus.msg && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 ${
                pwStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {pwStatus.type === 'success' ? <CheckCircle2 size={18} /> : null}
                {pwStatus.msg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword.current ? "text" : "password"}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none text-sm transition-all"
                    placeholder="Enter current password"
                    value={form.current}
                    onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(p => ({...p, current: !p.current}))}
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type={showPassword.newPass ? "text" : "password"}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none text-sm transition-all"
                    placeholder="Enter new password"
                    value={form.newPass}
                    onChange={e => setForm(p => ({ ...p, newPass: e.target.value }))}
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(p => ({...p, newPass: !p.newPass}))}
                  >
                    {showPassword.newPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none text-sm transition-all"
                    placeholder="Confirm new password"
                    value={form.confirm}
                    onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(p => ({...p, confirm: !p.confirm}))}
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                  disabled={saving || !form.current || !form.newPass || !form.confirm}
                >
                  <Lock size={18} />
                  {saving ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
             <NotificationPreferences />
          </div>
          
        </div>
      </div>
    </div>
  );
}
