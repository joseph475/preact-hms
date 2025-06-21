const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Guest = require('../models/Guest');

// @desc    Get all guests
// @route   GET /api/v1/guests
// @access  Private
exports.getGuests = asyncHandler(async (req, res, next) => {
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
  query = Guest.find(JSON.parse(queryStr));

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
  const total = await Guest.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const guests = await query;

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
    count: guests.length,
    pagination,
    data: guests
  });
});

// @desc    Get single guest
// @route   GET /api/v1/guests/:id
// @access  Private
exports.getGuest = asyncHandler(async (req, res, next) => {
  const guest = await Guest.findById(req.params.id);

  if (!guest) {
    return next(
      new ErrorResponse(`Guest not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: guest
  });
});

// @desc    Create new guest
// @route   POST /api/v1/guests
// @access  Private
exports.createGuest = asyncHandler(async (req, res, next) => {
  const guest = await Guest.create(req.body);

  res.status(201).json({
    success: true,
    data: guest
  });
});

// @desc    Update guest
// @route   PUT /api/v1/guests/:id
// @access  Private
exports.updateGuest = asyncHandler(async (req, res, next) => {
  const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!guest) {
    return next(
      new ErrorResponse(`Guest not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: guest
  });
});

// @desc    Delete guest
// @route   DELETE /api/v1/guests/:id
// @access  Private
exports.deleteGuest = asyncHandler(async (req, res, next) => {
  const guest = await Guest.findById(req.params.id);

  if (!guest) {
    return next(
      new ErrorResponse(`Guest not found with id of ${req.params.id}`, 404)
    );
  }

  await guest.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search guests
// @route   GET /api/v1/guests/search
// @access  Private
exports.searchGuests = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new ErrorResponse('Please provide search query', 400));
  }

  const guests = await Guest.find({
    $or: [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { idNumber: { $regex: q, $options: 'i' } }
    ]
  }).limit(20);

  res.status(200).json({
    success: true,
    count: guests.length,
    data: guests
  });
});
