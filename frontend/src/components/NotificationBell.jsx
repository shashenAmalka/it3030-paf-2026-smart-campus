/**
 * NotificationBell.jsx
 * ─────────────────────────────────────────────────────────────────
 * Dark Theme Notification Bell + Dropdown with SMART GROUPING.
 * Groups notifications by Ticket ID (Gmail style).
 * ─────────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import InlineActionButtons from './notifications/InlineActionButtons';

const TYPE_AVATAR = {
  BOOKING_CREATED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'BK' },
  BOOKING_APPROVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'BK' },
  BOOKING_REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'BK' },
  TICKET_CREATED: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'TK' },
  TICKET_ASSIGNED: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'TK' },
  STATUS_UPDATED: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'TK' },
  COMMENT_ADDED: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'TK' },
  DISPUTED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'TK' },
  CLOSED: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'TK' },
  SYSTEM: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'SYS' },
};

function resolvePath(role, notification) {
  if (notification.relatedBookingId) {
    return role === 'ADMIN' ? '/admin/bookings' : '/my-bookings';
  }
  
  const ticketId = notification.relatedTicketId;
  if (!ticketId) return null;
  
  if (role === 'ADMIN') return `/admin/tickets/${ticketId}?tab=chat`;
  if (role === 'TECHNICIAN') return `/technician/tickets/${ticketId}?tab=conversation`;
  return `/tickets/${ticketId}?tab=conversation`;
}

export default function NotificationBell({ role }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const dropdownRef = useRef(null);

  /* ── Load notifications ─────────────────────────────────────── */
  const load = useCallback(async () => {
    if (!role) return;
    try {
      const data = await notificationService.getNotifications(role);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }, [role]);

  useEffect(() => {
    load();
    const timerId = window.setInterval(load, 30000);
    return () => window.clearInterval(timerId);
  }, [load]);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  /* ── Close on outside click ─────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ── Actions ────────────────────────────────────────────────── */
  const handleMarkRead = async (notification) => {
    await notificationService.markAsRead(notification.id);
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));

    const path = resolvePath(role, notification);
    if (path) {
      setOpen(false);
      navigate(path);
    }
  };

  const toggleGroup = (id, e) => {
    e.stopPropagation();
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* ── Grouping Logic ───────────────────────────────────────── */
  const groupedNotifications = (() => {
    const groups = [];
    const ticketGroups = {}; // key: ticketId

    notifications.forEach(n => {
      if (n.relatedTicketId) {
        if (!ticketGroups[n.relatedTicketId]) {
          ticketGroups[n.relatedTicketId] = {
            id: `group-${n.relatedTicketId}`,
            type: 'GROUP',
            ticketId: n.relatedTicketId,
            items: [],
            latestTimestamp: n.createdAt,
            unreadCount: 0
          };
          groups.push(ticketGroups[n.relatedTicketId]);
        }
        ticketGroups[n.relatedTicketId].items.push(n);
        if (!n.read) ticketGroups[n.relatedTicketId].unreadCount++;
        
        // Ensure latest item is at index 0 and update timestamp
        if (new Date(n.createdAt) > new Date(ticketGroups[n.relatedTicketId].latestTimestamp)) {
          ticketGroups[n.relatedTicketId].latestTimestamp = n.createdAt;
          // Put the newest at the start of the internal items list
          const idx = ticketGroups[n.relatedTicketId].items.indexOf(n);
          if (idx > 0) {
            ticketGroups[n.relatedTicketId].items.splice(idx, 1);
            ticketGroups[n.relatedTicketId].items.unshift(n);
          }
        }
      } else {
        groups.push({ ...n, groupType: 'SINGLE' });
      }
    });

    return groups.sort((a, b) => {
      const timeA = a.type === 'GROUP' ? a.latestTimestamp : a.createdAt;
      const timeB = b.type === 'GROUP' ? b.latestTimestamp : b.createdAt;
      return new Date(timeB) - new Date(timeA);
    });
  })();

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        className={`relative p-2 rounded-xl transition-all duration-200
          ${open ? 'bg-[#2a2a3c] border border-amber-500' : 'hover:bg-slate-700/50 border border-transparent'}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <BellIcon className={`w-5 h-5 ${open ? 'text-slate-200' : 'text-slate-300'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#1e1e2e]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <div 
        className={`absolute right-0 mt-3 w-80 md:w-96 bg-[#1a1b26] rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-200 origin-top-right border border-slate-700/50
        ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <span className="font-bold text-white text-sm">Notifications</span>
          <span className="text-slate-300 text-xs font-medium">{unreadCount} unread</span>
        </div>

        {/* List */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar py-2">
          {groupedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="text-3xl mb-2">🎉</span>
              <span className="text-slate-400 text-sm">All caught up!</span>
            </div>
          ) : (
            <div className="space-y-1.5 px-2">
              {groupedNotifications.map(g => {
                // RENDER GROUPED NOTIFICATIONS
                if (g.type === 'GROUP') {
                  const isExpanded = expandedGroups[g.id];
                  const latest = g.items[0];
                  return (
                    <div key={g.id} className="flex flex-col">
                      <div
                        className={`relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-150
                          ${g.unreadCount > 0 ? 'bg-[#242636] border border-amber-500/40' : 'bg-transparent hover:bg-slate-800/40 border border-transparent'}`}
                        onClick={() => handleMarkRead(latest)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 bg-amber-500/20 text-amber-500">
                          TK
                        </div>
                        <div className="flex-1 min-w-0 pr-10">
                          <div className="font-semibold text-white text-[13px] flex items-center gap-2">
                            {latest.title.split(' ')[0]} 
                            <span className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded-md font-medium">
                              {g.items.length} updates
                            </span>
                          </div>
                          <div className="text-xs mt-0.5 text-slate-300 line-clamp-1">
                            {latest.message}
                          </div>
                        </div>
                        
                        <button 
                          onClick={(e) => toggleGroup(g.id, e)}
                          className="absolute right-3 top-3 p-1 hover:bg-slate-700 rounded-md text-slate-400 transition-colors z-10"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        <div className="absolute right-3 bottom-3 text-[10px] font-medium text-slate-500">
                          {timeShort(g.latestTimestamp)}
                        </div>
                      </div>

                      {/* Expanded Sub-items */}
                      {isExpanded && (
                        <div className="ml-8 mt-1 mb-2 space-y-1 border-l-2 border-slate-700/50 pl-3 py-1">
                          {g.items.slice(1).map(item => (
                            <div 
                              key={item.id} 
                              onClick={() => handleMarkRead(item)}
                              className="p-2 hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors relative"
                            >
                              <div className="text-[12px] font-medium text-slate-200">{item.title}</div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">{item.message}</div>
                              <div className="text-[9px] text-slate-500 mt-0.5">{timeShort(item.createdAt)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // RENDER SINGLE NOTIFICATION
                const n = g;
                const avatar = TYPE_AVATAR[n.type] || { bg: 'bg-slate-700', text: 'text-slate-300', label: 'N' };
                return (
                  <div
                    key={n.id}
                    className={`relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-150
                      ${n.read ? 'bg-transparent hover:bg-slate-800/40 border border-transparent' : 'bg-[#242636] border border-amber-500/40 hover:border-amber-500/60'}`}
                    onClick={() => handleMarkRead(n)}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 ${avatar.bg} ${avatar.text}`}>
                      {avatar.label}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="font-semibold text-white text-[13px] truncate">{n.title}</div>
                      <div className={`text-xs mt-0.5 leading-snug line-clamp-2 ${n.read ? 'text-slate-400' : 'text-slate-300'}`}>
                        {n.message}
                      </div>
                      {n.hasAction && (
                        <div onClick={(e) => e.stopPropagation()} className="mt-2">
                          <InlineActionButtons
                            notificationId={n.id}
                            actionType={n.actionType}
                            actionCompleted={n.actionCompleted}
                            onActionDone={load}
                          />
                        </div>
                      )}
                    </div>
                    <div className="absolute right-3 top-3 text-[11px] font-medium text-slate-400">
                      {timeShort(n.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */
function timeShort(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function BellIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
