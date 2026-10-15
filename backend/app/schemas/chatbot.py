from pydantic import BaseModel, Field


class ChatbotRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    history: list[dict[str, str]] = Field(default_factory=list, max_length=10)


class ChatbotResponse(BaseModel):
    reply: str
    suggestions: list[str] = Field(default_factory=list)
