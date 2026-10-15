import os

from dotenv import load_dotenv
from google import genai

load_dotenv(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../.env")
    )
)

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None


SYSTEM_INSTRUCTIONS = """
You are the SmartEvent chatbot assistant.

Help users with:
- Discovering and recommending events.
- Music, technology, sports, business, and cultural events.
- Booking guidance and ticket-related questions.
- FAQs and navigation around the SmartEvent application.

Use the supplied event and booking context when answering.
Never invent event availability, prices, booking records, or confirmations.
If the supplied context does not contain the answer, say so clearly.
Never claim that you created, changed, cancelled, or paid for a booking.
Guide users to the appropriate SmartEvent page when an action is required.
Keep responses friendly, concise, and useful.
"""


def generate_chatbot_reply(
    message: str,
    events: list[dict],
    bookings: list[dict],
    history: list[dict[str, str]],
) -> str:
    if client is None:
        raise RuntimeError("Gemini API key is not configured.")

    prompt = f"""
{SYSTEM_INSTRUCTIONS}

Available event information:
{events}

Bookings belonging to the authenticated user:
{bookings}

Recent conversation:
{history}

User's latest message:
{message}

Respond based on the supplied information and the user's question.
"""

    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest"),
        contents=prompt,
    )

    reply = getattr(response, "text", None)

    if not reply:
        raise RuntimeError("The AI service returned an empty response.")

    return reply.strip()
