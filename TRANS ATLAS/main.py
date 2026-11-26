from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import HTTPException, Response
from completed_documents import render

BASE = Path(__file__).parent
app = FastAPI(title="LOGIFLOW", description="Prototype de gestion transport et logistique")

@app.get("/assets/pieces/{filename}")
def completed_document(filename: str):
    try:
        content = render(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document introuvable")
    media = "application/pdf" if filename.endswith(".pdf") else "image/png"
    return Response(content, media_type=media, headers={"Cache-Control": "public, max-age=86400"})

app.mount("/assets", StaticFiles(directory=BASE / "assets"), name="assets")

@app.get("/api/health")
def health():
    return {"status": "ok", "application": "LOGIFLOW", "mode": "demo"}

@app.get("/api/summary")
def summary():
    return {"shipments": 1248, "in_transit": 86, "delivered": 1146, "delayed": 16,
            "offers": 24, "carriers": 48, "revenue_mad": 842500,
            "unpaid_mad": 124800, "open_disputes": 3}

@app.get("/")
def index():
    return FileResponse(BASE / "index.html")
