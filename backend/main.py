from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
import json
import os
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        path = request.url.path
        if path.startswith("/heroes/") or path.startswith("/assets/"):
            response.headers["Cache-Control"] = "public, max-age=604800"
        return response


app.add_middleware(CacheMiddleware)

DATA_FILE = os.path.join(os.path.dirname(__file__), "assignments.json")
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "dist")

HEROES = [
    "hulk", "loki", "thanos", "iron_man", "spider_man",
    "doctor_strange", "thor", "wolverine", "groot",
    "star_lord", "vision", "black_panther"
]


def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    shuffled = HEROES.copy()
    random.shuffle(shuffled)
    data = {"order": shuffled, "assignments": {}}
    save_data(data)
    return data


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


class RegisterRequest(BaseModel):
    name: str


@app.post("/api/register")
def register(req: RegisterRequest):
    name = req.name.strip()
    name_key = name.lower()

    if not name_key:
        raise HTTPException(status_code=400, detail="Имя обязательно!")

    data = load_data()

    if name_key in data["assignments"]:
        return {
            "hero": data["assignments"][name_key],
            "already_assigned": True,
            "name": name
        }

    assigned_heroes = set(data["assignments"].values())
    available = [h for h in data["order"] if h not in assigned_heroes]

    if not available:
        raise HTTPException(
            status_code=400,
            detail="Все герои уже распределены! Обратитесь к организаторам."
        )

    hero = available[0]
    data["assignments"][name_key] = hero
    save_data(data)

    return {
        "hero": hero,
        "already_assigned": False,
        "name": name
    }


@app.get("/api/status")
def status():
    data = load_data()
    return {
        "total": len(HEROES),
        "assigned": len(data["assignments"]),
        "remaining": len(HEROES) - len(data["assignments"]),
        "assignments": data["assignments"]
    }


@app.post("/api/reset")
def reset():
    shuffled = HEROES.copy()
    random.shuffle(shuffled)
    data = {"order": shuffled, "assignments": {}}
    save_data(data)
    return {"message": "Все назначения сброшены", "new_order": shuffled}


# Serve React static files in production
if os.path.isdir(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")
    app.mount("/heroes", StaticFiles(directory=os.path.join(DIST_DIR, "heroes")), name="heroes")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
