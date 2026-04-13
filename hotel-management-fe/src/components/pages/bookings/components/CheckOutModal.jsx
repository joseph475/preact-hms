import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Modal from '../../../common/Modal';

const PAYMENT_METHODS = ['Cash', 'GCash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online Payment'];

const emptyRow = () => ({ method: 'Cash', amountStr: '', reference: '' });

const DISCOUNT_TYPES = [
  { value: 'none',    label: 'No Discount' },
  { value: 'sc',     label: 'Senior Citizen (20%)' },
  { value: 'pwd',    label: 'PWD (20%)' },
  { value: 'percent', label: 'Custom %' },
  { value: 'flat',   label: 'Custom Amount (₱)' },
];

const CheckOutModal = ({ isOpen, booking, onClose, onConfirm, isLoading }) => {
  const [payments, setPayments] = useState([emptyRow()]);
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState('');

  const roomCharge = booking?.totalAmount || 0;
  const extensionTotal = (booking?.extensionCharges || []).reduce((s, c) => s + (c.charge || 0), 0);
  const foodTotal = (booking?.foodOrders || []).reduce((s, o) => s + (o.total || 0), 0);
  const grandTotal = roomCharge + extensionTotal + foodTotal;

  // Discount applies to room + extension charges (SC/PWD law); custom applies to grand total
  const discountBase = discountType === 'sc' || discountType === 'pwd'
    ? roomCharge + extensionTotal
    : grandTotal;
  let discountAmount = 0;
  if (discountType === 'sc' || discountType === 'pwd') {
    discountAmount = Math.round(discountBase * 0.20);
  } else if (discountType === 'percent') {
    discountAmount = Math.round(grandTotal * (parseFloat(discountValue) || 0) / 100);
  } else if (discountType === 'flat') {
    discountAmount = Math.min(parseFloat(discountValue) || 0, grandTotal);
  }
  const discountedTotal = grandTotal - discountAmount;

  const alreadyPaid = booking?.paidAmount || 0;
  const balanceDue = Math.max(0, discountedTotal - alreadyPaid);

  const totalPaid = payments.reduce((s, p) => s + (parseFloat(p.amountStr) || 0), 0);
  const remaining = balanceDue - totalPaid;
  const isFullyPaid = remaining <= 0.01;

  // Full reset when a new booking is loaded — compute due fresh (no stale closure on discount)
  useEffect(() => {
    if (!booking) return;
    const rc = booking.totalAmount || 0;
    const et = (booking.extensionCharges || []).reduce((s, c) => s + (c.charge || 0), 0);
    const ft = (booking.foodOrders || []).reduce((s, o) => s + (o.total || 0), 0);
    const due = Math.max(0, rc + et + ft - (booking.paidAmount || 0));
    setPayments([{ method: booking.paymentMethod || 'Cash', amountStr: String(due), reference: booking.bankReference || '' }]);
    setDiscountType('none');
    setDiscountValue('');
  }, [booking?._id]);

  // Keep first row in sync with balance due whenever it changes (discount applied/removed)
  useEffect(() => {
    setPayments(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], amountStr: String(balanceDue) };
      return updated;
    });
  }, [balanceDue]);

  const updateRow = (i, field, value) => {
    setPayments(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const addRow = () => {
    const leftover = Math.max(0, remaining);
    setPayments(prev => [...prev, { method: 'Cash', amountStr: leftover > 0 ? String(leftover) : '', reference: '' }]);
  };

  const removeRow = (i) => {
    setPayments(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleConfirm = () => {
    const paymentRows = payments.map(p => ({
      method: p.method,
      amount: parseFloat(p.amountStr) || 0,
      reference: p.reference,
    }));
    onConfirm({
      payments: paymentRows,
      paidAmount: alreadyPaid + totalPaid,
      discountAmount,
      discountType,
    });
  };

  if (!booking) return null;

  const hasExtensions = extensionTotal > 0;
  const hasFoodOrders = foodTotal > 0;
  const hasDiscount = discountAmount > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check Out Guest" size="medium" closeOnOverlayClick={!isLoading}>
      <div className="space-y-5">

        {/* Guest & Room */}
        <div className="pb-3 border-b border-primary-100">
          <p className="font-bold text-stone-900">
            {booking.guest?.firstName} {booking.guest?.lastName}
          </p>
          <p className="text-sm text-stone-500">
            Room {booking.room?.roomNumber} · {booking.room?.roomType}
          </p>
        </div>

        {/* Payment Breakdown */}
        <div>
          <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Charges</p>
          <div className="divide-y divide-primary-100 rounded-xl border border-primary-100 overflow-hidden">

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

            {hasDiscount && (
              <div className="flex justify-between px-4 py-2.5 bg-emerald-50">
                <span className="text-sm text-emerald-700">
                  Discount
                  {discountType === 'sc' && ' (Senior Citizen 20%)'}
                  {discountType === 'pwd' && ' (PWD 20%)'}
                  {discountType === 'percent' && ` (${discountValue}%)`}
                </span>
                <span className="text-sm font-semibold text-emerald-700">−₱{discountAmount.toLocaleString()}</span>
              </div>
            )}

            {alreadyPaid > 0 && (
              <div className="flex justify-between px-4 py-2.5 bg-emerald-50">
                <span className="text-sm text-emerald-700">Previously paid</span>
                <span className="text-sm font-semibold text-emerald-700">−₱{alreadyPaid.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between px-4 py-3 bg-primary-50">
              <span className="text-sm font-bold text-primary-900">
                {alreadyPaid > 0 || hasDiscount ? 'Balance Due' : 'Grand Total'}
              </span>
              <span className="text-base font-extrabold text-primary-900">
                ₱{balanceDue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div>
          <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Discount</p>
          <div className="space-y-2">
            <select
              className="form-select text-sm"
              value={discountType}
              onChange={(e) => { setDiscountType(e.target.value); setDiscountValue(''); }}
              disabled={isLoading}
            >
              {DISCOUNT_TYPES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            {(discountType === 'percent' || discountType === 'flat') && (
              <input
                type="number"
                className="form-input text-sm"
                min="0"
                step={discountType === 'percent' ? '0.1' : '1'}
                placeholder={discountType === 'percent' ? 'e.g. 10 (%)' : 'e.g. 500 (₱)'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={isLoading}
              />
            )}
          </div>
        </div>

        {/* Split Payment Rows */}
        <div>
          <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">Payment</p>
          <div className="space-y-3">
            {payments.map((row, i) => (
              <div key={i} className="border border-primary-100 rounded-xl p-3 space-y-2.5 bg-primary-50">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary-700 uppercase tracking-wide">
                    {payments.length > 1 ? `Payment ${i + 1}` : 'Payment Method'}
                  </span>
                  {payments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      disabled={isLoading}
                      className="text-stone-400 hover:text-red-500 transition-colors text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Method</label>
                    <select
                      className="form-select text-sm"
                      value={row.method}
                      onChange={(e) => updateRow(i, 'method', e.target.value)}
                      disabled={isLoading}
                    >
                      {PAYMENT_METHODS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Amount (₱)</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={row.amountStr}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateRow(i, 'amountStr', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {row.method === 'Bank Transfer' && (
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Reference / Account</label>
                    <input
                      type="text"
                      className="form-input text-sm"
                      placeholder="e.g. BDO Ref #12345678"
                      value={row.reference}
                      onChange={(e) => updateRow(i, 'reference', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            disabled={isLoading || isFullyPaid}
            className="mt-2 w-full text-sm text-primary-600 hover:text-primary-800 border border-dashed border-primary-300 rounded-xl py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add another payment method
          </button>
        </div>

        {/* Running total / balance */}
        <div className={`rounded-xl px-4 py-3 flex justify-between items-center ${
          isFullyPaid
            ? 'bg-emerald-50 border border-emerald-200'
            : remaining > 0
              ? 'bg-red-50 border border-red-200'
              : 'bg-amber-50 border border-amber-200'
        }`}>
          <span className={`text-sm font-semibold ${
            isFullyPaid ? 'text-emerald-700' : remaining > 0 ? 'text-red-700' : 'text-amber-700'
          }`}>
            {isFullyPaid ? 'Fully paid' : remaining > 0 ? 'Balance still owed' : 'Overpaid by'}
          </span>
          <span className={`text-sm font-bold ${
            isFullyPaid ? 'text-emerald-700' : remaining > 0 ? 'text-red-700' : 'text-amber-700'
          }`}>
            {isFullyPaid
              ? `₱${balanceDue.toLocaleString()}`
              : `₱${Math.abs(remaining).toLocaleString()}`}
          </span>
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
            disabled={isLoading || !isFullyPaid}
            title={!isFullyPaid ? 'Full payment required to check out' : ''}
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
