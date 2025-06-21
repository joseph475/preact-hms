# Hotel Management System - Backend API

A comprehensive hotel management system backend built with Node.js, Express, and MongoDB. This system supports booking management for different durations (3hrs, 8hrs, 12hrs, 24hrs) and provides complete hotel operations functionality.

## Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Room Management** - Manage different room types with pricing and amenities
- **Guest Management** - Complete guest profiles with preferences and history
- **Booking System** - Support for 3hr, 8hr, 12hr, and 24hr bookings
- **Dashboard Analytics** - Real-time statistics and revenue analytics
- **Reports** - Comprehensive reporting for bookings, revenue, occupancy, and guests
- **Check-in/Check-out** - Complete guest lifecycle management

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=8001
   MONGODB_URI=mongodb://localhost:27017/hotel-management
   JWT_SECRET=your-jwt-secret-key-here
   JWT_EXPIRE=30d
   ```

4. Start MongoDB service on your machine

5. Seed the database with sample data:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password

### Rooms
- `GET /api/v1/rooms` - Get all rooms
- `GET /api/v1/rooms/available` - Get available rooms
- `POST /api/v1/rooms` - Create room (Admin/Manager)
- `GET /api/v1/rooms/:id` - Get single room
- `PUT /api/v1/rooms/:id` - Update room (Admin/Manager)
- `DELETE /api/v1/rooms/:id` - Delete room (Admin/Manager)

### Guests
- `GET /api/v1/guests` - Get all guests
- `GET /api/v1/guests/search` - Search guests
- `POST /api/v1/guests` - Create guest
- `GET /api/v1/guests/:id` - Get single guest
- `PUT /api/v1/guests/:id` - Update guest
- `DELETE /api/v1/guests/:id` - Delete guest (Admin/Manager)

### Bookings
- `GET /api/v1/bookings` - Get all bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get single booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Delete booking (Admin/Manager)
- `PUT /api/v1/bookings/:id/checkin` - Check in guest
- `PUT /api/v1/bookings/:id/checkout` - Check out guest
- `PUT /api/v1/bookings/:id/cancel` - Cancel booking

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/revenue` - Get revenue analytics

### Reports
- `GET /api/v1/reports/bookings` - Get booking reports (Admin/Manager)
- `GET /api/v1/reports/revenue` - Get revenue reports (Admin/Manager)
- `GET /api/v1/reports/occupancy` - Get occupancy reports (Admin/Manager)
- `GET /api/v1/reports/guests` - Get guest reports (Admin/Manager)

### Users
- `GET /api/v1/users` - Get all users (Admin)
- `POST /api/v1/users` - Create user (Admin)
- `GET /api/v1/users/:id` - Get single user (Admin)
- `PUT /api/v1/users/:id` - Update user (Admin)
- `DELETE /api/v1/users/:id` - Delete user (Admin)

## User Roles

- **Admin** - Full system access
- **Manager** - Room management, reports, guest management
- **Receptionist** - Booking management, guest check-in/out
- **Staff** - Basic booking and guest information access

## Sample Users

After running the seeder, you can login with these accounts:

- **Admin**: admin@hotel.com / password123
- **Manager**: manager@hotel.com / password123
- **Receptionist**: receptionist@hotel.com / password123
- **Staff**: staff@hotel.com / password123

## Booking Durations

The system supports four booking durations:
- **3hrs** - Short stay
- **8hrs** - Half day
- **12hrs** - Extended stay
- **24hrs** - Full day

## Room Types

- **Standard** - Basic rooms with essential amenities
- **Deluxe** - Enhanced rooms with additional comfort
- **Suite** - Spacious rooms with premium amenities
- **Presidential** - Luxury suites with all premium features

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Import sample data
- `npm run seed:delete` - Delete all data
- `npm run check-db` - Check MongoDB connection

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and descriptive error messages.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- CORS enabled for cross-origin requests
