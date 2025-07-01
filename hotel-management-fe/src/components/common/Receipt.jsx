import { h } from 'preact';
import { useEffect } from 'preact/hooks';

const Receipt = ({ booking, onClose, autoPrint = false }) => {
  if (!booking) return null;

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

  const handleDirectPrint = (bookingData) => {
    const checkOutTime = calculateCheckOutTime(bookingData.checkInDate, bookingData.duration);
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString();
    const timeStr = currentDate.toLocaleTimeString();

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hotel Receipt</title>
          <style>
            @media print {
              @page {
                size: 80mm 297mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            .print-button {
              display: block;
              margin: 10mm auto;
              padding: 5mm 10mm;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 3mm;
              font-size: 12px;
              cursor: pointer;
            }
            @media print {
              .print-button { display: none !important; }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.1;
              margin: 0;
              padding: 4mm;
              width: 72mm;
              background: white;
              color: black;
            }
            .receipt {
              width: 100%;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .large { font-size: 14px; }
            .separator {
              border-top: 1px dashed #000;
              margin: 3mm 0;
              height: 1px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
            }
            .item-name {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 2mm;
            }
            .item-qty {
              margin-right: 2mm;
              min-width: 15mm;
            }
            .item-price {
              min-width: 15mm;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
            }
            .total-label {
              flex: 1;
            }
            .total-amount {
              min-width: 20mm;
              text-align: right;
            }
            .print-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <!-- Header -->
            <div class="center bold large">HOTEL MANAGEMENT</div>
            <div class="center">Premium Hotel Services</div>
            <div class="center">123 Hotel Street, City</div>
            <div class="center">Tel: (123) 456-7890</div>
            
            <div class="separator"></div>
            
            <!-- Receipt Info -->
            <div class="center bold">BOOKING #${bookingData._id.slice(-8)}</div>
            <div class="item-row">
              <span>Date:</span>
              <span>${dateStr}</span>
            </div>
            <div class="item-row">
              <span>Time:</span>
              <span>${timeStr}</span>
            </div>
            <div class="item-row">
              <span>Staff:</span>
              <span>Hotel System</span>
            </div>
            
            <div class="separator"></div>
            
            <!-- Guest Information -->
            <div class="bold">GUEST:</div>
            <div>${bookingData.guest?.firstName} ${bookingData.guest?.lastName}</div>
            ${bookingData.guest?.phone ? `<div>${bookingData.guest.phone}</div>` : ''}
            <div>${bookingData.guest?.idType} - ${bookingData.guest?.idNumber}</div>
            
            <div class="separator"></div>
            
            <!-- Items (Booking Details) -->
            <div class="bold">ITEMS:</div>
            <div class="item-row">
              <span class="item-name">Room ${bookingData.room?.roomNumber} (${bookingData.room?.roomType?.name})</span>
              <span class="item-qty">1x</span>
              <span class="item-price">₱${bookingData.totalAmount?.toLocaleString()}</span>
            </div>
            <div class="right">₱${bookingData.totalAmount?.toLocaleString()}</div>
            
            <div class="item-row">
              <span class="item-name">Duration: ${bookingData.duration} hours</span>
              <span class="item-qty"></span>
              <span class="item-price"></span>
            </div>
            <div class="item-row">
              <span class="item-name">Check-in: ${formatDateTime(bookingData.checkInDate)}</span>
              <span class="item-qty"></span>
              <span class="item-price"></span>
            </div>
            <div class="item-row">
              <span class="item-name">Check-out: ${formatDateTime(checkOutTime)}</span>
              <span class="item-qty"></span>
              <span class="item-price"></span>
            </div>
            
            <div class="separator"></div>
            
            <!-- Totals -->
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-amount">₱${bookingData.totalAmount?.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax & Service:</span>
              <span class="total-amount">Included</span>
            </div>
            <div class="total-row bold large">
              <span class="total-label">TOTAL:</span>
              <span class="total-amount">₱${bookingData.totalAmount?.toLocaleString()}</span>
            </div>
            
            <div class="separator"></div>
            
            <!-- Payment Info -->
            <div class="total-row">
              <span class="total-label">Payment Method:</span>
              <span class="total-amount">${bookingData.paymentMethod?.toUpperCase()}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Amount Paid:</span>
              <span class="total-amount">₱${bookingData.totalAmount?.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Change:</span>
              <span class="total-amount">₱0</span>
            </div>
            
            <div class="separator"></div>
            
            <!-- Footer -->
            <div class="center">Thank you for staying with us!</div>
            <div class="center">Please come again</div>
            
            <div class="separator"></div>
            
            <div class="center">*** CUSTOMER COPY ***</div>
            
            <!-- Spacing for tear-off -->
            <div style="height: 10mm;"></div>
          </div>

          <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">
            🖨️ Print Receipt
          </button>

          <script>
            // Auto-print for desktop PWAs, manual for mobile
            if (!navigator.userAgent.match(/Mobile|Android|iPhone|iPad/)) {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 1000);
              }, 100);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
  };

  // Auto-print when component mounts with autoPrint
  useEffect(() => {
    if (autoPrint && booking) {
      handleDirectPrint(booking);
      // Close the component immediately
      if (onClose) onClose();
    }
  }, [autoPrint, booking]);

  // If not auto-printing, show manual button
  if (!autoPrint && booking) {
    return h('div', { className: "receipt-manual" },
      h('button', {
        onClick: () => handleDirectPrint(booking),
        className: "btn-primary"
      }, "Print Receipt")
    );
  }

  // Return null for auto-print mode (receipt opens automatically)
  return null;
};

export default Receipt;
