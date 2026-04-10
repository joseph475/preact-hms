import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Modal from './Modal';
import apiService from '../../services/api';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];

const FoodOrderModal = ({ isOpen, onClose, booking, onAddFoodOrder, onRemoveFoodOrder }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMenuItems();
    }
  }, [isOpen]);

  const fetchMenuItems = async () => {
    setMenuLoading(true);
    try {
      const response = await apiService.getFoodItems({ isAvailable: true });
      if (response.success) {
        setMenuItems(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch food items:', err);
    } finally {
      setMenuLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const getQuantity = (itemId) => quantities[itemId] || 1;

  const setQuantity = (itemId, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [itemId]: qty }));
  };

  const handleAdd = async (item) => {
    if (!booking?._id) return;
    setActionLoading(true);
    try {
      await onAddFoodOrder(booking._id, {
        foodItemId: item._id,
        name: item.name,
        category: item.category,
        unitPrice: item.price,
        quantity: getQuantity(item._id)
      });
      // Reset quantity for this item back to 1
      setQuantities(prev => ({ ...prev, [item._id]: 1 }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (orderId) => {
    if (!booking?._id) return;
    setActionLoading(true);
    try {
      await onRemoveFoodOrder(booking._id, orderId);
    } finally {
      setActionLoading(false);
    }
  };

  const foodOrders = booking?.foodOrders || [];
  const roomCharge = booking?.totalAmount || 0;
  const foodTotal = foodOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const extensionTotal = (booking?.extensionCharges || []).reduce((sum, e) => sum + (e.charge || 0), 0);
  const grandTotal = roomCharge + foodTotal + extensionTotal;

  const modalTitle = `Food Orders — Room ${booking?.room?.roomNumber || ''}`;

  const footer = (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
      >
        Close
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="large"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Menu Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Add Items</h4>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 mb-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors duration-150 ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {menuLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="spinner"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No items available in this category.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
              {filteredItems.map(item => (
                <div key={item._id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-500">₱{(item.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-auto">
                    <button
                      type="button"
                      onClick={() => setQuantity(item._id, getQuantity(item._id) - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-gray-800">
                      {getQuantity(item._id)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item._id, getQuantity(item._id) + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 text-sm font-bold"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      disabled={actionLoading}
                      className="ml-1 flex-1 px-2 py-1 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50 transition-colors duration-150"
                    >
                      {actionLoading ? '...' : 'Add'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing Orders Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Current Food Orders {foodOrders.length > 0 && `(${foodOrders.length})`}
          </h4>
          {foodOrders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No food orders yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {foodOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {order.quantity} × {order.name}
                    </p>
                    <p className="text-xs text-gray-500">₱{(order.total || 0).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(order._id)}
                    disabled={actionLoading}
                    className="ml-3 flex-shrink-0 p-1 text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors duration-150"
                    title="Remove order"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading spinner while adding/removing */}
        {actionLoading && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <div className="spinner w-4 h-4"></div>
            <span>Updating order...</span>
          </div>
        )}

        {/* Totals Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Totals</h4>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Room Charge</span>
            <span>₱{roomCharge.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Food Total</span>
            <span>₱{foodTotal.toLocaleString()}</span>
          </div>
          {extensionTotal > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Extension Total</span>
              <span>₱{extensionTotal.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-2 flex justify-between text-base font-bold text-gray-900">
            <span>Grand Total</span>
            <span>₱{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FoodOrderModal;
