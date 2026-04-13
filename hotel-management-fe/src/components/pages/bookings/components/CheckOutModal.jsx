import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Modal from '../../../common/Modal';

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online Payment'];

const CheckOutModal = ({ isOpen, booking, onClose, onConfirm, isLoading }) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [bankReference, setBankReference] = useState('');
  const [paymentMode, setPaymentMode] = useState('full'); // 'full' | 'partial'
  const [partialAmountStr, setPartialAmountStr] = useState('');

  // totalAmount = original room charge only (extensions stored separately)
  const roomCharge = booking?.totalAmount || 0;
  const extensionTotal = (booking?.extensionCharges || []).reduce((s, c) => s + (c.charge || 0), 0);
  const foodTotal = (booking?.foodOrders || []).reduce((s, o) => s + (o.total || 0), 0);
  const grandTotal = roomCharge + extensionTotal + foodTotal;

  const partialAmount = parseFloat(partialAmountStr) || 0;
  const paidAmount = paymentMode === 'full' ? grandTotal : partialAmount;
  const balance = grandTotal - paidAmount;

  // Reset state whenever a new booking is loaded into the modal
  useEffect(() => {
    if (booking) {
      setPaymentMethod(booking.paymentMethod || 'Cash');
      setBankReference(booking.bankReference || '');
      setPaymentMode('full');
      setPartialAmountStr('');
    }
  }, [booking?._id]);

  const handleConfirm = () => {
    onConfirm({ paymentMethod, bankReference, paidAmount });
  };

  if (!booking) return null;

  const hasExtensions = extensionTotal > 0;
  const hasFoodOrders = foodTotal > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check Out Guest" size="medium" closeOnOverlayClick={!isLoading}>
      <div className="space-y-5">

        {/* Guest & Room */}
        <div className="pb-3 border-b border-amber-100">
          <p className="font-bold text-stone-900">
            {booking.guest?.firstName} {booking.guest?.lastName}
          </p>
          <p className="text-sm text-stone-500">
            Room {booking.room?.roomNumber} · {booking.room?.roomType}
          </p>
        </div>

        {/* Payment Breakdown */}
        <div>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Charges</p>
          <div className="divide-y divide-amber-100 rounded-xl border border-amber-100 overflow-hidden">

            <div className="flex justify-between px-4 py-2.5 bg-white">
              <span className="text-sm text-stone-500">Room charge</span>
              <span className="text-sm font-semibold text-stone-900">₱{roomCharge.toLocaleString()}</span>
            </div>

            {hasExtensions && (
              <div className="flex justify-between px-4 py-2.5 bg-white">
                <span className="text-sm text-stone-500">Extension charges</span>
                <span className="text-sm font-semibold text-stone-900">₱{extensionTotal.toLocaleString()}</span>
              </div>
            )}

            {hasFoodOrders && (
              <div className="px-4 py-2.5 bg-white">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-stone-500">Food &amp; Beverage</span>
                  <span className="text-sm font-semibold text-stone-900">₱{foodTotal.toLocaleString()}</span>
                </div>
                <div className="pl-3 space-y-0.5">
                  {(booking.foodOrders || []).map((order, i) => (
                    <div key={order._id || i} className="flex justify-between text-xs text-stone-400">
                      <span>{order.quantity}× {order.name}</span>
                      <span>₱{(order.total || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between px-4 py-3 bg-amber-50">
              <span className="text-sm font-bold text-amber-900">Grand Total</span>
              <span className="text-base font-extrabold text-amber-900">₱{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Payment</p>

          {/* Payment Method */}
          <div>
            <label className="form-label">Method</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isLoading}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Bank Reference */}
          {paymentMethod === 'Bank Transfer' && (
            <div>
              <label className="form-label">Bank Reference / Account Details</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BDO Ref #12345678"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Full vs Partial toggle */}
          <div>
            <label className="form-label mb-1">Amount</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('full')}
                disabled={isLoading}
                className={`px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                  paymentMode === 'full'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-stone-600 border-stone-300 hover:border-emerald-400'
                }`}
              >
                Paid in Full
                <div className={`text-xs font-normal mt-0.5 ${paymentMode === 'full' ? 'text-emerald-100' : 'text-stone-400'}`}>
                  ₱{grandTotal.toLocaleString()}
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('partial');
                  setPartialAmountStr('');
                }}
                disabled={isLoading}
                className={`px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                  paymentMode === 'partial'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400'
                }`}
              >
                Partial Payment
                <div className={`text-xs font-normal mt-0.5 ${paymentMode === 'partial' ? 'text-amber-100' : 'text-stone-400'}`}>
                  enter amount below
                </div>
              </button>
            </div>
          </div>

          {/* Partial amount input */}
          {paymentMode === 'partial' && (
            <div>
              <label className="form-label">
                Amount Received
                <span className="ml-1 text-xs font-normal text-stone-400">
                  (out of ₱{grandTotal.toLocaleString()})
                </span>
              </label>
              <input
                type="number"
                className="form-input"
                min="0"
                max={grandTotal}
                step="1"
                placeholder="0"
                value={partialAmountStr}
                onChange={(e) => setPartialAmountStr(e.target.value)}
                onFocus={(e) => e.target.select()}
                disabled={isLoading}
                autoFocus
              />

              {/* Balance feedback */}
              {partialAmountStr !== '' && (
                balance > 0 ? (
                  <div className="mt-2 flex justify-between items-center bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                    <span className="text-sm font-semibold text-red-700">Balance still owed</span>
                    <span className="text-sm font-bold text-red-700">₱{balance.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="mt-2 flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                    <span className="text-sm font-semibold text-emerald-700">Fully covered</span>
                    <span className="text-sm font-bold text-emerald-700">₱{grandTotal.toLocaleString()}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="btn-outline" disabled={isLoading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary"
            disabled={isLoading || (paymentMode === 'partial' && partialAmountStr === '')}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                Processing...
              </div>
            ) : (
              'Check Out & Save Payment'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckOutModal;
