const express = require('express');
const { getFoodItems, createFoodItem, updateFoodItem, deleteFoodItem } = require('../controllers/foodItems');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getFoodItems).post(authorize('admin', 'user'), createFoodItem);
router.route('/:id').put(authorize('admin', 'user'), updateFoodItem).delete(authorize('admin', 'user'), deleteFoodItem);
module.exports = router;
