const SERVER_URL = "http://127.0.0.1:8000";

function TicketCard({ ticket, eventName, displayNumber }) {
  const qrUrl = `${SERVER_URL}${ticket.qr_code_url}`;

  const downloadQr = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${ticket.ticket_code}.png`;
    link.click();
  };

  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <h2>My Ticket</h2>
        <span>#{displayNumber}</span>
      </div>

      <div className="ticket-event-name">
        <span>Event</span>
        <strong>{eventName}</strong>
      </div>

      <div className="ticket-code">
        <span>Ticket Code</span>
        <strong>{ticket.ticket_code}</strong>
      </div>

      <div className="qr-container">
        <img
          src={qrUrl}
          alt={`QR code for ticket ${ticket.ticket_code}`}
        />
      </div>

      <p className="ticket-created">
        Created:{" "}
        {new Date(ticket.created_at).toLocaleString()}
      </p>

      <button
        className="primary-button"
        onClick={downloadQr}
      >
        Download QR
      </button>
    </div>
  );
}

export default TicketCard;