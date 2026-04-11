import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Modal from '../../common/Modal';
import apiService from '../../../services/api';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];

const EMPTY_FORM = {
  name: '',
  category: 'Breakfast',
  price: '',
  description: '',
  isAvailable: true,
};

const FoodMenuPage = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getFoodItems();
      if (response.success) {
        setItems(response.data);
      } else {
        setError('Failed to load menu items');
      }
    } catch (err) {
      setError('Failed to load menu items');
      console.error('FoodMenu error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category === activeCategory);

  const openAddModal = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || '',
      isAvailable: item.isAvailable,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!form.category) {
      setFormError('Category is required.');
      return;
    }
    if (form.price === '' || Number(form.price) < 0) {
      setFormError('Please enter a valid price.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      description: form.description.trim(),
      isAvailable: form.isAvailable,
    };

    try {
      setSaving(true);
      let response;
      if (editingItem) {
        response = await apiService.updateFoodItem(editingItem._id, payload);
      } else {
        response = await apiService.createFoodItem(payload);
      }
      if (response.success) {
        await loadItems();
        closeModal();
      } else {
        setFormError(response.message || 'Failed to save item.');
      }
    } catch (err) {
      setFormError('Failed to save item. Please try again.');
      console.error('Save food item error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const response = await apiService.updateFoodItem(item._id, {
        isAvailable: !item.isAvailable,
      });
      if (response.success) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === item._id ? { ...i, isAvailable: !item.isAvailable } : i
          )
        );
      } else {
        setError('Failed to update item availability');
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
    }
  };

  const getCategoryBadgeClass = (category) => {
    const map = {
      Breakfast: 'bg-yellow-100 text-yellow-800',
      Lunch: 'bg-blue-100 text-blue-800',
      Dinner: 'bg-purple-100 text-purple-800',
      Snacks: 'bg-orange-100 text-orange-800',
      Drinks: 'bg-teal-100 text-teal-800',
    };
    return map[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="page-container">
        {/* Header */}
        <div className="page-header flex items-start justify-between">
          <div>
            <h1 className="page-title">Food Menu</h1>
            <p className="page-subtitle">Manage your restaurant menu items</p>
          </div>
          <button type="button" onClick={openAddModal} className="btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Item
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                  ${activeCategory === cat
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
              >
                {cat}
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold
                  ${activeCategory === cat ? 'bg-white text-amber-700' : 'bg-amber-200 text-amber-800'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Items grid */}
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="empty-state-title">
              {activeCategory === 'All' ? 'No menu items yet' : `No ${activeCategory} items`}
            </h3>
            <p className="empty-state-description">
              {activeCategory === 'All'
                ? 'No menu items yet. Add your first item.'
                : `No items in the ${activeCategory} category. Add your first item.`}
            </p>
            {activeCategory === 'All' && (
              <div className="mt-6">
                <button type="button" onClick={openAddModal} className="btn-primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add First Item
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <div key={item._id} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col${!item.isAvailable ? ' opacity-60' : ''}`}>
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug flex-1 mr-2">
                      {item.name}
                    </h3>
                    <span className={`badge text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  <div className="text-lg font-bold text-primary-600 mb-2">
                    ₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                  )}
                </div>

                <div className="px-5 pb-4 flex flex-col gap-2">
                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                    <span className={`text-xs font-medium ${item.isAvailable ? 'text-green-700' : 'text-gray-400'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                        ${item.isAvailable ? 'bg-amber-600' : 'bg-gray-300'}`}
                      title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
                        ${item.isAvailable ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Edit button */}
                  <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
        size="default"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-outline">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="alert-error text-sm">{formError}</div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onInput={handleFormChange}
              required
              className="input-field w-full"
              placeholder="e.g. Pancakes"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleFormChange}
              required
              className="input-field w-full"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₱) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onInput={handleFormChange}
              required
              min="0"
              step="0.01"
              className="input-field w-full"
              placeholder="0.00"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onInput={handleFormChange}
              rows={3}
              className="input-field w-full resize-none"
              placeholder="Brief description of the item..."
            />
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleFormChange}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
              Available for ordering
            </label>
          </div>
        </form>
      </Modal>
    </Fragment>
  );
};

export default FoodMenuPage;
