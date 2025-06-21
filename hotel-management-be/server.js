const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/rooms', require('./routes/rooms'));
app.use('/api/v1/guests', require('./routes/guests'));
app.use('/api/v1/bookings', require('./routes/bookings'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/settings', require('./routes/settings'));

// Root route
app.get('/', (req, res) => {
  res.send('Hotel Management System API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('ERROR OCCURRED:');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request body:', req.body);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  console.error('Request query:', req.query);
  console.error('Request params:', req.params);
  
  res.status(500).json({
    success: false,
    message: 'Server error: ' + err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
