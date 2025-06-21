const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Room = require('./models/Room');
const Guest = require('./models/Guest');
const Booking = require('./models/Booking');
const RoomType = require('./models/RoomType');
const Amenity = require('./models/Amenity');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
const users = [
  {
    name: 'Hotel Admin',
    email: 'admin@hotel.com',
    role: 'admin',
    password: 'admin123'
  },
  {
    name: 'Hotel Manager',
    email: 'manager@hotel.com',
    role: 'user',
    password: 'password123'
  },
  {
    name: 'Front Desk Staff',
    email: 'staff@hotel.com',
    role: 'user',
    password: 'password123'
  }
];

const roomTypes = [
  {
    name: 'Standard',
    description: 'Basic room with essential amenities',
    baseCapacity: 2,
    pricing: {
      hourly3: 150,
      hourly8: 400,
      hourly12: 600,
      daily: 1200
    },
    penalty: 200
  },
  {
    name: 'Deluxe',
    description: 'Spacious room with premium amenities',
    baseCapacity: 3,
    pricing: {
      hourly3: 225,
      hourly8: 600,
      hourly12: 900,
      daily: 1800
    },
    penalty: 300
  },
  {
    name: 'Suite',
    description: 'Luxury suite with separate living area',
    baseCapacity: 4,
    pricing: {
      hourly3: 360,
      hourly8: 960,
      hourly12: 1440,
      daily: 2880
    },
    penalty: 500
  },
  {
    name: 'Presidential',
    description: 'Top-tier suite with all premium amenities',
    baseCapacity: 6,
    pricing: {
      hourly3: 600,
      hourly8: 1600,
      hourly12: 2400,
      daily: 4800
    },
    penalty: 1000
  }
];

const amenities = [
  {
    name: 'WiFi',
    description: 'High-speed wireless internet',
    icon: 'wifi'
  },
  {
    name: 'AC',
    description: 'Air conditioning',
    icon: 'ac'
  },
  {
    name: 'TV',
    description: 'Flat-screen television',
    icon: 'tv'
  },
  {
    name: 'Minibar',
    description: 'In-room minibar with beverages',
    icon: 'minibar'
  },
  {
    name: 'Balcony',
    description: 'Private balcony with view',
    icon: 'balcony'
  },
  {
    name: 'Jacuzzi',
    description: 'Private jacuzzi',
    icon: 'jacuzzi'
  },
  {
    name: 'Kitchen',
    description: 'Kitchenette with cooking facilities',
    icon: 'kitchen'
  },
  {
    name: 'Safe',
    description: 'In-room safety deposit box',
    icon: 'safe'
  },
  {
    name: 'Telephone',
    description: 'Direct dial telephone',
    icon: 'phone'
  }
];

const rooms = [
  {
    roomNumber: '101',
    roomType: 'Standard',
    floor: 1,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV'],
    pricePerHour: 50,
    status: 'Available',
    description: 'Comfortable standard room with basic amenities',
    telephone: '101'
  },
  {
    roomNumber: '102',
    roomType: 'Standard',
    floor: 1,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV'],
    pricePerHour: 50,
    status: 'Available',
    description: 'Comfortable standard room with basic amenities',
    telephone: '102'
  },
  {
    roomNumber: '201',
    roomType: 'Deluxe',
    floor: 2,
    capacity: 3,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar'],
    pricePerHour: 75,
    status: 'Available',
    description: 'Spacious deluxe room with premium amenities',
    telephone: '201'
  },
  {
    roomNumber: '202',
    roomType: 'Deluxe',
    floor: 2,
    capacity: 3,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony'],
    pricePerHour: 80,
    status: 'Occupied',
    description: 'Deluxe room with balcony and city view',
    telephone: '202'
  },
  {
    roomNumber: '301',
    roomType: 'Suite',
    floor: 3,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Jacuzzi'],
    pricePerHour: 120,
    status: 'Available',
    description: 'Luxury suite with jacuzzi and premium amenities',
    telephone: '301'
  },
  {
    roomNumber: '302',
    roomType: 'Suite',
    floor: 3,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Kitchen'],
    pricePerHour: 130,
    status: 'Available',
    description: 'Executive suite with kitchenette',
    telephone: '302'
  },
  {
    roomNumber: '401',
    roomType: 'Presidential',
    floor: 4,
    capacity: 6,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Jacuzzi', 'Kitchen', 'Safe'],
    pricePerHour: 200,
    status: 'Available',
    description: 'Presidential suite with all premium amenities',
    telephone: '401'
  },
  {
    roomNumber: '103',
    roomType: 'Standard',
    floor: 1,
    capacity: 1,
    amenities: ['WiFi', 'AC', 'TV'],
    pricePerHour: 40,
    status: 'Available',
    description: 'Single occupancy standard room',
    telephone: '103'
  },
  {
    roomNumber: '203',
    roomType: 'Deluxe',
    floor: 2,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Safe'],
    pricePerHour: 70,
    status: 'Maintenance',
    description: 'Deluxe room currently under maintenance',
    telephone: '203'
  },
  {
    roomNumber: '303',
    roomType: 'Suite',
    floor: 3,
    capacity: 3,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony'],
    pricePerHour: 110,
    status: 'Available',
    description: 'Junior suite with balcony',
    telephone: '303'
  }
];

