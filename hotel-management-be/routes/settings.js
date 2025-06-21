const express = require('express');
const {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity
} = require('../controllers/settings');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All settings routes require authentication
router.use(protect);

// Room Types routes
router
  .route('/room-types')
  .get(getRoomTypes) // All authenticated users can read room types
  .post(authorize('admin'), createRoomType); // Only admins can create

router
  .route('/room-types/:id')
  .put(authorize('admin'), updateRoomType) // Only admins can update
  .delete(authorize('admin'), deleteRoomType); // Only admins can delete

// Amenities routes
router
  .route('/amenities')
  .get(authorize('admin'), getAmenities) // Only admins can read amenities
  .post(authorize('admin'), createAmenity); // Only admins can create

router
  .route('/amenities/:id')
  .put(authorize('admin'), updateAmenity) // Only admins can update
  .delete(authorize('admin'), deleteAmenity); // Only admins can delete

module.exports = router;
