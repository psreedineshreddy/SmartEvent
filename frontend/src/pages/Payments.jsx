import { useEffect, useState } from "react";
import api from "../api/axios";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get("/payments/my-payments");
        setPayments(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load payment history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <p className="status-message">Loading payment history...</p>;
  }

  return (
    <main className="page-container payments-page">
      <div className="page-header">
        <h1>My Payments</h1>
        <p>View your payment transactions and their status.</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      {!error && payments.length === 0 && (
        <div className="empty-state">
          <h2>No payments yet</h2>
          <p>Your completed and failed payment transactions will appear here.</p>
        </div>
      )}

      {payments.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Booking ID</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.transaction_id || "—"}</td>
                  <td>#{payment.booking_id}</td>
                  <td>{payment.payment_method}</td>
                  <td>₹{Number(payment.amount).toFixed(2)}</td>
                  <td>
                    <span
                      className={`payment-status ${
                        payment.payment_status === "SUCCESS"
                          ? "payment-success"
                          : "payment-failed"
                      }`}
                    >
                      {payment.payment_status}
                    </span>
                  </td>
                  <td>
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Payments;