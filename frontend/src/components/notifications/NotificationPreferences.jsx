import { useState, useEffect } from 'react';
import {
  Bell, Calendar, Ticket, MessageCircle,
  Flame, Settings, Check
} from 'lucide-react';
import {
  getPreferences,
  updatePreferences
} from '../../services/notificationPreferenceService';

// Toggle Switch Component
const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors duration-200 focus:outline-none
                ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full
                      bg-white shadow-sm transition-transform duration-200
                      ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState({
    bookingUpdates: true,
    ticketUpdates: true,
    commentAlerts: true,
    slaWarnings: true,
    systemAlerts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await getPreferences();
      setPrefs({
        bookingUpdates: data.bookingUpdates,
        ticketUpdates: data.ticketUpdates,
        commentAlerts: data.commentAlerts,
        slaWarnings: data.slaWarnings,
        systemAlerts: data.systemAlerts,
      });
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      await updatePreferences(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Failed to save. Please try again.');
      setPrefs(prefs); // revert on error
    }
  };

  const preferenceItems = [
    {
      key: 'bookingUpdates',
      icon: Calendar,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      label: 'Booking Updates',
      description: 'Approvals, rejections, and cancellations',
    },
    {
      key: 'ticketUpdates',
      icon: Ticket,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      label: 'Ticket Updates',
      description: 'Status changes and technician assignments',
    },
    {
      key: 'commentAlerts',
      icon: MessageCircle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      label: 'Comment Alerts',
      description: 'New replies on your tickets',
    },
    {
      key: 'slaWarnings',
      icon: Flame,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      label: 'SLA Warnings',
      description: 'Alerts when tickets are overdue',
    },
    {
      key: 'systemAlerts',
      icon: Settings,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      label: 'System Alerts',
      description: 'Important platform announcements',
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex justify-between items-center py-3">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-slate-100 rounded-xl" />
              <div>
                <div className="w-32 h-4 bg-slate-100 rounded mb-1" />
                <div className="w-48 h-3 bg-slate-50 rounded" />
              </div>
            </div>
            <div className="w-11 h-6 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Notification Preferences
          </h3>
          <p className="text-sm text-slate-500">
            Choose what you want to be notified about
          </p>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check size={14} /> Saved
            </span>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-slate-600">Select All</span>
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Preference rows */}
      <div className="space-y-1">
        {preferenceItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`flex items-center justify-between py-4 ${index !== preferenceItems.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${item.iconBg}`}>
                  <Icon size={20} className={item.iconColor} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
              <Toggle
                enabled={prefs[item.key]}
                onChange={(val) => handleToggle(item.key, val)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPreferences;
