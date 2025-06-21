const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  checkIn,
  checkOut,
  cancelBooking,
  markNoShow
} = require('../controllers/bookings');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes are protected

// Bookings - both admin and user can view and create
router
  .route('/')
  .get(authorize('admin', 'user'), getBookings) // Both admin and user can view bookings
  .post(createBooking); // Both admin and user can create bookings

router
  .route('/:id')
  .get(getBooking) // Both can view specific booking (controller should filter by user)
  .put(authorize('admin', 'user'), updateBooking) // Both admin and user can update
  .delete(authorize('admin', 'user'), deleteBooking); // Both admin and user can delete

// Booking operations - both admin and user can manage
router.put('/:id/checkin', authorize('admin', 'user'), checkIn);
router.put('/:id/checkout', authorize('admin', 'user'), checkOut);
router.put('/:id/cancel', authorize('admin', 'user'), cancelBooking);
router.put('/:id/noshow', authorize('admin', 'user'), markNoShow);

module.exports = router;
