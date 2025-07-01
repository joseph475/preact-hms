import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const ReceiptPage = () => {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Get booking data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const bookingData = urlParams.get('data');
    
    if (bookingData) {
      try {
        const decodedBooking = JSON.parse(decodeURIComponent(bookingData));
        setBooking(decodedBooking);
      } catch (error) {
        console.error('Error parsing booking data:', error);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!booking) {
    return h('div', { className: 'loading' }, 'Loading receipt...');
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateCheckOutTime = (checkInDate, duration) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkIn.getTime() + (duration * 60 * 60 * 1000));
    return checkOut;
  };

  const checkOutTime = calculateCheckOutTime(booking.checkInDate, booking.duration);
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString();
  const timeStr = currentDate.toLocaleTimeString();

  return h('div', null,
    // Print styles
    h('style', null, `
      @media print {
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.1;
        }
        
        .no-print {
          display: none !important;
        }
        
        .receipt-container {
          width: 80mm;
          margin: 0;
          padding: 2mm;
        }
      }
      
      body {
        margin: 0;
        padding: 20px;
        font-family: 'Courier New', monospace;
        background: #f5f5f5;
      }
      
      .receipt-container {
        width: 80mm;
        margin: 0 auto;
        background: white;
        padding: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
      .large { font-size: 14px; }
      
      .separator {
        border-top: 1px dashed #000;
        margin: 8px 0;
      }
      
      .item-row {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
      }
      
      .item-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 8px;
      }
      
      .item-qty {
        margin-right: 8px;
        min-width: 20px;
      }
      
      .item-price {
        min-width: 60px;
        text-align: right;
      }
      
      .total-row {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
      }
      
      .total-label {
        flex: 1;
      }
      
      .total-amount {
        min-width: 80px;
        text-align: right;
      }
      
      .print-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        margin: 20px auto;
        display: block;
      }
      
      .print-button:hover {
        background: #0056b3;
      }
    `),
    
    // Print button (hidden when printing)
    h('div', { className: 'no-print', style: { textAlign: 'center', marginBottom: '20px' } },
      h('button', {
        onClick: handlePrint,
        className: 'print-button'
      }, '🖨️ Print Receipt')
    ),
    
    // Receipt content
    h('div', { className: 'receipt-container' },
      // Header
      h('div', { className: 'center bold large' }, 'HOTEL MANAGEMENT'),
      h('div', { className: 'center' }, 'Premium Hotel Services'),
      h('div', { className: 'center' }, '123 Hotel Street, City'),
      h('div', { className: 'center' }, 'Tel: (123) 456-7890'),
      
      h('div', { className: 'separator' }),
      
      // Receipt Info
      h('div', { className: 'center bold' }, `BOOKING #${booking._id.slice(-8)}`),
      h('div', { className: 'item-row' },
        h('span', null, 'Date:'),
        h('span', null, dateStr)
      ),
      h('div', { className: 'item-row' },
        h('span', null, 'Time:'),
        h('span', null, timeStr)
      ),
      h('div', { className: 'item-row' },
        h('span', null, 'Staff:'),
        h('span', null, 'Hotel System')
      ),
      
      h('div', { className: 'separator' }),
      
      // Guest Information
      h('div', { className: 'bold' }, 'GUEST:'),
      h('div', null, `${booking.guest?.firstName} ${booking.guest?.lastName}`),
      booking.guest?.phone && h('div', null, booking.guest.phone),
      h('div', null, `${booking.guest?.idType} - ${booking.guest?.idNumber}`),
      
      h('div', { className: 'separator' }),
      
      // Items (Booking Details)
      h('div', { className: 'bold' }, 'ITEMS:'),
      h('div', null,
        h('div', { className: 'item-row' },
          h('span', { className: 'item-name' }, `Room ${booking.room?.roomNumber} (${booking.room?.roomType?.name})`),
          h('span', { className: 'item-qty' }, '1x'),
          h('span', { className: 'item-price' }, `₱${booking.totalAmount?.toLocaleString()}`)
        ),
        h('div', { className: 'right' }, `₱${booking.totalAmount?.toLocaleString()}`)
      ),
      h('div', null,
        h('div', { className: 'item-row' },
          h('span', { className: 'item-name' }, `Duration: ${booking.duration} hours`),
          h('span', { className: 'item-qty' }, ''),
          h('span', { className: 'item-price' }, '')
        )
      ),
      h('div', null,
        h('div', { className: 'item-row' },
          h('span', { className: 'item-name' }, `Check-in: ${formatDateTime(booking.checkInDate)}`),
          h('span', { className: 'item-qty' }, ''),
          h('span', { className: 'item-price' }, '')
        )
      ),
      h('div', null,
        h('div', { className: 'item-row' },
          h('span', { className: 'item-name' }, `Check-out: ${formatDateTime(checkOutTime)}`),
          h('span', { className: 'item-qty' }, ''),
          h('span', { className: 'item-price' }, '')
        )
      ),
      
      h('div', { className: 'separator' }),
      
      // Totals
      h('div', { className: 'total-row' },
        h('span', { className: 'total-label' }, 'Subtotal:'),
        h('span', { className: 'total-amount' }, `₱${booking.totalAmount?.toLocaleString()}`)
      ),
      h('div', { className: 'total-row' },
        h('span', { className: 'total-label' }, 'Tax & Service:'),
        h('span', { className: 'total-amount' }, 'Included')
      ),
      h('div', { className: 'total-row bold large' },
        h('span', { className: 'total-label' }, 'TOTAL:'),
        h('span', { className: 'total-amount' }, `₱${booking.totalAmount?.toLocaleString()}`)
      ),
      
      h('div', { className: 'separator' }),
      
      // Payment Info
      h('div', { className: 'total-row' },
        h('span', { className: 'total-label' }, 'Payment Method:'),
        h('span', { className: 'total-amount' }, booking.paymentMethod?.toUpperCase())
      ),
      h('div', { className: 'total-row' },
        h('span', { className: 'total-label' }, 'Amount Paid:'),
        h('span', { className: 'total-amount' }, `₱${booking.totalAmount?.toLocaleString()}`)
      ),
      h('div', { className: 'total-row' },
        h('span', { className: 'total-label' }, 'Change:'),
        h('span', { className: 'total-amount' }, '₱0')
      ),
      
      h('div', { className: 'separator' }),
      
      // Footer
      h('div', { className: 'center' }, 'Thank you for staying with us!'),
      h('div', { className: 'center' }, 'Please come again'),
      
      h('div', { className: 'separator' }),
      
      h('div', { className: 'center' }, '*** CUSTOMER COPY ***'),
      
      // Spacing for tear-off
      h('div', { style: { height: '20mm' } })
    )
  );
};

export default ReceiptPage;
