import { Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

function BookingConfirmation() {
  const { booking, clearBooking } = useBooking();

  if (!booking) {
    return (
      <main className="page-container">
        <div className="confirmation-card">
          <h1>Booking Confirmation</h1>
          <p>Booking details are not available.</p>

          <Link to="/" className="view-button">
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const bookingData = booking.booking;
  const event = booking.event;

  const handleBrowseEvents = () => {
    clearBooking();
  };

  return (
    <main className="page-container">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>

        <h1>Booking Confirmed!</h1>

        <p className="confirmation-message">
          Your tickets have been booked successfully.
        </p>

        <div className="confirmation-details">
          <h2>{event.title}</h2>

          <div>
            <span>Booking ID</span>
            <strong>#{bookingData.id}</strong>
          </div>

          <div>
            <span>Tickets</span>
            <strong>{bookingData.ticket_quantity}</strong>
          </div>

          <div>
            <span>Total</span>
            <strong>₹{bookingData.total_price}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{bookingData.booking_status}</strong>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/tickets" className="primary-button">
            View My Ticket
          </Link>

          <Link
            to="/booking-history"
            className="secondary-button"
          >
            Booking History
          </Link>

          <Link
            to="/"
            className="secondary-button"
            onClick={handleBrowseEvents}
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </main>
  );
}

export default BookingConfirmation;