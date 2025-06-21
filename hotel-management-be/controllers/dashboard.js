const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get current date ranges
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // Total rooms
  const totalRooms = await Room.countDocuments({ isActive: true });
  
  // Available rooms
  const availableRooms = await Room.countDocuments({ 
    status: 'Available', 
    isActive: true 
  });
  
  // Occupied rooms
  const occupiedRooms = await Room.countDocuments({ 
    status: 'Occupied', 
    isActive: true 
  });

  // Total guests
  const totalGuests = await Guest.countDocuments();

  // Today's bookings
  const todaysBookings = await Booking.countDocuments({
    checkInDate: {
      $gte: startOfToday,
      $lt: endOfToday
    }
  });

  // Today's check-ins
  const todaysCheckIns = await Booking.countDocuments({
    actualCheckIn: {
      $gte: startOfToday,
      $lt: endOfToday
    }
  });

  // Today's check-outs
  const todaysCheckOuts = await Booking.countDocuments({
    actualCheckOut: {
      $gte: startOfToday,
      $lt: endOfToday
    }
  });

  // Monthly revenue
  const monthlyRevenue = await Booking.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth
        },
        paymentStatus: { $in: ['Paid', 'Partial'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$paidAmount' }
      }
    }
  ]);

  // Recent bookings
  const recentBookings = await Booking.find()
    .sort('-createdAt')
    .limit(5)
    .populate('guest', 'firstName lastName')
    .populate('room', 'roomNumber roomType');

  // Room occupancy by type
  const roomOccupancy = await Room.aggregate([
    {
      $group: {
        _id: '$roomType',
        total: { $sum: 1 },
        occupied: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0]
          }
        },
        available: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Available'] }, 1, 0]
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
      },
      guests: {
        total: totalGuests
      },
      bookings: {
        today: todaysBookings,
        checkInsToday: todaysCheckIns,
        checkOutsToday: todaysCheckOuts
      },
      revenue: {
        monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
      },
      recentBookings,
      roomOccupancy
    }
  });
});

// @desc    Get revenue analytics
// @route   GET /api/v1/dashboard/revenue
// @access  Private
exports.getRevenueAnalytics = asyncHandler(async (req, res, next) => {
  const { period = 'month' } = req.query;
  
  let startDate, endDate, groupBy;
  const now = new Date();

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    default: // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const revenueData = await Booking.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate
        },
        paymentStatus: { $in: ['Paid', 'Partial'] }
      }
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$paidAmount' },
        bookings: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: revenueData
  });
});
