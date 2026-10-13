import { useEffect, useState } from "react";
import api from "../api/axios";

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState({});
  const [reviewTexts, setReviewTexts] = useState({});
  const [reviewMessages, setReviewMessages] = useState({});
  const [reviewErrors, setReviewErrors] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [reviewedEventIds, setReviewedEventIds] = useState([]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [bookingsResponse, eventsResponse, profileResponse] =
          await Promise.all([
            api.get("/bookings/"),
            api.get("/events/"),
            api.get("/users/profile"),
          ]);

        if (!active) return;

        const userId = profileResponse.data.id;
        const bookingData = bookingsResponse.data;
        const eventData = eventsResponse.data;

        setBookings(bookingData);
        setEvents(eventData);

        const eventIds = [
          ...new Set(bookingData.map((booking) => booking.event_id)),
        ];

        const reviewResponses = await Promise.all(
          eventIds.map(async (eventId) => {
            try {
              const response = await api.get(`/reviews/event/${eventId}`);
              return response.data.reviews || [];
            } catch {
              return [];
            }
          })
        );

        if (!active) return;

        const reviewedIds = new Set();

        reviewResponses.flat().forEach((review) => {
          if (
            review.user_id === userId &&
            review.event_id != null
          ) {
            reviewedIds.add(Number(review.event_id));
          }
        });

        setReviewedEventIds([...reviewedIds]);
      } catch {
        if (active) {
          setError("Unable to load booking history.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const handleReviewSubmit = async (eventId) => {
    const rating = Number(ratings[eventId] || 5);
    const reviewText = (reviewTexts[eventId] || "").trim();

    if (reviewText.length < 3) {
      setReviewErrors((prev) => ({
        ...prev,
        [eventId]: "Please write at least 3 characters.",
      }));
      return;
    }

    setSubmitting((prev) => ({ ...prev, [eventId]: true }));
    setReviewErrors((prev) => ({ ...prev, [eventId]: "" }));
    setReviewMessages((prev) => ({ ...prev, [eventId]: "" }));

    try {
      await api.post("/reviews/", {
        event_id: Number(eventId),
        rating,
        review_text: reviewText,
      });

      setReviewedEventIds((prev) =>
        prev.includes(Number(eventId))
          ? prev
          : [...prev, Number(eventId)]
      );

      setReviewMessages((prev) => ({
        ...prev,
        [eventId]: "Your review was submitted successfully!",
      }));

      setReviewTexts((prev) => ({ ...prev, [eventId]: "" }));
    } catch (err) {
      setReviewErrors((prev) => ({
        ...prev,
        [eventId]:
          err.response?.data?.detail ||
          "Unable to submit your review. Please try again.",
      }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <p className="status-message">Loading booking history...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <p className="error-message page-message">{error}</p>
      </main>
    );
  }

  return (
    <main className="booking-history-page">
      <div className="page-header">
        <h1>My Booking History</h1>
        <p>View your bookings and share your event experience.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h2>No bookings yet</h2>
          <p>
            You haven't booked any events yet. Explore events and find
            something you like.
          </p>
        </div>
      ) : (
        <div className="booking-history-grid">
          {bookings.map((booking) => {
            const event = events.find(
              (item) => item.id === booking.event_id
            );

            const eventHasEnded =
              event?.event_date &&
              !Number.isNaN(new Date(event.event_date).getTime()) &&
              new Date(event.event_date).getTime() <= Date.now();

            const canReview =
              booking.booking_status === "CONFIRMED" && eventHasEnded;

            const alreadyReviewed = reviewedEventIds.includes(
              Number(booking.event_id)
            );

            return (
              <article
                className="booking-history-card"
                key={booking.id}
              >
                <div className="booking-card-header">
                  <div>
                    <span className="booking-label">Booking</span>
                    <h2>#{booking.id}</h2>
                  </div>

                  <span
                    className={`booking-status ${(booking.booking_status || "").toLowerCase()}`}
                  >
                    {booking.booking_status}
                  </span>
                </div>

                <div className="booking-event-name">
                  <span>Event</span>
                  <strong>
                    {event ? event.title : `Event #${booking.event_id}`}
                  </strong>
                </div>

                {event?.event_date && (
                  <div className="booking-event-name">
                    <span>Event Date</span>
                    <strong>
                      {new Date(event.event_date).toLocaleString()}
                    </strong>
                  </div>
                )}

                <div className="booking-card-details">
                  <div>
                    <span>Tickets</span>
                    <strong>{booking.ticket_quantity}</strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong>
                      ₹
                      {Number(
                        booking.final_amount ?? booking.total_price
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>

                {canReview && alreadyReviewed && (
                  <div className="review-form">
                    <div className="review-form-heading">
                      <div className="review-heading-icon">✓</div>
                      <div>
                        <h3>Review Submitted</h3>
                        <p>You have already reviewed this event.</p>
                      </div>
                    </div>

                    {reviewMessages[booking.event_id] && (
                      <p className="success-message">
                        {reviewMessages[booking.event_id]}
                      </p>
                    )}
                  </div>
                )}

                {canReview && !alreadyReviewed && (
                  <section className="review-form">
                    <div className="review-form-heading">
                      <div className="review-heading-icon">★</div>
                      <div>
                        <h3>Review &amp; Rating</h3>
                        <p>How was your experience at this event?</p>
                      </div>
                    </div>

                    <div className="review-field">
                      <label htmlFor={`rating-${booking.id}`}>
                        Your rating
                      </label>

                      <select
                        id={`rating-${booking.id}`}
                        className="review-rating-select"
                        value={ratings[booking.event_id] || "5"}
                        onChange={(e) =>
                          setRatings((prev) => ({
                            ...prev,
                            [booking.event_id]: e.target.value,
                          }))
                        }
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>

                    <div className="review-field">
                      <label htmlFor={`review-${booking.id}`}>
                        Your review
                      </label>

                      <textarea
                        id={`review-${booking.id}`}
                        className="review-textarea"
                        value={reviewTexts[booking.event_id] || ""}
                        onChange={(e) =>
                          setReviewTexts((prev) => ({
                            ...prev,
                            [booking.event_id]: e.target.value,
                          }))
                        }
                        placeholder="Share your experience (at least 3 characters)"
                        minLength={3}
                        maxLength={2000}
                        rows={4}
                      />

                      <span className="review-character-hint">
                        Minimum 3 characters
                      </span>
                    </div>

                    {reviewErrors[booking.event_id] && (
                      <p className="error-message">
                        {reviewErrors[booking.event_id]}
                      </p>
                    )}

                    {reviewMessages[booking.event_id] && (
                      <p className="success-message">
                        {reviewMessages[booking.event_id]}
                      </p>
                    )}

                    <button
                      type="button"
                      className="review-submit-button"
                      disabled={!!submitting[booking.event_id]}
                      onClick={() =>
                        handleReviewSubmit(booking.event_id)
                      }
                    >
                      {submitting[booking.event_id]
                        ? "Submitting..."
                        : "Submit Review"}
                    </button>
                  </section>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default BookingHistory;