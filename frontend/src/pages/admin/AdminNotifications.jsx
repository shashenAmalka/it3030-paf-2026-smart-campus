import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { Bell, CheckCircle2, Calendar, Ticket, Shield, Clock, Search, Filter } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const TYPE_CONFIG = {
  BOOKING_CREATED:  { icon: Calendar, color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'Booking Request' },
  BOOKING_APPROVED: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Booking Approved' },
  BOOKING_REJECTED: { icon: Shield, color: 'text-red-500',    bg: 'bg-red-50',    label: 'Booking Rejected' },
  TICKET_CREATED:   { icon: Ticket, color: 'text-amber-500',  bg: 'bg-amber-50',  label: 'New Ticket' },
  STATUS_UPDATED:   { icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Status Update' },
  COMMENT_ADDED:    { icon: Bell, color: 'text-purple-500', bg: 'bg-purple-50', label: 'New Comment' },
  SYSTEM:           { icon: Shield, color: 'text-slate-500',  bg: 'bg-slate-50',  label: 'System Alert' },
};

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications('ADMIN');
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await notificationService.markAsRead(n.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD' && n.read) return false;
    if (search.trim()) {
      const hay = (n.title + ' ' + n.message).toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const resolvePath = (n) => {
    if (n.relatedBookingId) return '/admin/bookings';
    if (n.relatedTicketId) return `/admin/tickets/${n.relatedTicketId}?tab=chat`;
    return null;
  };

  return (
    <div className="animate-in fade-in duration-500 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Bell className="text-indigo-600" /> Notifications
          </h1>
          <p className="text-slate-500 mt-1">Stay updated with the latest campus activities and requests</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            Mark all as read
          </button>
          <button 
            onClick={load}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
          {['ALL', 'UNREAD'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Fetching updates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No notifications found</h3>
          <p className="text-slate-500 mt-2">You're all caught up with your campus duties!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(n => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM;
            const Icon = config.icon;
            const path = resolvePath(n);
            
            return (
              <div 
                key={n.id}
                onClick={() => {
                  handleMarkRead(n.id);
                  if (path) navigate(path);
                }}
                className={`group bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${
                  n.read ? 'border-slate-100 opacity-75' : 'border-indigo-100 bg-indigo-50/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${config.bg} ${config.color} transition-transform group-hover:scale-105`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={12} /> {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {n.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  
                  {!n.read && (
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-2"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
