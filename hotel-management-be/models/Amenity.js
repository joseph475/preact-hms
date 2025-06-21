const mongoose = require('mongoose');

const AmenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an amenity name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Amenity name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  icon: {
    type: String,
    maxlength: [100, 'Icon cannot be more than 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update the updatedAt field before saving
AmenitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Amenity', AmenitySchema);
