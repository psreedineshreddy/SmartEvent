import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

function PaymentCheckout() {
  const navigate = useNavigate();
  const { booking } = useBooking();

  if (!booking?.booking || !booking?.event) {
    return (
      <main className="confirmation-page">
        <div className="confirmation-card">
          <h1>Checkout Unavailable</h1>
          <p className="confirmation-message">
            No pending booking was found. Please select an event first.
          </p>
          <Link to="/" className="primary-button">
            Browse Events
          </Link>
        </div>
      </main>
    );
  }

  const bookingData = booking.booking;
  const event = booking.event;
  const amount =
    bookingData.final_amount ?? bookingData.total_price ?? 0;
  const discount = Number(bookingData.discount_amount ?? 0);

  return (
    <main className="confirmation-page">
      <div className="confirmation-card payment-checkout-card">
        <h1>Review Your Booking</h1>
        <p className="confirmation-message">
          Check your event and ticket details before continuing to payment.
        </p>

        <div className="confirmation-details">
          <h2>{event.title}</h2>

          <div>
            <span>Booking ID</span>
            <strong>#{bookingData.id}</strong>
          </div>

          <div>
            <span>Event Date</span>
            <strong>{new Date(event.event_date).toLocaleString()}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>{event.location}</strong>
          </div>

          <div>
            <span>Tickets</span>
            <strong>{bookingData.ticket_quantity}</strong>
          </div>

          <div>
            <span>Subtotal</span>
            <strong>
              ₹{Number(bookingData.total_price ?? 0).toFixed(2)}
            </strong>
          </div>

          {discount > 0 && (
            <div>
              <span>Discount</span>
              <strong>-₹{discount.toFixed(2)}</strong>
            </div>
          )}

          <div>
            <span>Amount to Pay</span>
            <strong>₹{Number(amount).toFixed(2)}</strong>
          </div>
        </div>

        <p className="confirmation-message">
          Secure checkout preview · Simulated payment · No real money charged
        </p>

        <div className="confirmation-actions">
          <button
            className="primary-button"
            onClick={() => navigate("/payment-methods")}
          >
            Continue to Payment
          </button>

          <Link to="/" className="secondary-button">
            Browse Events
          </Link>
        </div>
      </div>
    </main>
  );
}

export default PaymentCheckout;