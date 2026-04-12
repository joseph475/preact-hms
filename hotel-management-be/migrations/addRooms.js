/**
 * Migration: Add rooms to reach 25 total
 * Run: node migrations/addRooms.js
 *
 * Safe to run multiple times — skips rooms that already exist by roomNumber.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Amenity = require('../models/Amenity');

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Rooms to add (25 total target)
// Floor 1: 101-107 Standard (7 rooms)
// Floor 2: 201-207 Deluxe   (7 rooms)
// Floor 3: 301-306 Suite    (6 rooms)
// Floor 4: 401-405 Presidential (5 rooms)
const newRooms = [
  // Floor 1 — Standard
  { roomNumber: '104', roomType: 'Standard', floor: 1, capacity: 2, amenities: ['WiFi', 'AC', 'TV'], pricePerHour: 50, description: 'Standard room with twin beds' },
  { roomNumber: '105', roomType: 'Standard', floor: 1, capacity: 2, amenities: ['WiFi', 'AC', 'TV', 'Safe'], pricePerHour: 55, description: 'Standard room with in-room safe' },
  { roomNumber: '106', roomType: 'Standard', floor: 1, capacity: 1, amenities: ['WiFi', 'AC', 'TV'], pricePerHour: 40, description: 'Single standard room' },
  { roomNumber: '107', roomType: 'Standard', floor: 1, capacity: 2, amenities: ['WiFi', 'AC', 'TV', 'Telephone'], pricePerHour: 50, description: 'Standard room with direct-dial phone' },

  // Floor 2 — Deluxe
  { roomNumber: '201', roomType: 'Deluxe', floor: 2, capacity: 3, amenities: ['WiFi', 'AC', 'TV', 'Minibar'], pricePerHour: 75, description: 'Deluxe room with minibar' },
  { roomNumber: '202', roomType: 'Deluxe', floor: 2, capacity: 3, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony'], pricePerHour: 80, description: 'Deluxe room with balcony' },
  { roomNumber: '203', roomType: 'Deluxe', floor: 2, capacity: 2, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Safe'], pricePerHour: 70, description: 'Deluxe room with safe' },
  { roomNumber: '204', roomType: 'Deluxe', floor: 2, capacity: 3, amenities: ['WiFi', 'AC', 'TV', 'Minibar'], pricePerHour: 75, description: 'Deluxe room with minibar' },
  { roomNumber: '205', roomType: 'Deluxe', floor: 2, capacity: 3, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony'], pricePerHour: 80, description: 'Deluxe room with balcony view' },
  { roomNumber: '206', roomType: 'Deluxe', floor: 2, capacity: 2, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Safe'], pricePerHour: 70, description: 'Deluxe double room with safe' },
  { roomNumber: '207', roomType: 'Deluxe', floor: 2, capacity: 4, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Safe'], pricePerHour: 85, description: 'Deluxe family room' },

  // Floor 3 — Suite
  { roomNumber: '304', roomType: 'Suite', floor: 3, capacity: 4, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Jacuzzi'], pricePerHour: 120, description: 'Suite with jacuzzi and balcony' },
  { roomNumber: '305', roomType: 'Suite', floor: 3, capacity: 4, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Kitchen', 'Safe'], pricePerHour: 130, description: 'Suite with kitchenette' },
  { roomNumber: '306', roomType: 'Suite', floor: 3, capacity: 3, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony'], pricePerHour: 110, description: 'Junior suite with balcony' },

  // Floor 4 — Presidential
  { roomNumber: '402', roomType: 'Presidential', floor: 4, capacity: 6, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Jacuzzi', 'Kitchen', 'Safe'], pricePerHour: 200, description: 'Presidential suite — ocean view' },
  { roomNumber: '403', roomType: 'Presidential', floor: 4, capacity: 6, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Jacuzzi', 'Kitchen', 'Safe', 'Telephone'], pricePerHour: 220, description: 'Presidential suite — corner penthouse' },
  { roomNumber: '404', roomType: 'Presidential', floor: 4, capacity: 8, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Jacuzzi', 'Kitchen', 'Safe', 'Telephone'], pricePerHour: 250, description: 'Presidential grand suite — full floor' },
  { roomNumber: '405', roomType: 'Presidential', floor: 4, capacity: 6, amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Kitchen', 'Safe'], pricePerHour: 190, description: 'Presidential suite — garden view' },
];

const run = async () => {
  try {
    const [roomTypes, amenities, existingRooms] = await Promise.all([
      RoomType.find(),
      Amenity.find(),
      Room.find({}, 'roomNumber'),
    ]);

    const existingNumbers = new Set(existingRooms.map(r => r.roomNumber));
    console.log(`Existing rooms: ${existingNumbers.size} (${[...existingNumbers].sort().join(', ')})`);

    const toInsert = newRooms
      .filter(r => !existingNumbers.has(r.roomNumber))
      .map(room => {
        const rtDoc = roomTypes.find(rt => rt.name === room.roomType);
        if (!rtDoc) throw new Error(`RoomType "${room.roomType}" not found — run seeder first`);

        const amenityIds = room.amenities.map(name => {
          const a = amenities.find(a => a.name === name);
          return a ? a._id : null;
        }).filter(Boolean);

        return {
          ...room,
          roomType: rtDoc._id,
          amenities: amenityIds,
          status: 'Available',
          isActive: true,
          pricing: {
            hourly3: room.pricePerHour * 3,
            hourly8: room.pricePerHour * 8,
            hourly12: room.pricePerHour * 12,
            daily: room.pricePerHour * 24,
          },
        };
      });

    if (toInsert.length === 0) {
      console.log('All rooms already exist — nothing to insert.');
    } else {
      const created = await Room.create(toInsert);
      console.log(`Added ${created.length} room(s): ${created.map(r => r.roomNumber).join(', ')}`);
    }

    const total = await Room.countDocuments();
    console.log(`Total rooms now: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

run();
