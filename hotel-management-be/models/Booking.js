const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    trim: true
  },
  guest: {
    firstName: {
      type: String,
      required: [true, 'Please add guest first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Please add guest last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters']
    },
    phone: {
      type: String,
      required: [true, 'Please add guest phone number'],
      trim: true
    },
    idType: {
      type: String,
      required: [true, 'Please add guest ID type'],
      enum: ['Passport', 'Driver License', 'National ID', 'Other']
    },
    idNumber: {
      type: String,
      required: [true, 'Please add guest ID number'],
      trim: true
    }
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: [true, 'Please add room']
  },
  checkInDate: {
    type: Date,
    required: [true, 'Please add check-in date']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Please add check-out date']
  },
  actualCheckIn: {
    type: Date
  },
  actualCheckOut: {
    type: Date
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration'],
    enum: [3, 8, 12, 24]
  },
  guestCount: {
    type: Number,
    required: [true, 'Please add number of guests'],
    min: 1
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add total amount']
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online Payment']
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'No Show'],
    default: 'Confirmed'
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot be more than 500 characters']
  },
  additionalServices: [{
    service: String,
    amount: Number,
    description: String
  }],
  discounts: [{
    type: String,
    amount: Number,
    description: String
  }],
  foodOrders: [{
    foodItem: { type: mongoose.Schema.ObjectId, ref: 'FoodItem' },
    name: { type: String, required: true },
    category: { type: String },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    total: { type: Number, required: true },
    notes: { type: String },
    orderedAt: { type: Date, default: Date.now }
  }],
  extensionCharges: [{
    hours: { type: Number, required: true },
    charge: { type: Number, required: true },
    newCheckOutDate: { type: Date },
    extendedAt: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  cancellationReason: {
    type: String
  },
  cancellationDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add user who created booking']
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

// Calculate balance and generate booking number before saving
BookingSchema.pre('save', async function(next) {
  // Generate booking number if not provided
  if (!this.bookingNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `BK-${year}${month}${day}-${random}`;
  }
  
  // Calculate balance
  const foodTotal = (this.foodOrders || []).reduce((s, o) => s + (o.total || 0), 0);
  const extTotal = (this.extensionCharges || []).reduce((s, c) => s + (c.charge || 0), 0);
  const grandTotal = this.totalAmount + foodTotal + extTotal;
  this.balance = grandTotal - this.paidAmount;
  this.updatedAt = Date.now();

  // Update payment status based on amounts
  if (this.paidAmount === 0) {
    this.paymentStatus = 'Pending';
  } else if (this.paidAmount < grandTotal) {
    this.paymentStatus = 'Partial';
  } else if (this.paidAmount >= grandTotal) {
    this.paymentStatus = 'Paid';
  }

  next();
});

BookingSchema.index({ bookingStatus: 1 });
BookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ room: 1, bookingStatus: 1 });
BookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
