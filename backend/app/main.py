from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api import auth, documents, chat, subscriptions, reminders, agent, family, digest

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ClarityHub AI — Personal Life-Admin Copilot API"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(subscriptions.router)
app.include_router(reminders.router)
app.include_router(agent.router)
app.include_router(family.router)
app.include_router(digest.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/me", response_model=auth.UserOut)
def get_me(current_user: auth.User = auth.Depends(auth.get_current_user)):
    return current_user

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER
    }

