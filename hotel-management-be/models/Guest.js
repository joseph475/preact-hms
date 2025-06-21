const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
    trim: true
  },
  idType: {
    type: String,
    required: [true, 'Please add ID type'],
    enum: ['Passport', 'Driver License', 'National ID', 'Other']
  },
  idNumber: {
    type: String,
    required: [true, 'Please add ID number'],
    trim: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create full name virtual
GuestSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Update the updatedAt field before saving
GuestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Guest', GuestSchema);
