import { useState, useEffect } from 'react';
import {
  Shield, CheckCircle, XCircle,
  Users, RefreshCw, Globe, Lock
} from 'lucide-react';
import {
  getLoginActivity,
  getSecurityStats
} from '../../services/loginAuditService';

// Avatar circle using initials
const Avatar = ({ name }) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';
  return (
    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700
                    flex items-center justify-center text-sm font-semibold
                    flex-shrink-0">
      {initials}
    </div>
  );
};

// Format time ago
const timeAgo = (timestamp) => {
  const seconds = Math.floor(
    (new Date() - new Date(timestamp)) / 1000
  );
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const LoginActivityDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        getLoginActivity(),
        getSecurityStats()
      ]);
      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-100 rounded w-48" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Shield size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Login Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent authentication events
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">

          <div className="bg-slate-50 border border-slate-100
                          rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-700">
              {stats.totalLogins}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Total today
            </p>
          </div>

          <div className={`rounded-xl p-4 text-center border
            ${stats.failedAttempts > 0
              ? 'bg-red-50 border-red-100'
              : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-2xl font-bold
              ${stats.failedAttempts > 0
                ? 'text-red-700' : 'text-slate-400'}`}>
              {stats.failedAttempts}
            </p>
            <p className={`text-xs mt-1
              ${stats.failedAttempts > 0
                ? 'text-red-600' : 'text-slate-400'}`}>
              Failed attempts
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100
                          rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-700">
              {stats.uniqueUsers || 0}
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              Unique users
            </p>
          </div>

        </div>
      )}

      {/* Failed attempts warning */}
      {stats && stats.failedAttempts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl
                        px-4 py-3 mb-4 flex items-center gap-2">
          <XCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">
              {stats.failedAttempts} failed attempt
              {stats.failedAttempts > 1 ? 's' : ''}
            </span>
            {' '}detected today
          </p>
        </div>
      )}

      {/* Activity log */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Users size={40} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No login activity yet</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-center gap-3 p-3 rounded-xl
                          border transition-colors
                ${log.status === 'FAILED'
                  ? 'bg-red-50 border-red-100'
                  : 'bg-slate-50 border-slate-100'}`}
            >
              {/* Avatar */}
              {log.status === 'SUCCESS' ? (
                <Avatar name={log.fullName} />
              ) : (
                <div className="w-9 h-9 rounded-full bg-red-100
                                flex items-center justify-center flex-shrink-0">
                  <XCircle size={18} className="text-red-500" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {log.fullName || log.email || 'Unknown'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Method badge */}
                  <span className={`inline-flex items-center gap-1
                                    text-xs rounded-full px-2 py-0.5
                    ${log.loginMethod === 'GOOGLE'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-200 text-slate-600'}`}>
                    {log.loginMethod === 'GOOGLE'
                      ? <Globe size={10} />
                      : <Lock size={10} />}
                    {log.loginMethod || 'PASSWORD'}
                  </span>
                  {/* Role badge */}
                  {log.role && (
                    <span className="text-xs text-slate-400">
                      {log.role}
                    </span>
                  )}
                  {/* Failure reason */}
                  {log.failureReason && (
                    <span className="text-xs text-red-500">
                      · {log.failureReason}
                    </span>
                  )}
                </div>
              </div>

              {/* Status + Time */}
              <div className="text-right flex-shrink-0">
                {log.status === 'SUCCESS' ? (
                  <CheckCircle size={16} className="text-green-500 ml-auto mb-1" />
                ) : (
                  <XCircle size={16} className="text-red-500 ml-auto mb-1" />
                )}
                <p className="text-xs text-slate-400">
                  {timeAgo(log.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoginActivityDashboard;
