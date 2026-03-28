from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_products import router as products_router
from app.api.routes_orders import router as orders_router
from app.api.routes_sketch import router as sketch_router
from app.api.routes_admin import router as admin_router

app = FastAPI(title="ToyShop API")

ALLOWED_ORIGINS = [
    "https://app.syluna.ru",
    "https://api.syluna.ru",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-TG-INIT-DATA",
        "X-DEV-USER-ID",
    ],
)

@app.get("/health")
async def health():
    return {"ok": True}

app.include_router(products_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(sketch_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
