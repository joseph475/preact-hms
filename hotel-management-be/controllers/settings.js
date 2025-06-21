const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const RoomType = require('../models/RoomType');
const Amenity = require('../models/Amenity');

// @desc    Get all room types
// @route   GET /api/v1/settings/room-types
// @access  Private/Admin
exports.getRoomTypes = asyncHandler(async (req, res, next) => {
  const roomTypes = await RoomType.find({ isActive: true })
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: roomTypes.length,
    data: roomTypes
  });
});

// @desc    Create room type
// @route   POST /api/v1/settings/room-types
// @access  Private/Admin
exports.createRoomType = asyncHandler(async (req, res, next) => {
  const roomType = await RoomType.create(req.body);

  res.status(201).json({
    success: true,
    data: roomType
  });
});

// @desc    Update room type
// @route   PUT /api/v1/settings/room-types/:id
// @access  Private/Admin
exports.updateRoomType = asyncHandler(async (req, res, next) => {
  let roomType = await RoomType.findById(req.params.id);

  if (!roomType) {
    return next(new ErrorResponse(`Room type not found with id of ${req.params.id}`, 404));
  }

  roomType = await RoomType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: roomType
  });
});

// @desc    Delete room type
// @route   DELETE /api/v1/settings/room-types/:id
// @access  Private/Admin
exports.deleteRoomType = asyncHandler(async (req, res, next) => {
  const roomType = await RoomType.findById(req.params.id);

  if (!roomType) {
    return next(new ErrorResponse(`Room type not found with id of ${req.params.id}`, 404));
  }

  // Soft delete by setting isActive to false
  await RoomType.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all amenities
// @route   GET /api/v1/settings/amenities
// @access  Private/Admin
exports.getAmenities = asyncHandler(async (req, res, next) => {
  const amenities = await Amenity.find({ isActive: true }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: amenities.length,
    data: amenities
  });
});

// @desc    Create amenity
// @route   POST /api/v1/settings/amenities
// @access  Private/Admin
exports.createAmenity = asyncHandler(async (req, res, next) => {
  const amenity = await Amenity.create(req.body);

  res.status(201).json({
    success: true,
    data: amenity
  });
});

// @desc    Update amenity
// @route   PUT /api/v1/settings/amenities/:id
// @access  Private/Admin
exports.updateAmenity = asyncHandler(async (req, res, next) => {
  let amenity = await Amenity.findById(req.params.id);

  if (!amenity) {
    return next(new ErrorResponse(`Amenity not found with id of ${req.params.id}`, 404));
  }

  amenity = await Amenity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: amenity
  });
});

// @desc    Delete amenity
// @route   DELETE /api/v1/settings/amenities/:id
// @access  Private/Admin
exports.deleteAmenity = asyncHandler(async (req, res, next) => {
  const amenity = await Amenity.findById(req.params.id);

  if (!amenity) {
    return next(new ErrorResponse(`Amenity not found with id of ${req.params.id}`, 404));
  }

  // Soft delete by setting isActive to false
  await Amenity.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json({
    success: true,
    data: {}
  });
});
