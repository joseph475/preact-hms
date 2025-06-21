const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Booking.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Booking.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query with population
  const bookings = await query.populate({
    path: 'room',
    populate: {
      path: 'roomType'
    }
  });

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: bookings.length,
    pagination,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Check if room is available
  const room = await Room.findById(req.body.room).populate('roomType');
  
  if (!room) {
    return next(new ErrorResponse('Room not found', 404));
  }

  if (room.status !== 'Available') {
    return next(new ErrorResponse('Room is not available', 400));
  }

  // Calculate check-out date based on check-in date and duration
  const checkInDate = new Date(req.body.checkInDate);
  const durationHours = parseInt(req.body.duration);
  const checkOutDate = new Date(checkInDate.getTime() + (durationHours * 60 * 60 * 1000));
  req.body.checkOutDate = checkOutDate;

  // Use the total amount from frontend (already calculated correctly)
  // Frontend calculates based on roomType.pricing structure
  if (!req.body.totalAmount || req.body.totalAmount <= 0) {
    return next(new ErrorResponse('Invalid total amount', 400));
  }

  // Check for conflicting bookings
  const conflictingBooking = await Booking.findOne({
    room: req.body.room,
    $and: [
      {
        $or: [
          {
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate }
          }
        ]
      },
      {
        bookingStatus: { $in: ['Confirmed', 'Checked In'] }
      }
    ]
  });

  if (conflictingBooking) {
    return next(new ErrorResponse('Room is already booked for the selected dates', 400));
  }

  const booking = await Booking.create(req.body);

  // Update room status to Occupied if booking is confirmed
  if (booking.bookingStatus === 'Confirmed') {
    await Room.findByIdAndUpdate(req.body.room, { status: 'Occupied' });
  }

  // Create or update guest record from booking data
  const Guest = require('../models/Guest');
  const guestData = {
    firstName: req.body.guest.firstName,
    lastName: req.body.guest.lastName,
    phone: req.body.guest.phone,
    idType: req.body.guest.idType,
    idNumber: req.body.guest.idNumber
  };

  // Check if guest already exists by name and ID number
  const existingGuest = await Guest.findOne({
    firstName: guestData.firstName,
    lastName: guestData.lastName,
    idNumber: guestData.idNumber
  });

  if (!existingGuest) {
    await Guest.create(guestData);
  }

  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Store the original booking status
  const originalStatus = booking.bookingStatus;

  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Handle room status updates based on booking status changes
  if (req.body.bookingStatus && req.body.bookingStatus !== originalStatus) {
    if (req.body.bookingStatus === 'Cancelled' || req.body.bookingStatus === 'No Show') {
      // Make room available when booking is cancelled or marked as no show
      await Room.findByIdAndUpdate(booking.room, { status: 'Available' });
      
      // Set cancellation date if not already set
      if (req.body.bookingStatus === 'Cancelled' && !booking.cancellationDate) {
        booking.cancellationDate = new Date();
        await booking.save();
      }
      
      // If marked as No Show, save guest details to guest list with no-show note
      if (req.body.bookingStatus === 'No Show') {
        const Guest = require('../models/Guest');
        const guestData = {
          firstName: booking.guest.firstName,
          lastName: booking.guest.lastName,
          phone: booking.guest.phone,
          idType: booking.guest.idType,
          idNumber: booking.guest.idNumber,
          notes: `No-show for booking ${booking.bookingNumber} on ${new Date(booking.checkInDate).toLocaleDateString()}.`
        };

        // Check if guest already exists by name and ID number
        const existingGuest = await Guest.findOne({
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          idNumber: guestData.idNumber
        });

        if (existingGuest) {
          // Update existing guest with no-show note
          const currentNotes = existingGuest.notes || '';
          const noShowNote = `No-show for booking ${booking.bookingNumber} on ${new Date(booking.checkInDate).toLocaleDateString()}.`;
          existingGuest.notes = currentNotes ? `${currentNotes}\n\n${noShowNote}` : noShowNote;
          await existingGuest.save();
        } else {
          // Create new guest record with no-show note
          await Guest.create(guestData);
        }
      }
    } else if (req.body.bookingStatus === 'Confirmed' && originalStatus !== 'Confirmed') {
      // Mark room as occupied when booking is confirmed
      await Room.findByIdAndUpdate(booking.room, { status: 'Occupied' });
    } else if (req.body.bookingStatus === 'Checked In') {
      // Mark room as occupied and set actual check-in time
      await Room.findByIdAndUpdate(booking.room, { status: 'Occupied' });
      if (!booking.actualCheckIn) {
        booking.actualCheckIn = new Date();
        await booking.save();
      }
    } else if (req.body.bookingStatus === 'Checked Out') {
      // Set room to maintenance and set actual check-out time
      await Room.findByIdAndUpdate(booking.room, { status: 'Maintenance' });
      if (!booking.actualCheckOut) {
        booking.actualCheckOut = new Date();
        await booking.save();
      }
    }
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Delete booking (Soft delete - Cancel booking)
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if booking can be cancelled
  if (booking.bookingStatus === 'Checked Out') {
    return next(new ErrorResponse('Cannot cancel a checked out booking', 400));
  }

  if (booking.bookingStatus === 'Cancelled') {
    return next(new ErrorResponse('Booking is already cancelled', 400));
  }

  // Soft delete by updating status to Cancelled
  booking.bookingStatus = 'Cancelled';
  booking.cancellationDate = new Date();
  booking.cancellationReason = req.body.reason || 'Booking deleted by user';
  await booking.save();

  // Update room status back to Available
  await Room.findByIdAndUpdate(booking.room, { status: 'Available' });

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Check in guest
// @route   PUT /api/v1/bookings/:id/checkin
// @access  Private
exports.checkIn = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  if (booking.bookingStatus !== 'Confirmed') {
    return next(new ErrorResponse('Booking must be confirmed to check in', 400));
  }

  booking.bookingStatus = 'Checked In';
  booking.actualCheckIn = new Date();
  await booking.save();

  // Update room status
  await Room.findByIdAndUpdate(booking.room, { status: 'Occupied' });

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Check out guest
// @route   PUT /api/v1/bookings/:id/checkout
// @access  Private
exports.checkOut = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  if (booking.bookingStatus !== 'Checked In') {
    return next(new ErrorResponse('Guest must be checked in to check out', 400));
  }

  booking.bookingStatus = 'Checked Out';
  booking.actualCheckOut = new Date();
  await booking.save();

  // Update room status to Maintenance after checkout
  await Room.findByIdAndUpdate(booking.room, { status: 'Maintenance' });

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  if (booking.bookingStatus === 'Checked Out' || booking.bookingStatus === 'Cancelled') {
    return next(new ErrorResponse('Cannot cancel this booking', 400));
  }

  booking.bookingStatus = 'Cancelled';
  booking.cancellationDate = new Date();
  booking.cancellationReason = req.body.reason || 'No reason provided';
  await booking.save();

  // Update room status back to Available
  await Room.findByIdAndUpdate(booking.room, { status: 'Available' });

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Mark booking as no show
// @route   PUT /api/v1/bookings/:id/noshow
// @access  Private
exports.markNoShow = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  if (booking.bookingStatus === 'Checked Out' || booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Checked In') {
    return next(new ErrorResponse('Cannot mark this booking as no show', 400));
  }

  booking.bookingStatus = 'No Show';
  booking.notes = req.body.notes || booking.notes;
  await booking.save();

  // Update room status back to Available
  await Room.findByIdAndUpdate(booking.room, { status: 'Available' });

  // Save guest details to guest list with no-show note
  const Guest = require('../models/Guest');
  const guestData = {
    firstName: booking.guest.firstName,
    lastName: booking.guest.lastName,
    phone: booking.guest.phone,
    idType: booking.guest.idType,
    idNumber: booking.guest.idNumber,
    notes: `No-show for booking ${booking.bookingNumber} on ${new Date(booking.checkInDate).toLocaleDateString()}. ${req.body.notes ? 'Additional notes: ' + req.body.notes : ''}`
  };

  // Check if guest already exists by name and ID number
  const existingGuest = await Guest.findOne({
    firstName: guestData.firstName,
    lastName: guestData.lastName,
    idNumber: guestData.idNumber
  });

  if (existingGuest) {
    // Update existing guest with no-show note
    const currentNotes = existingGuest.notes || '';
    const noShowNote = `No-show for booking ${booking.bookingNumber} on ${new Date(booking.checkInDate).toLocaleDateString()}. ${req.body.notes ? 'Additional notes: ' + req.body.notes : ''}`;
    existingGuest.notes = currentNotes ? `${currentNotes}\n\n${noShowNote}` : noShowNote;
    await existingGuest.save();
  } else {
    // Create new guest record with no-show note
    await Guest.create(guestData);
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});
