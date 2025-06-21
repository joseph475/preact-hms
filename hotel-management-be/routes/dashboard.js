const express = require('express');
const {
  getDashboardStats,
  getRevenueAnalytics
} = require('../controllers/dashboard');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes are protected

// Dashboard - accessible by both admin and user
router.get('/stats', authorize('admin', 'user'), getDashboardStats);
router.get('/revenue', authorize('admin', 'user'), getRevenueAnalytics);

module.exports = router;
