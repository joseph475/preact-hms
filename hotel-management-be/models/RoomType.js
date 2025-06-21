const mongoose = require('mongoose');

const RoomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a room type name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Room type name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  baseCapacity: {
    type: Number,
    required: [true, 'Please add base capacity'],
    min: 1,
    max: 20
  },
  pricing: {
    hourly3: {
      type: Number,
      required: [true, 'Please add 3-hour price'],
      min: 0
    },
    hourly8: {
      type: Number,
      required: [true, 'Please add 8-hour price'],
      min: 0
    },
    hourly12: {
      type: Number,
      required: [true, 'Please add 12-hour price'],
      min: 0
    },
    daily: {
      type: Number,
      required: [true, 'Please add 24-hour price'],
      min: 0
    }
  },
  penalty: {
    type: Number,
    required: [true, 'Please add penalty amount'],
    default: 0,
    min: 0
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
RoomTypeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RoomType', RoomTypeSchema);
