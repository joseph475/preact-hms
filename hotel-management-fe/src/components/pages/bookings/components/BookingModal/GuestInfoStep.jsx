import { h } from 'preact';

const GuestInfoStep = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
        <p className="text-sm text-gray-600">Please provide the guest's personal details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input
            type="text"
            className="form-input"
            value={formData.guest.firstName}
            onChange={(e) => handleInputChange('guest.firstName', e.target.value)}
            required
          />
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
