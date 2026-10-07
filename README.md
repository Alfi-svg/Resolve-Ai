# UPAY RESOLVEAI
> **"Understand. Investigate. Resolve."**

An AI-powered transaction investigation and financial risk detection intelligence layer designed for modern Bangladeshi Mobile Financial Services (Upay).

---

## 🏛️ System Architecture

```text
                        UPAY RESOLVEAI
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
         USER PANEL                       ADMIN PANEL
              │                               │
              │                    ┌──────────┴──────────┐
              │                    │                     │
              ▼                    ▼                     ▼
         ResolveAI            ResolveAI Console      Risk Guard
              │                    │                     │
              └────────────────────┼─────────────────────┘
                                   ▼
                           RESOLVEAI ENGINE
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      Transaction             AI Analysis           Risk Engine
       Detective                  │                     │
             │                    │                     │
             ▼                    ▼                     ▼
         Evidence            Root Cause           Fraud Signals
         Timeline             Policy RAG            Risk Score
         Events               AI Reasoning        Risk Explanation
             │                    │                     │
             └────────────────────┼─────────────────────┘
                                  ▼
                           Recommendation
                                  │
                                  ▼
                           Human Approval
                                  │
                                  ▼
                             Resolution
                                  │
                                  ▼
                              Feedback
```

---

## 🚀 Two Flagship AI Capabilities

1. **RESOLVEAI**: Autonomous multi-stage transaction investigation, root cause diagnosis, regulatory policy RAG, and resolution recommendations.
2. **RISK GUARD**: Proactive transaction surveillance, mule account detection, rapid velocity checks, and anomaly scoring.

### 7-Step Transparent AI Reasoning Pipeline
Every AI investigation step exposes:
- **Status** (Completed / In-Progress / Warning)
- **Evidence** (Audit logs, raw switch responses, IP/device metadata)
- **Confidence** (Forensic confidence rating 0–100%)
- **Explanation** (Technical diagnostic rationale)
- **Result** (Automated refund, hold, or human escalation recommendation)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend**: FastAPI (Python 3.14), SQLAlchemy 2.0 (Async), PostgreSQL / SQLite seamless dual-engine, Pydantic v2
- **AI Engine**: Deterministic synthetic intelligent analysis (`DEMO_AI_MODE=true`) simulating realistic Bangladesh Bank BFIU policy matching & fraud scoring.

---

## 📦 Project Structure

```text
├── frontend/
│   ├── app/                 # Next.js App router (layout, globals.css, pages)
│   ├── components/
│   │   ├── shared/          # Navbar, AI reasoning timeline visual language
│   │   └── ui/              # Button, Card, Badge, Inputs
│   ├── features/            # Feature modules (ResolveAI, Risk Guard, Admin)
│   ├── lib/                 # API Client, formatting helpers
│   ├── types/               # TypeScript interfaces
│   └── hooks/               # Custom hooks
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints: health, transactions, resolveai, risk-guard
│   │   ├── core/            # Config, settings
│   │   ├── db/              # SQLAlchemy async session & health checks
│   │   ├── models/          # User, Transaction, Dispute, RiskCase
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── ai/          # Base AI service abstraction
│   │   │   ├── resolveai/   # 7-step ResolveAI investigation orchestrator
│   │   │   ├── risk_guard/  # Fraud detection and risk scoring engine
│   │   │   ├── evidence/    # Transaction Detective & timeline synthesizer
│   │   │   └── policy/      # Policy RAG matching (BFIU / Upay regulations)
│   │   ├── repositories/    # Base database queries
│   │   └── seed/            # Realistic synthetic MFS seed data
│   ├── main.py              # FastAPI application entrypoint
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment config
└── README.md
```

---

## 🏃 Quickstart

### 1. Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/v1/health`

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`
