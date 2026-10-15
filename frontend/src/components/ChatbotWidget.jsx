import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./ChatbotWidget.css";

const quickSuggestions = [
  "Trending events",
  "Show my bookings",
  "Suggest music events this weekend",
  "Help with ticket issues",
];

export default function ChatbotWidget() {
  const { isAuthenticated, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm your SmartEvent assistant. I can help you discover events, check your bookings, and answer ticket questions.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || role !== "USER") return null;

  const sendMessage = async (text = message) => {
    const content = text.trim();
    if (!content || loading) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const history = updatedMessages
        .slice(-10)
        .slice(0, -1)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }));

      const response = await api.post("/chatbot/chat", {
        message: content,
        history,
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.reply,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error.response?.data?.detail ||
            "Sorry, I couldn't connect right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <section className="chatbot-panel">
          <header className="chatbot-header">
            <div>
              <h3>SmartEvent Assistant</h3>
              <span>Ask me anything about your events 💬</span>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`chatbot-message ${item.role}`}
              >
                {item.content}
              </div>
            ))}

            {loading && (
              <div className="chatbot-message assistant">
                Thinking...
              </div>
            )}
          </div>

          <div className="chatbot-suggestions">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            className="chatbot-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about events or bookings..."
              maxLength={1000}
              aria-label="Message"
            />
            <button type="submit" disabled={loading || !message.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}