const guests = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    idType: 'Passport',
    idNumber: 'P123456789',
    dateOfBirth: new Date('1985-06-15'),
    nationality: 'American',
    emergencyContact: {
      name: 'Jane Smith',
      phone: '+1-555-0102',
      relationship: 'Spouse'
    },
    preferences: {
      roomType: 'Deluxe',
      specialRequests: 'Non-smoking room'
    },
    isVip: false
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1-555-0201',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA'
    },
    idType: 'Driver License',
    idNumber: 'DL987654321',
    dateOfBirth: new Date('1990-03-22'),
    nationality: 'American',
    emergencyContact: {
      name: 'Carlos Garcia',
      phone: '+1-555-0202',
      relationship: 'Brother'
    },
    preferences: {
      roomType: 'Suite',
      specialRequests: 'High floor room'
    },
    isVip: true
  },
  {
    firstName: 'David',
    lastName: 'Johnson',
    email: 'david.johnson@email.com',
    phone: '+1-555-0301',
    address: {
      street: '789 Pine Street',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA'
    },
    idType: 'National ID',
    idNumber: 'ID456789123',
    dateOfBirth: new Date('1978-11-08'),
    nationality: 'American',
    emergencyContact: {
      name: 'Sarah Johnson',
      phone: '+1-555-0302',
      relationship: 'Wife'
    },
    preferences: {
      roomType: 'Standard',
      specialRequests: 'Late checkout'
    },
    isVip: false
  },
  {
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@email.com',
    phone: '+1-555-0401',
    address: {
      street: '321 Elm Street',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'USA'
    },
    idType: 'Passport',
    idNumber: 'P987654321',
    dateOfBirth: new Date('1992-09-14'),
    nationality: 'American',
    emergencyContact: {
      name: 'Michael Brown',
      phone: '+1-555-0402',
      relationship: 'Father'
    },
    preferences: {
      roomType: 'Deluxe',
      specialRequests: 'Room with balcony'
    },
    isVip: false
  },
  {
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@email.com',
    phone: '+1-555-0501',
    address: {
      street: '654 Maple Avenue',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'USA'
    },
    idType: 'Driver License',
    idNumber: 'DL123456789',
    dateOfBirth: new Date('1980-12-03'),
    nationality: 'American',
    emergencyContact: {
      name: 'Lisa Wilson',
      phone: '+1-555-0502',
      relationship: 'Wife'
    },
    preferences: {
      roomType: 'Presidential',
      specialRequests: 'Business center access'
    },
    isVip: true
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Room.deleteMany();
    await Guest.deleteMany();
    await Booking.deleteMany();
    await RoomType.deleteMany();
    await Amenity.deleteMany();

    console.log('Data cleared...');
    
    // Create room types and amenities first
    const createdRoomTypes = await RoomType.create(roomTypes);
    console.log(`${createdRoomTypes.length} room types created`);

    const createdAmenities = await Amenity.create(amenities);
    console.log(`${createdAmenities.length} amenities created`);

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Update rooms to use ObjectIds for roomType and amenities
    const updatedRooms = rooms.map(room => {
      const roomType = createdRoomTypes.find(rt => rt.name === room.roomType);
      const roomAmenities = room.amenities.map(amenityName => {
        const amenity = createdAmenities.find(a => a.name === amenityName);
        return amenity ? amenity._id : null;
      }).filter(id => id !== null);

      return {
        ...room,
        roomType: roomType._id,
        amenities: roomAmenities,
        pricing: {
          hourly3: room.pricePerHour * 3,
          hourly8: room.pricePerHour * 8,
          hourly12: room.pricePerHour * 12,
          daily: room.pricePerHour * 24
        }
      };
    });

    // Create rooms
    const createdRooms = await Room.create(updatedRooms);
    console.log(`${createdRooms.length} rooms created`);

    // Create guests
    const createdGuests = await Guest.create(guests);
    console.log(`${createdGuests.length} guests created`);

    // Create sample bookings
    const adminUser = createdUsers[0]; // Use first user as admin
    const availableRooms = createdRooms.filter(room => room.status === 'Available');
    const sampleGuests = createdGuests.slice(0, 3);

    const bookings = [
      {
        guest: {
          firstName: sampleGuests[0].firstName,
          lastName: sampleGuests[0].lastName,
          phone: sampleGuests[0].phone,
          idType: sampleGuests[0].idType,
          idNumber: sampleGuests[0].idNumber
        },
        room: availableRooms[0]._id,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        duration: '3hrs',
        numberOfGuests: 1,
        totalAmount: 150,
        paidAmount: 150,
        paymentStatus: 'Paid',
        paymentMethod: 'Credit Card',
        bookingStatus: 'Confirmed',
        specialRequests: 'Early check-in requested',
        createdBy: adminUser._id
      },
      {
        guest: {
          firstName: sampleGuests[1].firstName,
          lastName: sampleGuests[1].lastName,
          phone: sampleGuests[1].phone,
          idType: sampleGuests[1].idType,
          idNumber: sampleGuests[1].idNumber
        },
        room: availableRooms[1]._id,
        checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        checkOutDate: new Date(Date.now() + 32 * 60 * 60 * 1000), // Tomorrow + 8 hours
        duration: '8hrs',
        numberOfGuests: 2,
        totalAmount: 400,
        paidAmount: 0,
        paymentStatus: 'Pending',
        bookingStatus: 'Confirmed',
        specialRequests: 'Twin beds preferred',
        createdBy: adminUser._id
      },
      {
        guest: {
          firstName: sampleGuests[2].firstName,
          lastName: sampleGuests[2].lastName,
          phone: sampleGuests[2].phone,
          idType: sampleGuests[2].idType,
          idNumber: sampleGuests[2].idNumber
        },
        room: availableRooms[2]._id,
        checkInDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        checkOutDate: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now (12hrs total)
        actualCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: '12hrs',
        numberOfGuests: 2,
        totalAmount: 600,
        paidAmount: 600,
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        bookingStatus: 'Checked In',
        specialRequests: 'Late checkout if possible',
        createdBy: adminUser._id
      },
      {
        guest: {
          firstName: sampleGuests[0].firstName,
          lastName: sampleGuests[0].lastName,
          phone: sampleGuests[0].phone,
          idType: sampleGuests[0].idType,
          idNumber: sampleGuests[0].idNumber
        },
        room: availableRooms[3]._id,
        checkInDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        checkOutDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // Day after tomorrow + 24 hours
        duration: '24hrs',
        numberOfGuests: 1,
        totalAmount: 1200,
        paidAmount: 600, // Partial payment
        paymentStatus: 'Partial',
        paymentMethod: 'Bank Transfer',
        bookingStatus: 'Confirmed',
        specialRequests: 'Quiet room preferred',
        createdBy: adminUser._id
      }
    ];

    const createdBookings = await Booking.create(bookings);
    console.log(`${createdBookings.length} bookings created`);

    // Update room status for occupied room
    const occupiedRoom = createdRooms.find(room => room.status === 'Occupied');
    if (occupiedRoom) {
      // Create a booking for the occupied room
      const occupiedBooking = await Booking.create({
        guest: {
          firstName: sampleGuests[1].firstName,
          lastName: sampleGuests[1].lastName,
          phone: sampleGuests[1].phone,
          idType: sampleGuests[1].idType,
          idNumber: sampleGuests[1].idNumber
        },
        room: occupiedRoom._id,
        checkInDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        checkOutDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now (8hrs total)
        actualCheckIn: new Date(Date.now() - 4 * 60 * 60 * 1000),
        duration: '8hrs',
        numberOfGuests: 2,
        totalAmount: 600,
        paidAmount: 600,
        paymentStatus: 'Paid',
        paymentMethod: 'Credit Card',
        bookingStatus: 'Checked In',
        specialRequests: 'Room service requested',
        createdBy: adminUser._id
      });
      console.log('Occupied room booking created');
    }

    console.log('Data import complete!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Room.deleteMany();
    await Guest.deleteMany();
    await Booking.deleteMany();
    await RoomType.deleteMany();
    await Amenity.deleteMany();

    console.log('Data destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Process command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please provide proper command: -i (import) or -d (delete)');
  process.exit();
}
