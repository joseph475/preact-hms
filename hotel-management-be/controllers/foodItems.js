const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const FoodItem = require('../models/FoodItem');

// GET all food items — filter by isAvailable and/or category via query params
exports.getFoodItems = asyncHandler(async (req, res, next) => {
  const filter = {};
  if (req.query.isAvailable !== undefined) {
    filter.isAvailable = req.query.isAvailable === 'true';
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }
  const items = await FoodItem.find(filter).sort('category name');
  res.status(200).json({ success: true, count: items.length, data: items });
});

// POST create food item
exports.createFoodItem = asyncHandler(async (req, res, next) => {
  const item = await FoodItem.create(req.body);
  res.status(201).json({ success: true, data: item });
});

// PUT update food item
exports.updateFoodItem = asyncHandler(async (req, res, next) => {
  let item = await FoodItem.findById(req.params.id);
  if (!item) return next(new ErrorResponse(`Food item not found with id ${req.params.id}`, 404));
  item = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: item });
});

// DELETE food item (soft delete — set isAvailable = false)
exports.deleteFoodItem = asyncHandler(async (req, res, next) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) return next(new ErrorResponse(`Food item not found with id ${req.params.id}`, 404));
  item.isAvailable = false;
  await item.save();
  res.status(200).json({ success: true, data: item });
});
