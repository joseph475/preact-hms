# Hotel Management System - Frontend

A modern hotel management system frontend built with Preact, Tailwind CSS, and Webpack. This system supports booking management for different durations (3hrs, 8hrs, 12hrs, 24hrs) and provides a complete hotel operations interface.

## Features

- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **Role-based Access** - Different interfaces for Admin, Manager, Receptionist, and Staff
- **Dashboard Analytics** - Real-time statistics and key performance indicators
- **Booking Management** - Support for 3hr, 8hr, 12hr, and 24hr bookings
- **Room Management** - Comprehensive room status and pricing management
- **Guest Management** - Complete guest profiles and history tracking
- **Reports & Analytics** - Detailed reporting with data visualization
- **User Management** - Admin-only user account management
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Preact** - Lightweight React alternative
- **Preact Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Webpack** - Module bundler and development server
- **Babel** - JavaScript transpiler
- **PostCSS** - CSS processing

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd hotel-management-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3002`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run start` - Start development server in watch mode
- `npm run build` - Build for production
- `npm run clean` - Clean the dist directory
- `npm run lint` - Run ESLint on source files

## Project Structure

```
src/
├── components/
│   ├── App.jsx                 # Main application component
│   ├── layout/                 # Layout components
│   │   ├── Header.jsx         # Top navigation header
│   │   └── Sidebar.jsx        # Side navigation menu
│   └── pages/                 # Page components
│       ├── auth/              # Authentication pages
│       ├── dashboard/         # Dashboard and analytics
│       ├── bookings/          # Booking management
│       ├── rooms/             # Room management
│       ├── guests/            # Guest management
│       ├── reports/           # Reports and analytics
│       ├── users/             # User management (Admin only)
│       └── profile/           # User profile settings
├── hooks/
│   └── useAuth.js             # Authentication hook
├── services/
│   └── api.js                 # API service layer
├── styles/
│   └── index.css              # Global styles and Tailwind imports
├── index.html                 # HTML template
└── index.js                   # Application entry point
```

## User Roles & Permissions

### Admin
- Full system access
- User management
- All reports and analytics
- System configuration

### Manager
- Room management
- Guest management
- Booking management
- Reports and analytics
- Staff oversight

### Receptionist
- Guest check-in/check-out
- Booking management
- Guest management
- Basic reporting

### Staff
- View bookings
- Basic guest information
- Limited room status access

## Sample Login Credentials

After running the backend seeder, you can use these accounts:

- **Admin**: admin@hotel.com / password123
- **Manager**: manager@hotel.com / password123
- **Receptionist**: receptionist@hotel.com / password123
- **Staff**: staff@hotel.com / password123

## Key Features

### Booking Duration Support
The system supports four booking durations:
- **3 hours** - Short stay bookings
- **8 hours** - Half-day bookings
- **12 hours** - Extended stay bookings
- **24 hours** - Full-day bookings

### Room Types
- **Standard** - Basic rooms with essential amenities
- **Deluxe** - Enhanced rooms with additional comfort
- **Suite** - Spacious rooms with premium amenities
- **Presidential** - Luxury suites with all premium features

### Dashboard Features
- Real-time occupancy rates
- Revenue analytics
- Recent booking activity
- Room status overview
- Quick action buttons

### Responsive Design
- Mobile-first approach
- Tablet-optimized layouts
- Desktop-enhanced experience
- Touch-friendly interfaces

## API Integration

The frontend communicates with the backend API running on `http://localhost:8001`. Key API endpoints include:

- Authentication and user management
- Room CRUD operations
- Guest management
- Booking lifecycle management
- Dashboard statistics
- Comprehensive reporting

## Development Guidelines

### Component Structure
- Use functional components with hooks
- Keep components small and focused
- Implement proper prop validation
- Follow consistent naming conventions

### Styling
- Use Tailwind utility classes
- Create reusable component classes
- Maintain consistent spacing and colors
- Ensure responsive design patterns

### State Management
- Use local state for component-specific data
- Implement custom hooks for shared logic
- Keep API calls in service layer
- Handle loading and error states

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with dynamic imports
- Optimized bundle sizes with Webpack
- Efficient re-rendering with Preact
- Lazy loading for non-critical components

## Security Features

- JWT token-based authentication
- Role-based route protection
- Secure API communication
- Input validation and sanitization

## Future Enhancements

- Real-time notifications
- Advanced reporting charts
- Mobile app version
- Integration with payment gateways
- Multi-language support
- Dark mode theme
