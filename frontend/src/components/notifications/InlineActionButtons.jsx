import { useState } from 'react';
import { api } from '../../context/AuthContext';
import { Check, X } from 'lucide-react';

const InlineActionButtons = ({ notificationId, actionType, actionCompleted, onActionDone }) => {
  const [loading, setLoading] = useState(false);

  if (actionCompleted) {
    return (
      <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded">
        <Check size={12} /> Action completed
      </div>
    );
  }

  const handleAction = async (action) => {
    try {
      setLoading(true);
      await api.post(`/api/notifications/${notificationId}/action`, { action });
      if (onActionDone) onActionDone();
    } catch (error) {
      console.error('Failed to perform action', error);
    } finally {
      setLoading(false);
    }
  };

  if (actionType === 'APPROVAL') {
    return (
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={(e) => { e.stopPropagation(); handleAction('APPROVE'); }}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Check size={14} />
          Approve
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleAction('REJECT'); }}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <X size={14} />
          Reject
        </button>
      </div>
    );
  }

  if (actionType === 'TICKET_RESOLUTION') {
    return (
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={(e) => { e.stopPropagation(); handleAction('CONFIRM_RESOLUTION'); }}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <Check size={14} />
          Confirm Fixed
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleAction('DISPUTE_RESOLUTION'); }}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-100 disabled:opacity-50 transition-colors"
        >
          <X size={14} />
          Still Broken
        </button>
      </div>
    );
  }

  return null;
};

export default InlineActionButtons;
