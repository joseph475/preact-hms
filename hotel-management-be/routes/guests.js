const express = require('express');
const {
  getGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  searchGuests,
  getGuestBookings
} = require('../controllers/guests');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes are protected

// Guest management - accessible by both admin and user
router.get('/search', authorize('admin', 'user'), searchGuests);

router
  .route('/')
  .get(authorize('admin', 'user'), getGuests)
  .post(authorize('admin', 'user'), createGuest);

router.get('/:id/bookings', authorize('admin', 'user'), getGuestBookings);

router
  .route('/:id')
  .get(authorize('admin', 'user'), getGuest)
  .put(authorize('admin', 'user'), updateGuest)
  .delete(authorize('admin', 'user'), deleteGuest);

module.exports = router;
