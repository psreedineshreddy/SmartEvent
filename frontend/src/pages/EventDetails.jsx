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
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [reviewData, setReviewData] = useState({
  average_rating: 0,
  total_reviews: 0,
  reviews: [],
});
const [reviewsLoading, setReviewsLoading] = useState(true);
const [reviewsError, setReviewsError] = useState("");

const [rating, setRating] = useState(5);
const [reviewText, setReviewText] = useState("");
const [reviewSubmitting, setReviewSubmitting] = useState(false);
const [reviewMessage, setReviewMessage] = useState("");


  const total = event ? event.ticket_price * quantity : 0;
  const finalTotal = coupon ? coupon.final_amount : total;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load event."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
  let cancelled = false;

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");

    try {
      const response = await api.get(`/reviews/event/${eventId}`);

      if (!cancelled) {
        setReviewData(response.data);
      }
    } catch {
      if (!cancelled) {
        setReviewsError("Unable to load reviews right now.");
      }
    } finally {
      if (!cancelled) {
        setReviewsLoading(false);
      }
    }
  };

  fetchReviews();

  return () => {
    cancelled = true;
  };
}, [eventId]);

  const handleQuantityChange = (value) => {
    setQuantity(Number(value));
    setCoupon(null);
    setCouponMessage("");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code.");
      setCoupon(null);
      return;
    }

    try {
      setCouponMessage("Validating coupon...");
      setCoupon(null);

      const response = await api.post("/coupons/validate", {
        coupon_code: couponCode.trim(),
        booking_amount: total,
      });

      setCoupon(response.data);
      setCouponCode(response.data.coupon_code);
      setCouponMessage(response.data.message);
    } catch (err) {
      setCoupon(null);
      setCouponMessage(
        err.response?.data?.detail || "Unable to validate coupon."
      );
    }
  };

  const handleBooking = async () => {
    try {
      setBooking(true);
      setError("");

      const bookingPayload = {
        event_id: Number(eventId),
        ticket_quantity: quantity,
      };

      if (coupon) {
        bookingPayload.coupon_code = coupon.coupon_code;
      }

      const bookingResponse = await api.post(
        "/bookings/",
        bookingPayload
      );

      saveBooking({
        booking: bookingResponse.data,
        event,
        payment: null,
        paymentError: null,
      });

      navigate("/payment-checkout");
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
    <main className="event-details-page">
      <div className="event-details-layout">
        <section className="event-details-main">
          <div className="event-details-image-wrapper">
            <img
              className="event-details-image"
              src={event.banner_image}
              alt={event.title}
            />
          </div>

          <div className="event-details-content">
            <span className="event-category">{event.category}</span>
            <h1>{event.title}</h1>

            <p className="event-details-description">
              {event.description}
            </p>

            <div className="event-details-info">
              <div>
                <span>📍</span>
                <p>
                  <strong>Location</strong>
                  {event.location}
                </p>
              </div>

              <div>
                <span>📅</span>
                <p>
                  <strong>Date &amp; Time</strong>
                  {new Date(event.event_date).toLocaleString()}
                </p>
              </div>

              <div>
                <span>🎟️</span>
                <p>
                  <strong>Availability</strong>
                  {event.available_tickets} tickets available
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="booking-box">
          <div className="booking-heading">
            <span className="price-label">Ticket Price</span>
            <strong className="details-price">
              ₹{Number(event.ticket_price).toFixed(2)}
            </strong>
          </div>

          <div className="quantity-control">
            <label htmlFor="ticket-quantity">
              Number of Tickets
            </label>

            <select
              id="ticket-quantity"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              disabled={booking}
            >
              {Array.from(
                { length: Math.min(event.available_tickets, 10) },
                (_, index) => index + 1
              ).map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
          </div>

          <div className="coupon-section">
            <label htmlFor="coupon-code" className="coupon-label">
              <span>Coupon Code</span>
              <span className="coupon-optional">Optional</span>
            </label>

            <div className="coupon-input-row">
              <input
                id="coupon-code"
                type="text"
                className="coupon-input"
                value={couponCode}
                placeholder="Enter coupon code"
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCoupon(null);
                  setCouponMessage("");
                }}
                disabled={booking}
              />

              <button
                type="button"
                className="coupon-apply-button"
                onClick={handleApplyCoupon}
                disabled={booking}
              >
                Apply
              </button>
            </div>

            {couponMessage && (
              <p
                className={
                  coupon
                    ? "coupon-success"
                    : couponMessage === "Validating coupon..."
                      ? "coupon-validating"
                      : "coupon-message-error"
                }
              >
                {couponMessage}
              </p>
            )}
          </div>

          <div className="price-summary">
            <div className="price-summary-row">
              <span>Subtotal</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>

            {coupon && (
              <div className="price-summary-row discount-row">
                <span>
                  <span className="discount-icon">✓</span>
                  Coupon Discount
                </span>
                <strong>
                  −₹{Number(coupon.discount_amount).toFixed(2)}
                </strong>
              </div>
            )}

            <div className="price-summary-divider" />

            <div className="price-summary-final">
              <div>
                <span>Total Amount</span>
                <small>
                  {coupon
                    ? "Discount applied"
                    : "Including ticket charges"}
                </small>
              </div>

              <strong>
                ₹{Number(finalTotal).toFixed(2)}
              </strong>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="primary-button"
            onClick={handleBooking}
            disabled={
              booking || event.available_tickets === 0
            }
          >
            {event.available_tickets === 0
              ? "Sold Out"
              : booking
                ? "Creating Booking..."
                : "Book & Pay"}
          </button>
             </aside>
      </div>

      <section className="event-reviews-section">
        <div className="event-reviews-heading">
          <div>
            <h2>Attendee Reviews</h2>
            <p>Feedback from people who booked this event.</p>
          </div>

          <div className="event-reviews-summary">
            <strong>★ {Number(reviewData.average_rating).toFixed(1)}</strong>
            <span>
              {reviewData.total_reviews}{" "}
              {reviewData.total_reviews === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {reviewsLoading ? (
          <p className="status-message">Loading reviews...</p>
        ) : reviewsError ? (
          <p className="error-message">{reviewsError}</p>
        ) : reviewData.reviews.length === 0 ? (
          <p className="status-message">
            No reviews yet. Be the first to share your experience after attending!
          </p>
        ) : (
          <div className="event-reviews-list">
            {reviewData.reviews.map((review) => (
              <article className="event-review-card" key={review.id}>
                <div className="event-review-card-heading">
                  <strong>#{review.user_id} Event Participant</strong>
                  <span className="event-review-stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                <p>{review.review_text}</p>

                <time dateTime={review.created_at}>
                  {new Date(review.created_at).toLocaleDateString()}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default EventDetails;
