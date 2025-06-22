const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Private
exports.getRooms = asyncHandler(async (req, res, next) => {
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
  query = Room.find(JSON.parse(queryStr));

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
  const total = await Room.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query with population
  const rooms = await query.populate({
    path: 'roomType',
    select: 'name baseCapacity pricing penalty'
  });

  // Get current bookings for occupied rooms
  const Booking = require('../models/Booking');
  const currentBookings = await Booking.find({
    bookingStatus: 'Checked In',
    room: { $in: rooms.map(room => room._id) }
  }).populate({
    path: 'room',
    select: 'roomNumber'
  }).select('room checkInDate duration guest bookingStatus');

  // Create a map of room ID to current booking
  const bookingMap = {};
  currentBookings.forEach(booking => {
    if (booking.room && booking.room._id) {
      bookingMap[booking.room._id.toString()] = {
        checkInDate: booking.checkInDate,
        duration: booking.duration,
        guest: booking.guest,
        bookingStatus: booking.bookingStatus
      };
    }
  });

  // Add current booking info to rooms
  const roomsWithBookings = rooms.map(room => {
    const roomObj = room.toObject();
    const currentBooking = bookingMap[room._id.toString()];
    if (currentBooking) {
      roomObj.currentBooking = currentBooking;
    }
    return roomObj;
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
    count: roomsWithBookings.length,
    pagination,
    data: roomsWithBookings
  });
});

// @desc    Get single room
// @route   GET /api/v1/rooms/:id
// @access  Private
exports.getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate({
    path: 'roomType',
    select: 'name baseCapacity pricing penalty'
  });

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: room
  });
});

// @desc    Create new room
// @route   POST /api/v1/rooms
// @access  Private
exports.createRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.create(req.body);
  await room.populate({
    path: 'roomType',
    select: 'name baseCapacity pricing penalty'
  });

  res.status(201).json({
    success: true,
    data: room
  });
});

// @desc    Update room
// @route   PUT /api/v1/rooms/:id
// @access  Private
exports.updateRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate({
    path: 'roomType',
    select: 'name baseCapacity pricing penalty'
  });

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: room
  });
});

// @desc    Delete room
// @route   DELETE /api/v1/rooms/:id
// @access  Private
exports.deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  await room.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update room status (limited access for users)
// @route   PUT /api/v1/rooms/:id/status
// @access  Private (users can only change from maintenance to available)
exports.updateRoomStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  // Get the current room
  const room = await Room.findById(req.params.id);
  
  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  // If user is not admin, restrict status changes
  if (req.user.role !== 'admin') {
    // Users can only change from 'Maintenance' to 'Available'
    if (room.status !== 'Maintenance' || status !== 'Available') {
      return next(
        new ErrorResponse('Users can only change room status from Maintenance to Available', 403)
      );
    }
  }

  // Update the room status
  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id, 
    { status }, 
    {
      new: true,
      runValidators: true
    }
  ).populate({
    path: 'roomType',
    select: 'name baseCapacity pricing penalty'
  });

  res.status(200).json({
    success: true,
    data: updatedRoom
  });
});

// @desc    Get available rooms
// @route   GET /api/v1/rooms/available
// @access  Private
exports.getAvailableRooms = asyncHandler(async (req, res, next) => {
  const { checkIn, checkOut, duration } = req.query;

  let query = { status: 'Available', isActive: true };

  // If dates are provided, check for conflicts with existing bookings
  if (checkIn && checkOut) {
    const Booking = require('../models/Booking');
    
    const conflictingBookings = await Booking.find({
      $and: [
        {
          $or: [
            {
              checkInDate: { $lte: new Date(checkOut) },
              checkOutDate: { $gte: new Date(checkIn) }
            }
          ]
        },
        {
          bookingStatus: { $in: ['Confirmed', 'Checked In'] }
        }
      ]
    }).select('room');

    const occupiedRoomIds = conflictingBookings.map(booking => booking.room);
    query._id = { $nin: occupiedRoomIds };
  }

  const rooms = await Room.find(query).sort('roomNumber');

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms
  });
});
