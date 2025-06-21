const mongoose = require('mongoose');

// Clear any existing model to force schema refresh
if (mongoose.models.Room) {
  delete mongoose.models.Room;
}

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please add a room number'],
    unique: true,
    trim: true
  },
  roomType: {
    type: mongoose.Schema.ObjectId,
    ref: 'RoomType',
    required: [true, 'Please add a room type']
  },
  floor: {
    type: Number,
    required: [true, 'Please add floor number']
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance', 'Out of Order'],
    default: 'Available'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  telephone: {
    type: String,
    trim: true,
    maxlength: [20, 'Telephone number cannot be more than 20 characters']
  },
  images: [{
    type: String // URLs to room images
  }],
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
RoomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Room', RoomSchema);
