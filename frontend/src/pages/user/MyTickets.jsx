import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { ticketCategories, ticketPriorities } from '../../mock/tickets';
import SLATimer from '../../components/SLATimer';
import ToastContainer, { toast } from '../../components/tickets/ToastNotification';
import { Plus, MapPin, Folder, ChevronDown, ImagePlus, AlertTriangle, X, Ticket, Search, Clock3 } from 'lucide-react';

const TABS = ['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_USER_CONFIRMATION', 'RESOLVED', 'CLOSED', 'REJECTED'];

const STATUS_LABELS = {
  ALL: 'All',
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_USER_CONFIRMATION: 'Waiting for You',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export default function MyTickets() {
  const navigate = useNavigate();
  
  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() - Date.now() <= 0;
  };
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cancellingId, setCancellingId] = useState('');
  const [editingTicketId, setEditingTicketId] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [ticketToCancel, setTicketToCancel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'MAINTENANCE',
    priority: 'MEDIUM',
    location: '',
    tags: '',
  });

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    location: '',
    tags: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (!showCreate && !showEdit && !showCancel) return;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (showCancel) {
        closeCancelModal();
        return;
      }
      if (showEdit) {
        if (!updating) setShowEdit(false);
        return;
      }
      if (showCreate && !creating) setShowCreate(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCreate, showEdit, showCancel, creating, updating, cancellingId]);

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await ticketService.getMyTickets();
      setTickets(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    const errors = validateForm(form);
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setCreating(true);
    try {
      const tags = form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      await ticketService.create({ ...form, tags });
      toast.success('Ticket created successfully');
      setShowCreate(false);
      setForm({
        title: '',
        description: '',
        category: 'MAINTENANCE',
        priority: 'MEDIUM',
        location: '',
        tags: '',
      });
      setCreateErrors({});
      await loadTickets();
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setCreating(false);
    }
  }

  function openEdit(ticket) {
    setEditingTicketId(ticket.id);
    setEditErrors({});
    setEditForm({
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'MEDIUM',
      location: ticket.location || '',
      tags: Array.isArray(ticket.tags) ? ticket.tags.join(', ') : '',
    });
    setShowEdit(true);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingTicketId) return;
    const errors = validateForm(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setUpdating(true);
    try {
      const tags = editForm.tags
        ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await ticketService.updateTicket(editingTicketId, {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        location: editForm.location,
        tags,
      });
      toast.success('Ticket updated successfully');
      setShowEdit(false);
      setEditingTicketId('');
      setEditErrors({});
      await loadTickets();
    } catch {
      toast.error('Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  }

  function openCancelModal(ticket) {
    setTicketToCancel(ticket);
    setCancelReason('');
    setShowCancel(true);
  }

  function closeCancelModal() {
    if (cancellingId) return;
    setShowCancel(false);
    setTicketToCancel(null);
    setCancelReason('');
  }

  async function handleCancelTicket() {
    if (!ticketToCancel) return;

    setCancellingId(ticketToCancel.id);
    try {
      await ticketService.cancelTicket(ticketToCancel.id, cancelReason);
      toast.info('Ticket cancelled successfully');
      closeCancelModal();
      await loadTickets();
    } catch {
      toast.error('Failed to cancel ticket');
    } finally {
      setCancellingId('');
    }
  }

  const filtered = activeTab === 'ALL'
    ? tickets
    : tickets.filter((t) => t.status === activeTab);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleTickets = filtered
    .filter((ticket) => {
      if (!normalizedQuery) return true;
      const searchable = [
        ticket.ticketId,
        ticket.title,
        ticket.description,
        ticket.location,
        ticket.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    })
    .sort((a, b) => {
      const aCreated = new Date(a.createdAt || 0).getTime();
      const bCreated = new Date(b.createdAt || 0).getTime();

      if (sortBy === 'OLDEST') return aCreated - bCreated;
      if (sortBy === 'PRIORITY') {
        const priorityWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
        const aPriority = priorityWeight[a.priority] || 0;
        const bPriority = priorityWeight[b.priority] || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        return bCreated - aCreated;
      }
      if (sortBy === 'SLA_RISK') {
        const rankSlaRisk = (ticket) => {
          const actionable = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';
          if (!actionable || !ticket.slaDeadline) return Number.MAX_SAFE_INTEGER;
          return new Date(ticket.slaDeadline).getTime() - Date.now();
        };
        return rankSlaRisk(a) - rankSlaRisk(b);
      }

      return bCreated - aCreated;
    });

  const tabCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    acc.ALL += 1;
    return acc;
  }, { ALL: 0 });

  const getPriorityOptionLabel = (priority) => {
    if (priority === 'CRITICAL') return 'Critical';
    if (priority === 'HIGH') return 'High';
    if (priority === 'MEDIUM') return 'Medium';
    return 'Low';
  };

  const getStatusLabel = (status) => STATUS_LABELS[status] || status.replaceAll('_', ' ');

  const getStatusBadgeClass = (status) => {
    if (status === 'OPEN') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (status === 'IN_PROGRESS') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'WAITING_USER_CONFIRMATION') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (status === 'RESOLVED') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const formatRelativeDate = (dateValue) => {
    const target = new Date(dateValue || Date.now()).getTime();
    const now = Date.now();
    const diffMs = target - now;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffDays) >= 1) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(diffDays, 'day');
    }

    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (Math.abs(diffHours) >= 1) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(diffHours, 'hour');
    }

    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(diffMinutes, 'minute');
  };

  const validateForm = (payload) => {
    const errors = {};
    if (!payload.title?.trim()) errors.title = 'Title is required.';
    if (!payload.description?.trim()) errors.description = 'Description is required.';
    if (!payload.location?.trim()) errors.location = 'Location is required.';
    return errors;
  };

  const getEmptyStateContent = () => {
    if (searchQuery.trim()) {
      return {
        title: 'No matching tickets',
        message: 'Try a different keyword or clear your current search.',
        actionLabel: 'Clear Search',
        onAction: () => setSearchQuery(''),
      };
    }

    if (activeTab === 'ALL') {
      return {
        title: 'No tickets yet',
        message: "You haven't submitted any tickets yet.",
        actionLabel: 'Create New Ticket',
        onAction: () => setShowCreate(true),
      };
    }

    return {
      title: `No ${getStatusLabel(activeTab)} tickets`,
      message: 'There are no tickets in this status right now.',
      actionLabel: 'Show All Tickets',
      onAction: () => setActiveTab('ALL'),
    };
  };

  return (
    <div className="font-['Inter'] bg-slate-50 min-h-screen p-4 sm:p-6">
      <ToastContainer />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Tickets</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage your maintenance requests</p>
        </div>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer w-full sm:w-auto" 
          onClick={() => setShowCreate(true)}
        >
          <Plus size={16} />  New Ticket
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="mb-6 overflow-x-auto pb-1">
        <div className="bg-white rounded-xl border border-slate-200 p-1 inline-flex min-w-max" role="tablist" aria-label="Ticket status filters">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                className={`cursor-pointer px-4 py-1.5 text-sm transition-colors duration-150 rounded-lg whitespace-nowrap inline-flex items-center gap-2 ${isActive ? 'bg-indigo-600 text-white font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab(tab)}
              >
                <span>{getStatusLabel(tab)}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tabCounts[tab] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search by title, location, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="ticket-sort" className="text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">Sort by</label>
          <select
            id="ticket-sort"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="NEWEST">Newest first</option>
            <option value="OLDEST">Oldest first</option>
            <option value="PRIORITY">Priority</option>
            <option value="SLA_RISK">SLA risk</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">Loading tickets...</div>
      ) : visibleTickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="mb-4 inline-flex rounded-full bg-indigo-50 p-3 text-indigo-600">
            <Ticket size={22} />
          </div>
          <h3 className="text-slate-900 font-semibold mb-2">{getEmptyStateContent().title}</h3>
          <p className="text-slate-500">{getEmptyStateContent().message}</p>
          <button
            className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-150 cursor-pointer"
            onClick={getEmptyStateContent().onAction}
          >
            {getEmptyStateContent().actionLabel}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className={`rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition duration-150 relative ${isOverdue(ticket.slaDeadline) && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-semibold px-2.5 py-1 rounded-full">{ticket.ticketId || ticket.id}</span>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' : ticket.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {getPriorityOptionLabel(ticket.priority)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 text-base mt-2">{ticket.title}</h3>
              <p className="text-slate-500 text-sm mt-1 line-clamp-2">{ticket.description}</p>
              
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" /><span className="text-xs text-slate-500">{ticket.location}</span></div>
                <div className="flex items-center gap-1.5"><Folder size={12} className="text-slate-400" /><span className="text-xs text-slate-500">{ticket.category}</span></div>
              </div>

              {isOverdue(ticket.slaDeadline) && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 border border-red-200">
                  <Clock3 size={12} />
                  Needs urgent attention
                </div>
              )}

              {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && ticket.slaDeadline && (
                <div className="mt-3">
                  <SLATimer deadline={ticket.slaDeadline} />
                </div>
              )}

              {ticket.status === 'OPEN' && (
                <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-lg transition duration-150 font-medium cursor-pointer" onClick={() => openEdit(ticket)}>Edit</button>
                  <button className="text-xs border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition duration-150 font-medium cursor-pointer" onClick={() => openCancelModal(ticket)} disabled={cancellingId === ticket.id}>{cancellingId === ticket.id ? '...' : 'Cancel'}</button>
                </div>
              )}

              <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">Created {formatRelativeDate(ticket.createdAt)}</span>
                <button
                  className="text-indigo-600 text-xs font-medium hover:underline cursor-pointer"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  View details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE SLIDE-IN PANEL */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity ${showCreate ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/20" onClick={() => setShowCreate(false)}></div>
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Create ticket panel"
          className={`relative w-full sm:w-[30rem] h-full bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 ${showCreate ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900 text-lg">Report an Issue</h2>
            <button className="rounded-lg hover:bg-slate-100 p-2 transition duration-150 cursor-pointer" onClick={() => setShowCreate(false)}>
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
              <input 
                className={`rounded-xl border px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${createErrors.title ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}
                placeholder="Brief summary of the issue"
                value={form.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((p) => ({ ...p, title: value }));
                  if (createErrors.title) {
                    setCreateErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
              />
              {createErrors.title && <p className="mt-1 text-xs text-red-600">{createErrors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                className={`rounded-xl border px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none ${createErrors.description ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}
                rows={4}
                placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((p) => ({ ...p, description: value }));
                  if (createErrors.description) {
                    setCreateErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
              />
              {createErrors.description && <p className="mt-1 text-xs text-red-600">{createErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <div className="relative">
                  <select 
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm w-full bg-white appearance-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    value={form.category}
                    onChange={(e) => setForm(p => ({...p, category: e.target.value}))}
                  >
                    {ticketCategories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                <div className="relative">
                  <select 
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm w-full bg-white appearance-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    value={form.priority}
                    onChange={(e) => setForm(p => ({...p, priority: e.target.value}))}
                  >
                    {ticketPriorities.map((p) => <option key={p} value={p}>{getPriorityOptionLabel(p)}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                  className={`rounded-xl border pl-10 pr-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${createErrors.location ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}
                  placeholder="e.g. Block A, Floor 2"
                  value={form.location}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((p) => ({ ...p, location: value }));
                    if (createErrors.location) {
                      setCreateErrors((prev) => ({ ...prev, location: undefined }));
                    }
                  }}
                />
              </div>
              {createErrors.location && <p className="mt-1 text-xs text-red-600">{createErrors.location}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</label>
              <input 
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="projector, urgent, block-a (comma separated)"
                value={form.tags}
                onChange={(e) => setForm(p => ({...p, tags: e.target.value}))}
              />
              <p className="text-xs text-slate-400 mt-1">Helps with ticket routing and search</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Attachments (Mock)</label>
              <div className="border border-dashed border-slate-300 rounded-2xl bg-slate-50 p-6 text-center cursor-pointer hover:bg-slate-100 transition">
                <ImagePlus className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 text-sm">Drag images here or click to browse</p>
                <p className="text-slate-400 text-xs mt-1">Max 3 images · JPG, PNG · Up to 5MB each</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 flex gap-3 bg-white">
            <button className="border border-slate-200 text-slate-700 font-medium rounded-lg flex-1 py-2.5 transition hover:bg-slate-50 cursor-pointer" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex-1 py-2.5 transition flex justify-center items-center cursor-pointer" onClick={handleCreate} disabled={creating}>
              {creating ? <span className="animate-pulse">Creating...</span> : 'Create Ticket'}
            </button>
          </div>
        </div>
      </div>

      {/* EDIT SLIDE-IN PANEL (matching create panel design) */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity ${showEdit ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/20" onClick={() => setShowEdit(false)}></div>
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Edit ticket panel"
          className={`relative w-full sm:w-[30rem] h-full bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 ${showEdit ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900 text-lg">Edit Ticket</h2>
            <button className="rounded-lg hover:bg-slate-100 p-2 transition duration-150 cursor-pointer" onClick={() => setShowEdit(false)}>
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
              <input 
                className={`rounded-xl border px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${editErrors.title ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}
                value={editForm.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditForm((p) => ({ ...p, title: value }));
                  if (editErrors.title) {
                    setEditErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
              />
              {editErrors.title && <p className="mt-1 text-xs text-red-600">{editErrors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                className={`rounded-xl border px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none ${editErrors.description ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}
                rows={4}
                value={editForm.description}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditForm((p) => ({ ...p, description: value }));
                  if (editErrors.description) {
                    setEditErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
              />
              {editErrors.description && <p className="mt-1 text-xs text-red-600">{editErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                <div className="relative">
                  <select 
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm w-full bg-white appearance-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    value={editForm.priority}
                    onChange={(e) => setEditForm(p => ({...p, priority: e.target.value}))}
                  >
                    {ticketPriorities.map((p) => <option key={p} value={p}>{getPriorityOptionLabel(p)}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                  className={`rounded-xl border pl-10 pr-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${editErrors.location ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}
                  value={editForm.location}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditForm((p) => ({ ...p, location: value }));
                    if (editErrors.location) {
                      setEditErrors((prev) => ({ ...prev, location: undefined }));
                    }
                  }}
                />
              </div>
              {editErrors.location && <p className="mt-1 text-xs text-red-600">{editErrors.location}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</label>
              <input 
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                value={editForm.tags}
                onChange={(e) => setEditForm(p => ({...p, tags: e.target.value}))}
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 flex gap-3 bg-white">
            <button className="border border-slate-200 text-slate-700 font-medium rounded-lg flex-1 py-2.5 transition hover:bg-slate-50 cursor-pointer" onClick={() => setShowEdit(false)}>
              Cancel
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex-1 py-2.5 transition flex justify-center items-center cursor-pointer" onClick={handleUpdate} disabled={updating}>
              {updating ? <span className="animate-pulse">Saving...</span> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* CANCEL TICKET MODAL */}
      {showCancel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative" role="dialog" aria-modal="true" aria-label="Cancel ticket confirmation">
            <div className="text-center">
              <AlertTriangle className="text-amber-500 mx-auto" size={24} />
              <h2 className="font-bold text-slate-900 text-lg mt-2">Cancel Ticket</h2>
              <p className="text-slate-500 text-sm mt-1">This will move {ticketToCancel?.ticketId || 'this ticket'} to rejected state.</p>
            </div>
            
            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason (Optional)</label>
              <textarea 
                className="rounded-xl border border-slate-200 w-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                rows={3}
                placeholder="Add a short reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                className="border border-slate-200 text-slate-700 font-medium rounded-lg flex-1 py-2.5 transition hover:bg-slate-50 cursor-pointer"
                onClick={closeCancelModal}
                disabled={!!cancellingId}
              >
                Keep Ticket
              </button>
              <button 
                className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex-1 py-2.5 transition cursor-pointer"
                onClick={handleCancelTicket}
                disabled={!!cancellingId}
              >
                {cancellingId ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
