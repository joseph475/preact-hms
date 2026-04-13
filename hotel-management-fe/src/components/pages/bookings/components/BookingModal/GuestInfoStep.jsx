import { h } from 'preact';

const GuestInfoStep = ({ formData, handleInputChange, suggestions = [], searching, onSelectSuggestion, clearSuggestions, onFirstNameFocus }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
        <p className="text-sm text-gray-600">Please provide the guest's personal details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name with auto-suggest */}
        <div className="form-group relative">
          <label className="form-label">First Name *</label>
          <div className="relative">
            <input
              type="text"
              className="form-input"
              value={formData.guest.firstName}
              onChange={(e) => handleInputChange('guest.firstName', e.target.value)}
              onFocus={onFirstNameFocus}
              required
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="spinner w-4 h-4"></div>
              </div>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-amber-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                <span className="text-xs text-amber-700 font-medium">Returning guests</span>
                <button
                  type="button"
                  onMouseDown={() => clearSuggestions()}
                  className="text-amber-400 hover:text-amber-700 transition-colors focus:outline-none"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {suggestions.slice(0, 6).map((g) => (
                <button
                  key={g._id}
                  type="button"
                  onMouseDown={() => onSelectSuggestion(g)}
                  className="w-full text-left px-3 py-2 hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-900">{g.firstName} {g.lastName}</span>
                  <span className="text-xs text-gray-500 ml-2">{g.phone}</span>
                  {g.isVip && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300 rounded">VIP</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <input
            type="text"
            className="form-input"
            value={formData.guest.lastName}
            onChange={(e) => handleInputChange('guest.lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number *</label>
        <input
          type="tel"
          className="form-input"
          value={formData.guest.phone}
          onChange={(e) => handleInputChange('guest.phone', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">ID Type</label>
          <select
            className="form-select"
            value={formData.guest.idType}
            onChange={(e) => handleInputChange('guest.idType', e.target.value)}
          >
            <option value="National ID">National ID</option>
            <option value="Passport">Passport</option>
            <option value="Driver License">Driver License</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">ID Number *</label>
          <input
            type="text"
            className="form-input"
            value={formData.guest.idNumber}
            onChange={(e) => handleInputChange('guest.idNumber', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Company <span className="text-xs font-normal text-stone-400">(optional)</span></label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Acme Corp"
          value={formData.guest.company}
          onChange={(e) => handleInputChange('guest.company', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Address <span className="text-xs font-normal text-stone-400">(optional)</span></label>
        <textarea
          className="form-input"
          rows={2}
          placeholder="e.g. 123 Main St, City"
          value={formData.guest.address}
          onChange={(e) => handleInputChange('guest.address', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Nationality</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Filipino, American"
            value={formData.guest.nationality}
            onChange={(e) => handleInputChange('guest.nationality', e.target.value)}
          />
        </div>
        <div className="form-group flex items-center pt-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              checked={formData.guest.isVip}
              onChange={(e) => handleInputChange('guest.isVip', e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">VIP Guest</span>
            <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300 rounded">VIP</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GuestInfoStep;
