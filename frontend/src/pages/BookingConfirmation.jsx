import { Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

function BookingConfirmation() {
  const { booking, clearBooking } = useBooking();

  if (!booking) {
    return (
      <main className="confirmation-page">
        <div className="confirmation-card">
          <div className="confirmation-icon error-icon">!</div>
          <h1>Booking Details Unavailable</h1>
          <p className="confirmation-message">
            No recent booking details were found.
          </p>
          <Link to="/" className="primary-button confirmation-button">
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const bookingData = booking.booking;
  const event = booking.event;
  const payment = booking.payment;
  const paymentError = booking.paymentError;

  const paymentSuccessful = payment?.payment_status === "SUCCESS";
  const paymentFailed =
    payment?.payment_status === "FAILED" || Boolean(paymentError);

  const handleBrowseEvents = () => {
    clearBooking();
  };

  const amountPaid =
    payment?.amount ?? bookingData.final_amount ?? bookingData.total_price;

  return (
    <main className="confirmation-page">
      <div className="confirmation-card">
        <div
          className={`confirmation-icon ${
            paymentSuccessful ? "" : "error-icon"
          }`}
        >
          {paymentSuccessful ? "✓" : "!"}
        </div>

        <h1>
          {paymentSuccessful
            ? "Booking Confirmed!"
            : paymentFailed
              ? "Payment Failed"
              : "Payment Not Completed"}
        </h1>

        <p className="confirmation-message">
          {paymentSuccessful
            ? "Your payment was successful and your booking is confirmed."
            : paymentFailed
              ? paymentError ||
                "Your payment was unsuccessful. Please check your booking history before trying again."
              : "Your booking is not confirmed because payment has not been completed."}
        </p>

        <div className="confirmation-details">
          <h2>{event?.title || bookingData.event_title || "Event"}</h2>

          <div>
            <span>Booking ID</span>
            <strong>#{bookingData.id}</strong>
          </div>

          <div>
            <span>Tickets</span>
            <strong>{bookingData.ticket_quantity}</strong>
          </div>

          <div>
            <span>Subtotal</span>
            <strong>
              ₹{Number(bookingData.total_price || 0).toFixed(2)}
            </strong>
          </div>

          {Number(bookingData.discount_amount || 0) > 0 && (
            <div>
              <span>Discount</span>
              <strong>
                -₹{Number(bookingData.discount_amount).toFixed(2)}
              </strong>
            </div>
          )}

          <div>
            <span>{paymentSuccessful ? "Amount Paid" : "Final Amount"}</span>
            <strong>₹{Number(amountPaid || 0).toFixed(2)}</strong>
          </div>

          {payment?.transaction_id && (
            <div>
              <span>Transaction ID</span>
              <strong>{payment.transaction_id}</strong>
            </div>
          )}

          {payment?.payment_status && (
            <div>
              <span>Payment Status</span>
              <strong className="booking-status">
                {payment.payment_status}
              </strong>
            </div>
          )}

          <div>
            <span>Booking Status</span>
            <strong className="booking-status">
              {bookingData.booking_status}
            </strong>
          </div>
        </div>

        <div className="confirmation-actions">
          {paymentSuccessful && (
            <Link to="/tickets" className="primary-button">
              View My Ticket
            </Link>
          )}

          <Link to="/booking-history" className="secondary-button">
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