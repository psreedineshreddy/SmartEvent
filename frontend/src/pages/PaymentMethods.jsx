
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import { useBooking } from "../context/BookingContext";

function PaymentMethods() {
  const navigate = useNavigate();
  const { booking, saveBooking } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState({
    upiId: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bank: "",
  });

  if (!booking?.booking || !booking?.event) {
    return (
      <main className="confirmation-page">
        <div className="confirmation-card">
          <h1>Payment Session Unavailable</h1>
          <p className="confirmation-message">
            Please select an event and start your booking again.
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
  const amount = Number(
    bookingData.final_amount ?? bookingData.total_price ?? 0
  );

  const methods = [
    {
      value: "UPI",
      title: "UPI",
      description: "Google Pay, PhonePe, Paytm",
      icon: "📱",
    },
    {
      value: "CARD",
      title: "Credit / Debit Card",
      description: "Visa, Mastercard, RuPay",
      icon: "💳",
    },
    {
      value: "NET_BANKING",
      title: "Net Banking",
      description: "Pay through your bank",
      icon: "🏦",
    },
  ];

  const updateDetail = (field, value) => {
    setDetails((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  };

  const validateDetails = () => {
    if (paymentMethod === "UPI") {
      const upiPattern = /^[\w.-]+@[\w.-]+$/;
      if (!upiPattern.test(details.upiId.trim())) {
        return "Enter a valid demo UPI ID, for example name@bank.";
      }
    }

    if (paymentMethod === "CARD") {
      if (!details.cardName.trim()) {
        return "Enter the cardholder name.";
      }

      const digits = details.cardNumber.replace(/\s/g, "");
      if (!/^\d{16}$/.test(digits)) {
        return "Enter a 16-digit demo card number.";
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.expiry)) {
        return "Enter expiry in MM/YY format.";
      }

      const [month, year] = details.expiry.split("/").map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (
        year < currentYear ||
        (year === currentYear && month < currentMonth)
      ) {
        return "The expiry date must be in the future.";
      }

      if (!/^\d{3,4}$/.test(details.cvv)) {
        return "Enter a 3 or 4-digit demo CVV.";
      }
    }

    if (paymentMethod === "NET_BANKING" && !details.bank) {
      return "Select a bank to continue.";
    }

    return "";
  };

  const handlePayment = async (simulateFailure = false) => {
    const validationError = validateDetails();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setProcessing(true);
      setError("");

      // Demo payment details are deliberately not sent to the backend.
      const response = await api.post("/payments/", {
  booking_id: bookingData.id,
  payment_method: paymentMethod,
  simulate_failure: simulateFailure,
});

      saveBooking({
        ...booking,
        payment: response.data,
        paymentError: null,
        booking: {
          ...bookingData,
          booking_status:
            response.data.payment_status === "SUCCESS"
              ? "CONFIRMED"
              : "FAILED",
        },
      });

      navigate("/booking-confirmation");
    
} catch (err) {
  const detail = err.response?.data?.detail;

  setError(
    typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => item.msg || "Invalid input").join(", ")
        : "Payment could not be processed. Please try again."
  );
} finally {
  setProcessing(false);
}
  };

  return (
    <main className="confirmation-page payment-page">
      <div className="payment-layout">
        <section className="confirmation-card payment-checkout-card">
          <div className="payment-page-header">
            <span className="payment-step-label">STEP 3 OF 3</span>
            <h1>Complete your payment</h1>
            <p className="confirmation-message">
              Choose a payment method for {event.title}.
            </p>
          </div>
          <section className="payment-method-section">
            <h2>Select payment method</h2>

            <div className="payment-method-list">
              {methods.map((method) => (
                <label
                  key={method.value}
                  className={`payment-method-option ${
                    paymentMethod === method.value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => {
                      setPaymentMethod(method.value);
                      setError("");
                    }}
                    disabled={processing}
                  />

                  <span className="payment-method-icon">{method.icon}</span>

                  <span className="payment-method-text">
                    <strong>{method.title}</strong>
                    <small>{method.description}</small>
                  </span>

                  <span className="payment-method-check">
                    {paymentMethod === method.value ? "✓" : ""}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="payment-details-panel">
            {paymentMethod === "UPI" && (
              <div className="payment-form-section">
                <h2>Pay with UPI</h2>
                <p>Enter a sample UPI ID to continue the demo checkout.</p>

                <label htmlFor="upi-id">UPI ID</label>
                <input
                  id="upi-id"
                  type="text"
                  autoComplete="off"
                  placeholder="yourname@bank"
                  value={details.upiId}
                  onChange={(e) => updateDetail("upiId", e.target.value)}
                  disabled={processing}
                />

                <div className="payment-provider-hint">
                  Popular apps: Google Pay · PhonePe · Paytm
                </div>
              </div>
            )}

            {paymentMethod === "CARD" && (
              <div className="payment-form-section">
                <h2>Card details</h2>
                <p>Enter sample card details. Do not use a real card.</p>

                <label htmlFor="card-name">Cardholder name</label>
                <input
                  id="card-name"
                  type="text"
                  autoComplete="off"
                  placeholder="Name on card"
                  value={details.cardName}
                  onChange={(e) => updateDetail("cardName", e.target.value)}
                  disabled={processing}
                />

                <label htmlFor="card-number">Card number</label>
                <input
                  id="card-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={details.cardNumber}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 16);
                    updateDetail(
                      "cardNumber",
                      digits.replace(/(\d{4})(?=\d)/g, "$1 ")
                    );
                  }}
                  disabled={processing}
                />

                <div className="payment-card-fields">
                  <div>
                    <label htmlFor="card-expiry">Expiry date</label>
                    <input
                      id="card-expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={details.expiry}
                      onChange={(e) => {
                        const digits = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        const formatted =
                          digits.length > 2
                            ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                            : digits;
                        updateDetail("expiry", formatted);
                      }}
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label htmlFor="card-cvv">CVV</label>
                    <input
                      id="card-cvv"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="•••"
                      maxLength={4}
                      value={details.cvv}
                      onChange={(e) =>
                        updateDetail(
                          "cvv",
                          e.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      disabled={processing}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "NET_BANKING" && (
              <div className="payment-form-section">
                <h2>Net Banking</h2>
                <p>Select a bank for the simulated payment.</p>

                <label htmlFor="bank-name">Choose your bank</label>
                <select
                  id="bank-name"
                  value={details.bank}
                  onChange={(e) => updateDetail("bank", e.target.value)}
                  disabled={processing}
                >
                  <option value="">Select a bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                  <option value="OTHER">Other bank</option>
                </select>

                <div className="payment-provider-hint">
                  In a live checkout, you would be redirected to your bank's
                  secure payment page.
                </div>
              </div>
            )}
          </section>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="confirmation-actions payment-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => handlePayment(false)}
              disabled={processing}
            >
              {processing ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => handlePayment(true)}
              disabled={processing}
            >
              Test Payment Failure
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/payment-checkout")}
              disabled={processing}
            >
              Back to Booking
            </button>
          </div>
        </section>

        <aside className="confirmation-card payment-order-summary">
          <span className="payment-step-label">YOUR ORDER</span>
          <h2>Booking summary</h2>

          <div className="payment-event-summary">
            {event.banner_image && (
              <img src={event.banner_image} alt={event.title} />
            )}
            <div>
              <strong>{event.title}</strong>
              <small>
                {event.location}
              </small>
            </div>
          </div>

          <div className="payment-summary-row">
            <span>Booking reference</span>
            <strong>#{bookingData.id}</strong>
          </div>

          <div className="payment-summary-row">
            <span>Tickets</span>
            <strong>{bookingData.ticket_quantity}</strong>
          </div>

          <div className="payment-summary-row">
            <span>Subtotal</span>
            <strong>
              ₹{Number(bookingData.total_price ?? amount).toFixed(2)}
            </strong>
          </div>

          {Number(bookingData.discount_amount ?? 0) > 0 && (
            <div className="payment-summary-row payment-discount-row">
              <span>Coupon discount</span>
              <strong>
                −₹{Number(bookingData.discount_amount).toFixed(2)}
              </strong>
            </div>
          )}

          <div className="payment-summary-total">
            <span>Total payable</span>
            <strong>₹{amount.toFixed(2)}</strong>
          </div>

          <p className="payment-disclaimer">
            Demo checkout only. No real payment details are collected and no
            money will be charged.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default PaymentMethods;
