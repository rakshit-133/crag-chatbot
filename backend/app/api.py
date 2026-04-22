import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .main import run_crag_pipeline

app = FastAPI(title="CRAG Chatbot API")

# Allow frontend dev server
# Allow frontend dev server and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Opens CORS for production. You can restrict this to your Vercel URL later.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat")
def chat(req: ChatRequest):
    """
    Streams the CRAG pipeline as Server-Sent Events.
    Each event is a JSON object on its own line, prefixed with `data: `.
    """

    def event_stream():
        try:
            for event in run_crag_pipeline(req.query):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        # Signal the client that the stream is done
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
