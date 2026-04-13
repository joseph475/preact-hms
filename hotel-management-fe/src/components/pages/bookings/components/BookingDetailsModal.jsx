import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Modal from '../../../common/Modal';

const BookingDetailsModal = ({
  showDetailsModal,
  handleDetailsModalClose,
  bookingToViewDetails,
  formatDateTime,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Reset to Overview whenever a different booking is opened
  useEffect(() => {
    setActiveTab('overview');
  }, [bookingToViewDetails?._id]);

  if (!bookingToViewDetails) return null;

  const b = bookingToViewDetails;
  const roomType = typeof b.room?.roomType === 'object'
    ? b.room?.roomType?.name
    : b.room?.roomType;
  const hasExtensions = b.extensionCharges?.length > 0;
  const extensionTotal = hasExtensions
    ? b.extensionCharges.reduce((s, e) => s + (e.charge || 0), 0)
    : 0;
  const foodTotal = (b.foodOrders || []).reduce((sum, o) => sum + (o.total || 0), 0);
  const hasFoodOrders = foodTotal > 0;
  const grandTotal = (b.totalAmount || 0) + extensionTotal + foodTotal;
  const balance = grandTotal - (b.paidAmount || 0);

  // Use actual check-in/out times if recorded; fall back to booked duration
  let stayDuration;
  if (b.actualCheckIn && b.actualCheckOut) {
    const ms = new Date(b.actualCheckOut) - new Date(b.actualCheckIn);
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    stayDuration = `${hours}h ${minutes}m`;
  } else {
    stayDuration = `${b.duration}h`;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timing',   label: 'Timing'   },
    { id: 'payment',  label: 'Payment'  },
    { id: 'audit',    label: 'Activity' },
  ];

  return (
    <Modal
      isOpen={showDetailsModal}
      onClose={handleDetailsModalClose}
      title=""
      showCloseButton={false}
      size="large"
    >
      {/* Modal header — bg-amber-50 to match modal-header style */}
      <div className="-mx-6 -mt-4 bg-amber-50 border-b border-amber-100 px-6 py-5 rounded-t-2xl">
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={handleDetailsModalClose}
            className="text-amber-400 hover:text-amber-600 transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">
          Booking #{b.bookingNumber || b._id?.slice(-8)}
        </div>
        <div className="text-2xl font-extrabold text-amber-900 mb-3">
          Room {b.room?.roomNumber} — {roomType}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="bg-amber-200 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full">
            {b.bookingStatus}
          </span>
          <span className="text-amber-600 text-xs">
            {formatDateTime(b.checkInDate)} → {formatDateTime(b.checkOutDate)}
          </span>
        </div>
      </div>

      {/* Tab bar — also bleeds to edges */}
      <div className="flex border-b border-amber-100 bg-amber-50 -mx-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-semibold transition-colors focus:outline-none ${
              activeTab === tab.id
                ? 'text-amber-900 border-b-2 border-amber-500 bg-white'
                : 'text-amber-600 hover:text-amber-800 hover:bg-amber-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-5">

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Room</p>
                <p className="text-xl font-extrabold text-stone-900">{b.room?.roomNumber}</p>
                <p className="text-xs text-stone-500">
                  {roomType} · {b.guestCount} guest{b.guestCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Guest</p>
                <p className="text-base font-bold text-stone-900">
                  {b.guest?.firstName} {b.guest?.lastName}
                </p>
                <p className="text-xs text-stone-500">{b.guest?.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">ID</p>
                <p className="text-sm font-bold text-stone-900">{b.guest?.idType}</p>
                <p className="text-xs text-stone-500">{b.guest?.idNumber}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Payment</p>
                <p className="text-sm font-bold text-emerald-600">{b.paymentStatus}</p>
                <p className="text-xs text-stone-500">
                  ₱{b.totalAmount?.toLocaleString()} · {b.paymentMethod || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-sm text-amber-800">Total stay</span>
              <span className="text-base font-extrabold text-amber-900">{stayDuration}</span>
            </div>
          </div>
        )}

        {/* ── Timing ── */}
        {activeTab === 'timing' && (
          <div className="space-y-4">
            <div className="divide-y divide-amber-100">
              <div className="flex items-start gap-3 pb-4">
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Check-in</p>
                  <p className="text-sm font-bold text-stone-900">{formatDateTime(b.checkInDate)}</p>
                  {b.actualCheckIn && (
                    <p className="text-xs text-stone-500 mt-0.5">Actual: {formatDateTime(b.actualCheckIn)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 pt-4">
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Check-out</p>
                  <p className="text-sm font-bold text-stone-900">{formatDateTime(b.checkOutDate)}</p>
                  {b.actualCheckOut
                    ? <p className="text-xs text-stone-500 mt-0.5">Actual: {formatDateTime(b.actualCheckOut)}</p>
                    : <p className="text-xs text-stone-400 mt-0.5">Not yet checked out</p>
                  }
                </div>
              </div>
            </div>

            {hasExtensions && (
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
                  Extensions (+{b.extensionCharges.reduce((s, e) => s + (e.hours || 0), 0)}h total)
                </p>
                <div className="space-y-2">
                  {b.extensionCharges.map((ext, i) => (
                    <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-900">
                          +{ext.hours}h{ext.notes ? ` · ${ext.notes}` : ''}
                        </span>
                        <span className="text-sm font-bold text-amber-800">
                          +₱{ext.charge?.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        New checkout: {formatDateTime(ext.newCheckOutDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Payment ── */}
        {activeTab === 'payment' && (
          <div className="space-y-3">
            <div className="divide-y divide-amber-100">
              <div className="flex justify-between py-2.5">
                <span className="text-sm text-stone-500">Room charge</span>
                <span className="text-sm font-bold text-stone-900">
                  ₱{(b.totalAmount ?? 0).toLocaleString()}
                </span>
              </div>
              {hasExtensions && (
                <div className="flex justify-between py-2.5">
                  <span className="text-sm text-stone-500">Extension charges</span>
                  <span className="text-sm font-bold text-stone-900">
                    ₱{extensionTotal.toLocaleString()}
                  </span>
                </div>
              )}
              {hasFoodOrders && (
                <div className="py-2.5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-stone-500">Food &amp; Beverage</span>
                    <span className="text-sm font-bold text-stone-900">₱{foodTotal.toLocaleString()}</span>
                  </div>
                  <div className="pl-3 space-y-1">
                    {(b.foodOrders || []).map((order, i) => (
                      <div key={order._id || i} className="flex justify-between text-xs text-stone-400">
                        <span>{order.quantity}× {order.name}</span>
                        <span>₱{(order.total || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between py-2.5">
                <span className="text-sm text-stone-500">Payment method</span>
                <span className="text-sm font-bold text-stone-900">
                  {b.paymentMethod || 'Not specified'}
                </span>
              </div>
              {b.bankReference && (
                <div className="flex justify-between py-2.5">
                  <span className="text-sm text-stone-500">Bank reference</span>
                  <span className="text-sm font-bold text-stone-900">{b.bankReference}</span>
                </div>
              )}
              <div className="flex justify-between py-2.5">
                <span className="text-sm text-stone-500">Amount paid</span>
                <span className="text-sm font-bold text-emerald-600">
                  ₱{(b.paidAmount || 0).toLocaleString()}
                </span>
              </div>
              {balance > 0 && (
                <div className="flex justify-between py-2.5">
                  <span className="text-sm text-stone-500">Balance due</span>
                  <span className="text-sm font-bold text-red-600">
                    ₱{balance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-sm font-bold text-amber-900">Grand Total</span>
              <span className="text-xl font-extrabold text-amber-900">
                ₱{grandTotal.toLocaleString()}
              </span>
            </div>

            {(b.specialRequests || b.notes) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
                {b.specialRequests && (
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
                      Special Requests
                    </p>
                    <p className="text-sm text-amber-900">{b.specialRequests}</p>
                  </div>
                )}
                {b.notes && (
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-amber-900">{b.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Activity / Audit ── */}
        {activeTab === 'audit' && (
          <div>
            {(!b.auditLog || b.auditLog.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No activity recorded</p>
                <p className="text-xs text-gray-300 mt-1">Old bookings may not have an activity log.</p>
              </div>
            ) : (
              <ol className="relative border-l border-amber-200 ml-3 space-y-4">
                {[...b.auditLog].reverse().map((entry, i) => {
                  const dotColor = {
                    'Created':          'bg-blue-500',
                    'Checked In':       'bg-green-500',
                    'Checked Out':      'bg-amber-500',
                    'Cancelled':        'bg-red-500',
                    'No Show':          'bg-red-400',
                    'Extended':         'bg-gray-400',
                    'Food Order Added': 'bg-gray-400',
                  }[entry.action] || 'bg-gray-300';
                  return (
                    <li key={i} className="ml-4">
                      <span className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-white ${dotColor}`} />
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-stone-900">{entry.action}</p>
                          <p className="text-xs text-stone-500">{entry.performedBy}</p>
                          {entry.notes && (
                            <p className="text-xs text-stone-400 mt-0.5 italic">{entry.notes}</p>
                          )}
                        </div>
                        <time className="text-xs text-stone-400 whitespace-nowrap flex-shrink-0">
                          {entry.timestamp
                            ? new Date(entry.timestamp).toLocaleString('en-US', {
                                month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })
                            : '—'}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};

export default BookingDetailsModal;
