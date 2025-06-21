const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// @desc    Get booking reports
// @route   GET /api/v1/reports/bookings
// @access  Private
exports.getBookingReports = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, status, roomType } = req.query;

  let matchQuery = {};

  // Date range filter
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Status filter
  if (status) {
    matchQuery.bookingStatus = status;
  }

  let bookings = await Booking.find(matchQuery)
    .populate('guest', 'firstName lastName email phone')
    .populate('room', 'roomNumber roomType pricePerHour')
    .populate('createdBy', 'name')
    .sort('-createdAt');

  // Room type filter (after population)
  if (roomType) {
    bookings = bookings.filter(booking => booking.room.roomType === roomType);
  }

  // Calculate summary statistics
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.paidAmount, 0);
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const statusBreakdown = bookings.reduce((acc, booking) => {
    acc[booking.bookingStatus] = (acc[booking.bookingStatus] || 0) + 1;
    return acc;
  }, {});

  const durationBreakdown = bookings.reduce((acc, booking) => {
    acc[booking.duration] = (acc[booking.duration] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      bookings,
      summary: {
        totalBookings,
        totalRevenue,
        averageBookingValue,
        statusBreakdown,
        durationBreakdown
      }
    }
  });
});

// @desc    Get revenue reports
// @route   GET /api/v1/reports/revenue
// @access  Private
exports.getRevenueReports = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  let matchQuery = {};

  // Date range filter
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Only include paid bookings
  matchQuery.paymentStatus = { $in: ['Paid', 'Partial'] };

  let groupByQuery;
  switch (groupBy) {
    case 'month':
      groupByQuery = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    case 'week':
      groupByQuery = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      break;
    default: // day
      groupByQuery = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const revenueData = await Booking.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: groupByQuery,
        totalRevenue: { $sum: '$paidAmount' },
        totalBookings: { $sum: 1 },
        averageBookingValue: { $avg: '$paidAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Revenue by room type
  const revenueByRoomType = await Booking.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'rooms',
        localField: 'room',
        foreignField: '_id',
        as: 'roomData'
      }
    },
    { $unwind: '$roomData' },
    {
      $group: {
        _id: '$roomData.roomType',
        totalRevenue: { $sum: '$paidAmount' },
        totalBookings: { $sum: 1 }
      }
    }
  ]);

  // Revenue by duration
  const revenueByDuration = await Booking.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$duration',
        totalRevenue: { $sum: '$paidAmount' },
        totalBookings: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      revenueOverTime: revenueData,
      revenueByRoomType,
      revenueByDuration
    }
  });
});

// @desc    Get room occupancy reports
// @route   GET /api/v1/reports/occupancy
// @access  Private
exports.getOccupancyReports = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  let matchQuery = {};

  // Date range filter
  if (startDate && endDate) {
    matchQuery.checkInDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Only include confirmed and checked-in bookings
  matchQuery.bookingStatus = { $in: ['Confirmed', 'Checked In', 'Checked Out'] };

  // Overall occupancy statistics
  const totalRooms = await Room.countDocuments({ isActive: true });
  const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
  const availableRooms = await Room.countDocuments({ status: 'Available' });

  // Occupancy by room type
  const occupancyByType = await Room.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$roomType',
        totalRooms: { $sum: 1 },
        occupiedRooms: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0]
          }
        },
        availableRooms: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Available'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        occupancyRate: {
          $multiply: [
            { $divide: ['$occupiedRooms', '$totalRooms'] },
            100
          ]
        }
      }
    }
  ]);

  // Booking duration analysis
  const durationAnalysis = await Booking.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$duration',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$paidAmount' }
      }
    }
  ]);

  // Peak hours analysis (based on check-in times)
  const peakHours = await Booking.aggregate([
    {
      $match: {
        ...matchQuery,
        actualCheckIn: { $exists: true }
      }
    },
    {
      $group: {
        _id: { $hour: '$actualCheckIn' },
        checkIns: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overall: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
      },
      occupancyByType,
      durationAnalysis,
      peakHours
    }
  });
});

// @desc    Get guest reports
// @route   GET /api/v1/reports/guests
// @access  Private
exports.getGuestReports = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  let matchQuery = {};

  // Date range filter
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Total guests
  const totalGuests = await Guest.countDocuments();
  const newGuests = await Guest.countDocuments(matchQuery);

  // Guest nationality breakdown
  const nationalityBreakdown = await Guest.aggregate([
    {
      $group: {
        _id: '$nationality',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // VIP guests
  const vipGuests = await Guest.countDocuments({ isVip: true });

  // Repeat guests (guests with multiple bookings)
  const repeatGuests = await Booking.aggregate([
    {
      $group: {
        _id: '$guest',
        bookingCount: { $sum: 1 }
      }
    },
    {
      $match: {
        bookingCount: { $gt: 1 }
      }
    },
    {
      $lookup: {
        from: 'guests',
        localField: '_id',
        foreignField: '_id',
        as: 'guestData'
      }
    },
    { $unwind: '$guestData' },
    {
      $project: {
        guest: '$guestData',
        bookingCount: 1
      }
    },
    { $sort: { bookingCount: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalGuests,
      newGuests,
      vipGuests,
      nationalityBreakdown,
      repeatGuests
    }
  });
});
