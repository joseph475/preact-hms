import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Modal from './Modal';

const formatDT = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const ExtendStayModal = ({ isOpen, onClose, booking, onExtendBooking }) => {
  const [hours, setHours] = useState(1);
  const [charge, setCharge] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-suggest charge based on tiered room pricing
  useEffect(() => {
    const pricing = booking?.room?.roomType?.pricing || {};
    const penalty = booking?.room?.roomType?.penalty || 0;
    const h = Number(hours);
    let suggested = 0;
    if (h >= 24)      suggested = pricing.daily    || 0;
    else if (h >= 12) suggested = pricing.hourly12 || 0;
    else if (h >= 8)  suggested = pricing.hourly8  || 0;
    else if (h >= 3)  suggested = pricing.hourly3  || 0;
    else              suggested = penalty * h;
    setCharge(suggested);
  }, [hours, booking]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHours(1);
      setNotes('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const currentCheckOut = booking?.checkOutDate;
  const newCheckOut = currentCheckOut
    ? new Date(new Date(currentCheckOut).getTime() + Number(hours) * 3600000).toISOString()
    : null;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await onExtendBooking(booking._id, {
        hours: Number(hours),
        charge: Number(charge),
        notes
      });
      if (result?.success) {
        onClose();
      } else {
        setError(result?.message || 'Failed to extend stay. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Extend Stay" size="default">
      <div className="space-y-4">
        {/* Hours input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extend by (hours)
          </label>
          <select
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
            <option value="8">8 hours</option>
            <option value="12">12 hours</option>
            <option value="24">24 hours</option>
          </select>
        </div>

        {/* Charge input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Charge (₱)
          </label>
          <input
            type="number"
            min="0"
            value={charge}
            onInput={(e) => setCharge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Applying: <span className="font-medium text-purple-600">{(() => {
              const h = Number(hours);
              const pricing = booking?.room?.roomType?.pricing || {};
              const penalty = booking?.room?.roomType?.penalty || 0;
              if (h === 24) return `Daily rate (₱${(pricing.daily || 0).toLocaleString()})`;
              if (h === 12) return `12-hour rate (₱${(pricing.hourly12 || 0).toLocaleString()})`;
              if (h === 8)  return `8-hour rate (₱${(pricing.hourly8 || 0).toLocaleString()})`;
              if (h === 3)  return `3-hour rate (₱${(pricing.hourly3 || 0).toLocaleString()})`;
              return `Penalty rate ₱${penalty.toLocaleString()} × ${h} hr${h > 1 ? 's' : ''}`;
            })()}</span> — editable
          </p>
        </div>

        {/* Notes textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            rows="2"
            value={notes}
            onInput={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this extension..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          />
        </div>

        {/* Preview section */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Checkout Preview</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current checkout:</span>
              <span className="font-medium text-gray-900">{formatDT(currentCheckOut)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">New checkout:</span>
              <span className="font-medium text-purple-700">{formatDT(newCheckOut)}</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 transition-colors duration-150 disabled:opacity-50 flex items-center"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Extend Stay
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExtendStayModal;
