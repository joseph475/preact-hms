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
  this.balance = this.totalAmount - this.paidAmount;
  this.updatedAt = Date.now();
  
  // Update payment status based on amounts
  if (this.paidAmount === 0) {
    this.paymentStatus = 'Pending';
  } else if (this.paidAmount < this.totalAmount) {
    this.paymentStatus = 'Partial';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'Paid';
  }
  
  next();
});

// Populate room and user data
BookingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'room',
    select: 'roomNumber roomType status',
    populate: {
      path: 'roomType',
      select: 'name pricing'
    }
  }).populate({
    path: 'createdBy',
    select: 'name email'
  });
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
