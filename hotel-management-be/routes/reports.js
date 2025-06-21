const express = require('express');
const {
  getBookingReports,
  getRevenueReports,
  getOccupancyReports,
  getGuestReports
} = require('../controllers/reports');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes are protected

// Reports - accessible by both admin and user
router.get('/bookings', authorize('admin', 'user'), getBookingReports);
router.get('/revenue', authorize('admin', 'user'), getRevenueReports);
router.get('/occupancy', authorize('admin', 'user'), getOccupancyReports);
router.get('/guests', authorize('admin', 'user'), getGuestReports);

module.exports = router;
