import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useBooking } from "../context/BookingContext";

function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { saveBooking } = useBooking();

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load event."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleBooking = async () => {
    try {
      setBooking(true);
      setError("");

      const response = await api.post("/bookings/", {
        event_id: Number(eventId),
        ticket_quantity: quantity,
      });

      saveBooking({
  booking: response.data,
  event: event,
});

navigate("/booking-confirmation");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Booking failed. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <p className="status-message">Loading event...</p>;
  }

  if (error && !event) {
    return <p className="error-message page-message">{error}</p>;
  }

  if (!event) {
    return <p className="status-message">Event not found.</p>;
  }

  return (
    <main className="page-container">
      <div className="event-details">
        <img
          className="event-details-image"
          src={event.banner_image}
          alt={event.title}
        />

        <div className="event-details-content">
          <span className="event-category">
            {event.category}
          </span>

          <h1>{event.title}</h1>

          <p className="event-details-description">
            {event.description}
          </p>

          <div className="event-details-info">
            <p>📍Location: {event.location}</p>

            <p>
              📅 Date:{" "}
              {new Date(event.event_date).toLocaleString()}
            </p>

            <p>🎟️ {event.available_tickets} tickets available</p>
          </div>

          <div className="booking-box">
            <div>
              <span className="price-label">
                Ticket Price
              </span>

              <strong className="details-price">
                ₹{event.ticket_price}
              </strong>
            </div>

            <div className="quantity-control">
              <label>Quantity</label>

              <select
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
              >
                {Array.from(
                  {
                    length: Math.min(
                      event.available_tickets,
                      10
                    ),
                  },
                  (_, index) => index + 1
                ).map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-total">
              <span>Total</span>
              <strong>
                ₹{event.ticket_price * quantity}
              </strong>
            </div>

            {error && (
              <p className="form-error">{error}</p>
            )}

            <button
              className="primary-button"
              onClick={handleBooking}
              disabled={
                booking ||
                event.available_tickets === 0
              }
            >
              {event.available_tickets === 0
                ? "Sold Out"
                : booking
                  ? "Booking..."
                  : "Book Tickets"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default EventDetails;