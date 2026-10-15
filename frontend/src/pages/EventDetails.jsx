import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";

function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { saveBooking } = useBooking();
  const { role } = useAuth();

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");

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

  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState("");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementPosting, setAnnouncementPosting] = useState(false);
  const [announcementPostError, setAnnouncementPostError] = useState("");
  const [announcementPostSuccess, setAnnouncementPostSuccess] = useState("");

  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);
  const [announcementDeleteError, setAnnouncementDeleteError] = useState("");

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnouncementPostError("");
    setAnnouncementPostSuccess("");

    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      setAnnouncementPostError("Please enter both a title and message.");
      return;
    }

    setAnnouncementPosting(true);

    try {
      const response = await api.post(`/announcements/${eventId}`, {
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
      });

      setAnnouncements((previous) => [response.data, ...previous]);
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      setAnnouncementPostSuccess("Announcement posted successfully!");
    } catch (err) {
      setAnnouncementPostError(
        err.response?.data?.detail || "Unable to post announcement."
      );
    } finally {
      setAnnouncementPosting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcement) => {
    const confirmed = window.confirm(
      `Delete the announcement "${announcement.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingAnnouncementId(announcement.id);
    setAnnouncementDeleteError("");

    try {
      await api.delete(`/announcements/item/${announcement.id}`);

      setAnnouncements((previous) =>
        previous.filter((item) => item.id !== announcement.id)
      );
    } catch (err) {
      setAnnouncementDeleteError(
        err.response?.data?.detail || "Unable to delete announcement."
      );
    } finally {
      setDeletingAnnouncementId(null);
    }
  };

  const total = event ? event.ticket_price * quantity : 0;
  const finalTotal = coupon ? coupon.final_amount : total;

  // Load event details.
  useEffect(() => {
    let cancelled = false;

    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        if (!cancelled) setEvent(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || "Unable to load event.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvent();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Check whether this event is already saved.
  useEffect(() => {
    let cancelled = false;

    const checkWishlist = async () => {
      try {
        const response = await api.get("/wishlist/");
        const savedEvents = Array.isArray(response.data) ? response.data : [];

        if (!cancelled) {
          setIsSaved(
            savedEvents.some((item) => Number(item.id) === Number(eventId))
          );
        }
      } catch (err) {
        console.error("Unable to check wishlist:", err);
      }
    };

    checkWishlist();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Add or remove the event from the wishlist.
  const handleToggleWishlist = async () => {
    if (wishlistLoading) return;

    setWishlistLoading(true);
    setWishlistMessage("");

    try {
      if (isSaved) {
        await api.delete(`/wishlist/${eventId}`);
        setIsSaved(false);
        setWishlistMessage("Removed from saved events.");
      } else {
        await api.post(`/wishlist/${eventId}`);
        setIsSaved(true);
        setWishlistMessage("Added to saved events.");
      }
    } catch (err) {
      setWishlistMessage(
        err.response?.data?.detail || "Unable to update saved events."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // Receive real-time ticket availability updates.
  useEffect(() => {
    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/events/${eventId}/availability`
    );

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);

        if (
          data.type === "availability_update" &&
          Number(data.event_id) === Number(eventId)
        ) {
          setEvent((previousEvent) => {
            if (!previousEvent) return previousEvent;

            return {
              ...previousEvent,
              available_tickets: Number(data.available_tickets),
            };
          });
        }
      } catch {
        // Ignore invalid WebSocket messages.
      }
    };

    socket.onerror = () => {
      console.error("Unable to connect to live ticket availability.");
    };

    return () => socket.close();
  }, [eventId]);

  // Keep the selected quantity valid when availability changes.
  useEffect(() => {
    if (!event) return;

    const available = Number(event.available_tickets);

    if (available <= 0) {
      if (quantity !== 1) setQuantity(1);

      if (coupon) {
        setCoupon(null);
        setCouponMessage("");
      }
      return;
    }

    if (quantity > available) {
      setQuantity(available);
      setCoupon(null);
      setCouponMessage("");
    }
  }, [event?.available_tickets, event, quantity, coupon]);

  // Load announcements for this event.
  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      setAnnouncementsLoading(true);
      setAnnouncementsError("");

      try {
        const response = await api.get(`/announcements/${eventId}`);
        if (!cancelled) {
          setAnnouncements(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setAnnouncementsError(
            err.response?.data?.detail ||
              "Unable to load announcements right now."
          );
        }
      } finally {
        if (!cancelled) setAnnouncementsLoading(false);
      }
    };

    fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Load event reviews.
  useEffect(() => {
    let cancelled = false;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      setReviewsError("");

      try {
        const response = await api.get(`/reviews/event/${eventId}`);
        if (!cancelled) setReviewData(response.data);
      } catch {
        if (!cancelled) {
          setReviewsError("Unable to load reviews right now.");
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
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
    if (!event || event.available_tickets <= 0) {
      setError("This event is sold out.");
      return;
    }

    if (quantity > event.available_tickets) {
      setError("Not enough tickets available. Please select a lower quantity.");
      return;
    }

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

      const bookingResponse = await api.post("/bookings/", bookingPayload);

      saveBooking({
        booking: bookingResponse.data,
        event,
        payment: null,
        paymentError: null,
      });

      navigate("/payment-checkout");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Booking failed. Please try again."
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

  const availableTickets = Number(event.available_tickets);
  const soldOut = availableTickets <= 0;

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
            <div className="event-title-row">
              <div>
                <span className="event-category">{event.category}</span>
                <h1>{event.title}</h1>
              </div>

              <button
                type="button"
                className={`wishlist-button ${isSaved ? "is-saved" : ""}`}
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading
                  ? "Updating..."
                  : isSaved
                    ? "♥ Saved"
                    : "♡ Save to Wishlist"}
              </button>
            </div>

            {wishlistMessage && (
              <p role="status" className="wishlist-message">
                {wishlistMessage}
              </p>
            )}

            <p className="event-details-description">{event.description}</p>

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
                  {soldOut
                    ? "Sold Out"
                    : `${availableTickets} tickets available`}
                  <small>Live availability</small>
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
            <label htmlFor="ticket-quantity">Number of Tickets</label>
            <select
              id="ticket-quantity"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              disabled={booking || soldOut}
            >
              {Array.from(
                { length: Math.min(availableTickets, 10) },
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
                disabled={booking || soldOut}
              />

              <button
                type="button"
                className="coupon-apply-button"
                onClick={handleApplyCoupon}
                disabled={booking || soldOut}
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
                  {coupon ? "Discount applied" : "Including ticket charges"}
                </small>
              </div>
              <strong>₹{Number(finalTotal).toFixed(2)}</strong>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="primary-button"
            onClick={handleBooking}
            disabled={booking || soldOut || quantity > availableTickets}
          >
            {soldOut
              ? "Sold Out"
              : booking
                ? "Creating Booking..."
                : "Book & Pay"}
          </button>
        </aside>
      </div>

      <section className="event-announcements-section">
        <div className="event-announcements-heading">
          <div>
            <h2>📢 Event Announcements</h2>
            <p>Latest updates from the event organizer.</p>
          </div>
        </div>

        {(role === "ORGANIZER" || role === "ADMIN") && (
          <form
            className="announcement-post-form"
            onSubmit={handleAnnouncementSubmit}
          >
            <h3>Post an Announcement</h3>

            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="Announcement title"
              maxLength={200}
              required
            />

            <textarea
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              placeholder="Write an update for attendees..."
              rows={4}
              maxLength={10000}
              required
            />

            {announcementPostError && (
              <p className="error-message">{announcementPostError}</p>
            )}
            <button type="submit" disabled={announcementPosting}>
              {announcementPosting ? "Posting..." : "Post Announcement"}
            </button>
          </form>
        )}

        {announcementDeleteError && (
          <p role="alert" className="error-message">
            {announcementDeleteError}
          </p>
        )}

        {announcementsLoading ? (
          <p className="status-message">Loading announcements...</p>
        ) : announcementsError ? (
          <p className="error-message">{announcementsError}</p>
        ) : announcements.length === 0 ? (
          <p className="status-message">
            No announcements have been posted for this event yet.
          </p>
        ) : (
          <div className="event-announcements-list">
            {announcements.map((announcement) => (
              <article
                className="event-announcement-card"
                key={announcement.id}
              >
                <h3>{announcement.title}</h3>
                <p>{announcement.message}</p>
                <time dateTime={announcement.created_at}>
                  {new Date(announcement.created_at).toLocaleString()}
                </time>

                {(role === "ORGANIZER" || role === "ADMIN") && (
                  <button
                    type="button"
                    className="announcement-delete-button"
                    onClick={() => handleDeleteAnnouncement(announcement)}
                    disabled={deletingAnnouncementId === announcement.id}
                  >
                    {deletingAnnouncementId === announcement.id
                      ? "Deleting..."
                      : "Delete Announcement"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

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
            No reviews yet. Be the first to share your experience after
            attending!
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
