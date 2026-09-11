<<<<<<< HEAD
# ClarityHub-ai
=======
# ClarityHub AI — Personal Life-Admin Copilot
### Week 4 Capstone Project — Innovation Hacks AI Internship 2026

**ClarityHub AI** is a production-grade full-stack personal life-admin copilot designed to eliminate quiet financial bleed and time wasted on forgotten subscriptions, dense insurance contracts, expiring warranties, and missed medication refills.

---

## 🌟 Key Capabilities

1. **Smart Assistant & RAG Q&A**: Upload dense bills, insurance policies, rental contracts, and prescriptions. Ask natural language Q&A and receive answers grounded strictly in your documents with expandable **inline source citations**.
2. **Dark-Pattern Subscription Detector**: Automatically flags recurring subscriptions with hidden cancellation flows, recent silent price hikes, or low utilization.
3. **Human-in-the-Loop Automation Agent**: Scans your vault and subscriptions, detects issues, and populates an **Awaiting Approval** action queue. Approving a draft action opens your local mail client (`mailto:` link) pre-filled with cancellation or negotiation letters — **nothing is ever sent automatically without a manual click**.
4. **Weekly "Life Digest"**: An AI-generated summary of upcoming renewals, price changes, and annual waste estimates.
5. **Family Shared Vault Mode**: Grant explicit, auditable vault access to family members or elderly parents for caregiving.
6. **Accessibility-First Design**: Native Text-to-Speech (TTS) audio reading of summaries, Web Speech voice input for Q&A, and high-contrast styling (WCAG AA compliant).

---

## 🛠️ Tech Stack & Design Rationale

- **Frontend**: Next.js 14 (React) + TypeScript + Tailwind CSS
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Alembic
- **Database**: PostgreSQL (via `pgvector` container) with zero-config SQLite vector fallback for local development.
- **Provider-Agnostic LLM Adapter**: Supports **Google Gemini**, **OpenAI**, **Anthropic**, and a built-in offline **Mock engine** via `LLM_PROVIDER` environment variable.
- **Orchestrator Choice Rationale**: Built with a lightweight custom Python RAG and Agent pipeline rather than heavy frameworks to maintain 100% deterministic control over vector scoring, inline document citations, and row-level family security scoping without framework overhead.

---

## 📁 Repository Structure

```
clarityhub-ai/
├── backend/
│   ├── app/
│   │   ├── api/            # Route modules (auth, documents, chat, subscriptions, agent, family, digest)
│   │   ├── core/           # Config, Security (bcrypt/JWT), Database, LLM Adapter
│   │   ├── models/         # SQLAlchemy ORM models (User, Document, DocumentChunk, Subscription, etc.)
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── rag/            # Extraction, Sliding-Window Chunker, Embedder, Vector Store
│   │   ├── agent/          # Automation Agent loop, Dark Pattern Detector, Life Digest
│   │   └── main.py
│   ├── tests/              # Pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/                # Next.js App Router (Dashboard, Vault, Chat, Subscriptions, Agent Queue, Family, Settings)
│   ├── components/         # UI components (Navbar, TTSPlayer, VoiceInput, CitationChip)
│   ├── lib/                # API client, Auth Context, A11y Context
│   └── Dockerfile
├── docker-compose.yml      # Container orchestration
├── .github/workflows/ci.yml # GitHub Actions CI workflow
├── docs/
│   └── architecture-diagram.md
├── .env.example
└── README.md
```

---

## 🚀 Quick Start Guide

### Option 1: Run via Docker Compose (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your `GEMINI_API_KEY` (or set `LLM_PROVIDER=mock` for testing without API keys).
3. Start all services:
   ```bash
   docker-compose up --build
   ```
4. Access the web app:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Run Locally (Dev Mode)

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Verification & Testing

Run backend unit and integration tests:
```bash
cd backend
pytest tests/
```

---

## 🎬 Demo Walkthrough Script

1. **Sign Up / Log In**: Register a new vault account at `/signup`.
2. **Upload Document to Vault**: Go to `/vault` and upload a sample bill or warranty document. Inspect the auto-generated executive summary and click **Listen (TTS)** to test text-to-speech audio reading.
3. **Ask Grounded Q&A**: Navigate to `/chat`. Ask a question about your uploaded document. Observe the grounded response with an expandable **Source Citation Chip**. Try the **Voice Input** button for hands-free Q&A.
4. **Track Subscriptions**: Visit `/subscriptions` to view price hike flags and cancellation difficulty levels.
5. **Run Automation Agent**: Go to `/dashboard` and click **Run 'Scan My Life'**.
6. **Approve Agent Action**: Navigate to `/agent-actions`. Review the pending action reasoning. Click **Approve & Launch Draft** to launch your local mail client pre-filled with the drafted email (`mailto:` handoff).
7. **Generate Weekly Life Digest**: View your personalized AI summary on the Dashboard.
>>>>>>> f4d5999 (initail commit)
