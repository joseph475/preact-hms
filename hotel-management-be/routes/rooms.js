const express = require('express');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  updateRoomStatus
} = require('../controllers/rooms');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes are protected

// Available rooms - accessible by both admin and user
router.get('/available', getAvailableRooms);

// Room viewing - accessible by both admin and user
router
  .route('/')
  .get(authorize('admin', 'user'), getRooms)
  .post(authorize('admin'), createRoom);

// Room status update - accessible by both admin and user (with restrictions)
router.put('/:id/status', authorize('admin', 'user'), updateRoomStatus);

router
  .route('/:id')
  .get(authorize('admin', 'user'), getRoom)
  .put(authorize('admin'), updateRoom)
  .delete(authorize('admin'), deleteRoom);

module.exports = router;
