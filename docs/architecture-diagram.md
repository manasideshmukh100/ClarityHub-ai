# ClarityHub AI — System Architecture & Workflow Diagram

```mermaid
flowchart TD
    User([User / Family Caregiver]) -->|Upload Document / Ask Question| NextFS[Next.js App Router Frontend]
    User -->|Voice Input / Listen TTS| Accessibility[A11y Context + Web Speech API]

    subgraph Frontend [Frontend Layer (Next.js + TypeScript + Tailwind)]
        NextFS --> AuthCtx[Auth Context & JWT Storage]
        NextFS --> DashUI[Dashboard / Digest Summary]
        NextFS --> VaultUI[Vault UI + Audio Reader]
        NextFS --> ChatUI[Smart Q&A + Citation Chips]
        NextFS --> QueueUI[Agent Action Approval Queue]
    end

    QueueUI -->|One-click Approval| MailClient[Local Mail Client (mailto: Pre-fill)]

    NextFS -->|REST / JSON APIs| FastAPI[FastAPI Backend Engine]

    subgraph Backend [Backend Layer (Python / FastAPI)]
        FastAPI --> AuthAPI[JWT Auth & Row-Level Security]
        FastAPI --> DocRAG[RAG Engine & Extractor]
        FastAPI --> AgentEngine[Automation Agent reasoning loop]
        
        DocRAG --> Chunker[Sliding Window Chunker (~500t / 50ov)]
        DocRAG --> Embedder[Vector Hashing & Similarity Store]

        AgentEngine --> DarkPattern[Dark Pattern & Price Hike Scanner]
        AgentEngine --> DigestGen[Weekly Life Digest Generator]
    end

    Backend -->|Provider-Agnostic LLM Adapter| LLMProvider{LLM Provider Selection}
    LLMProvider -->|LLM_PROVIDER=gemini| GeminiAPI[Google Gemini 1.5 Flash]
    LLMProvider -->|LLM_PROVIDER=openai| OpenAIAPI[OpenAI GPT-4o-mini]
    LLMProvider -->|LLM_PROVIDER=anthropic| AnthropicAPI[Claude 3 Haiku]
    LLMProvider -->|LLM_PROVIDER=mock| MockEngine[Built-in Zero-Config Engine]

    Backend -->|ORM Data Layer| PostgresDB[(PostgreSQL + pgvector / SQLite)]
    
    subgraph Data [Data Models]
        PostgresDB --> T1[(users)]
        PostgresDB --> T2[(family_links)]
        PostgresDB --> T3[(documents)]
        PostgresDB --> T4[(document_chunks)]
        PostgresDB --> T5[(subscriptions)]
        PostgresDB --> T6[(reminders)]
        PostgresDB --> T7[(agent_actions)]
        PostgresDB --> T8[(chat_messages)]
    end
```
