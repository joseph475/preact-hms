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
    </div>
  );
};

export default GuestInfoStep;
