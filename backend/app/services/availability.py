from fastapi import WebSocket
import asyncio
import json


class AvailabilityManager:
    def __init__(self):
        self.connections: dict[int, set[WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def connect(self, event_id: int, websocket: WebSocket):
        await websocket.accept()

        async with self.lock:
            self.connections.setdefault(event_id, set()).add(websocket)

    async def disconnect(self, event_id: int, websocket: WebSocket):
        async with self.lock:
            clients = self.connections.get(event_id, set())
            clients.discard(websocket)

            if not clients:
                self.connections.pop(event_id, None)

    async def broadcast(self, event_id: int, available_tickets: int):
        message = json.dumps({
            "type": "availability_update",
            "event_id": event_id,
            "available_tickets": available_tickets,
        })

        async with self.lock:
            clients = list(self.connections.get(event_id, set()))

        disconnected = []

        for websocket in clients:
            try:
                await websocket.send_text(message)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            await self.disconnect(event_id, websocket)


availability_manager = AvailabilityManager()
