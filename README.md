# UPAY ResolveAI

> **"Understand. Investigate. Resolve."**  
> *From transaction problem to explainable resolution.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.141-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_TypeScript-61DAFB.svg?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Hackathon MVP](https://img.shields.io/badge/Status-Hackathon_MVP-amber.svg)]()

---

## Why We Built This

Digital financial services (MFS) like Upay, bKash, and Rocket have transformed everyday commerce across Bangladesh. Every second, thousands of QR payments, Send Money transfers, and bill payments occur at tea stalls, cafes, supermarkets, and pharmacies.

Yet, distributed payment architectures are fundamentally asynchronous. When network connectivity jitters, switch sockets timeout, or bank aggregators lag, transactions enter an ambiguous "limbo" state. 

Customers are left stressed at a retail counter asking:  
*“Did my money go through? The merchant says they didn't receive it, but my wallet was debited!”*

Meanwhile, support agents are overwhelmed having to open 5 different terminal screens—ledger databases, payment gateway logs, SMS dispatch queues, and merchant clearing reports—just to piece together what occurred.

We built **UPAY ResolveAI** to bridge this gap: replacing anxiety and slow dispute tickets with instant, explainable, evidence-backed transaction resolution.

---

## The Problem

When a mobile transaction fails or stalls:
1. **Customer Blindness:** The customer only sees that balance was deducted. They don't know if the merchant will receive it, if they should scan again (risking double-debit), or when their money will return.
2. **Support Latency:** Human support specialists spend an average of 15 to 45 minutes manually cross-referencing ledger tables and clearing batches.
3. **Black-Box AI Skepticism:** Traditional chatbots either parrot generic FAQs or hallucinate promises of refunds without understanding real financial ledger state.
4. **Systemic Invisibility:** When a specific gateway node degrades (affecting 300+ transactions simultaneously), isolated customer complaints are treated as separate tickets rather than recognizing the root systemic cluster.

---

## Our Approach

ResolveAI introduces an **explainable financial intelligence layer** on top of the digital wallet ecosystem:

```
Customer Complaint (Bangla / Banglish / English)
                ↓
    AI Complaint Understanding
                ↓
    Smart Transaction Identification
                ↓
    Transaction Detective (Ledger Forensics)
                ↓
    Evidence Correlation (Multi-source Audit)
                ↓
    Root Cause Analysis (Zero Hallucination)
                ↓
    Policy / FAQ Intelligence (Simulated RAG)
                ↓
    Resolution Recommendation
                ↓
    Human-in-the-Loop Approval
                ↓
    Resolution & Batch Settlement Execution
```

**Core Principle:** AI investigates and explains; human specialists maintain fiduciary control. Irreversible financial actions are never executed by an autonomous black box.

---

## How AI Is Used

1. **Multilingual Intent & Entity Extraction:** Parses natural language complaints in everyday colloquial **Bangla** (`"ভাই, আমি QR দিয়ে ২০০০ টাকা pay করছিলাম..."`), **Banglish** (`"QR payment korechi, 2000 taka kete geche but merchant pay nai..."`), or English. It extracts transaction types, amounts, and urgency sentiment, and matches candidate ledger entries.
2. **Deterministic Root Cause Forensics:** Rather than asking an LLM to guess, ResolveAI’s diagnostic engine evaluates distributed transaction telemetry (TCP socket timeouts, two-phase commit phases, clearing batch receipts) to produce a mathematically grounded root cause with 92%+ certainty.
3. **Simulated Policy RAG Retrieval:** Matches incident forensics against Upay Service Policies and Bangladesh Bank PSD guidelines to cite exact operational turnaround times (SLAs) and mandatory reconciliation procedures.
4. **Agent Copilot Summarization:** Generates concise 2-sentence executive briefs so support agents can understand complex multi-system failures in under 5 seconds.
5. **Systemic Incident Clustering:** Correlates failures across time windows to detect when hundreds of merchants are impacted by the same degraded gateway switch.

---

## Core Features

- **Customer Wallet Dashboard:** Clean Upay-inspired interface displaying available balance (`৳24,580.00`), quick actions (Send Money, Add Money, Cash Out, Pay Bill, QR Pay), and real-time transaction activity.
- **AI Complaint Assistant:** Conversational intake with real-time analysis animation that converts unstructured complaints into structured financial telemetry.
- **Transaction Detective (Hero Feature):** Dedicated forensics hub providing:
  - High-level transaction metadata (`TXN-8F31A2`, ৳2,000 at ABC Cafe)
  - Evidence Engine with 5 verifiable telemetry cards (Core Ledger, PGW-East-02 Router, Clearing Engine, Telecom SMS)
  - Millisecond-precision Chronological Timeline (from 8:42:01 PM initiation to 8:42:14 PM gateway socket timeout)
  - Grounded AI Root Cause Analysis with expandable technical audit trail
  - Policy & Regulatory Intelligence card with cited SLA clauses
  - Prescriptive Resolution Recommendation with risk assessment
- **AI Support Copilot:** Dedicated back-office dashboard featuring live dispute queues, one-click decision controls (*Approve Resolution*, *Escalate*, *Request Info*), and AI-generated case summaries.
- **Incident Intelligence:** System-level topology graph linking 341 affected customers, transactions, and 82 merchants directly to a single degraded gateway (`PGW-East-02`).
- **Split Payment Social Feature:** Multi-participant bill splitting (Equal Split, Custom Amount, Percentage) with integrated SMS reminders and settlement tracking.
- **Service Intelligence Analytics:** Visual charts displaying dispute volume by issue type, resolution queue distributions, and SLA metrics labeled as synthetic demo data.

---

## Architecture

The project is structured with strict separation of concerns:

```
AI Devfest/
├── backend/
│   └── app/
│       ├── ai/
│       │   ├── complaint_parser.py   # Trilingual NLP entity & intent extractor
│       │   ├── investigator.py       # Forensics orchestrator & evidence builder
│       │   ├── policy_rag.py         # Simulated RAG policy retriever
│       │   ├── resolution.py         # Prescriptive action & risk scoring
│       │   ├── root_cause.py         # Grounded telemetry root-cause engine
│       │   └── summarizer.py         # Support brief & customer status generator
│       ├── api/
│       │   ├── analytics.py          # Metrics & dataset KPI endpoints
│       │   ├── cases.py              # Case management, approval & escalation
│       │   ├── complaints.py         # Natural language intake endpoints
│       │   ├── incidents.py          # Systemic cluster detection & topology
│       │   ├── investigations.py     # Deep forensics on transaction IDs
│       │   ├── policies.py           # Upay SOP knowledge base queries
│       │   ├── split_payments.py     # Split payment management
│       │   └── transactions.py       # Ledger transaction queries
│       ├── data/
│       │   ├── cases_data.py         # Seeded dispute cases & state mutations
│       │   ├── incidents_data.py     # Systemic incident graph models
│       │   ├── policies_data.py      # Upay SOPs & Bangladesh Bank directives
│       │   └── synthetic_data.py     # 42+ synthetic transactions with rich states
│       ├── models/
│       │   └── schemas.py            # Strongly typed Pydantic models
│       └── main.py                   # FastAPI server & SPA static asset mount
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                # Support Copilot, Incidents, Analytics, Roadmap
│   │   │   ├── common/               # Header, Badges, Modals, Landing Intro
│   │   │   ├── customer/             # Dashboard, BalanceCard, Complaint Assistant, Split
│   │   │   └── investigation/        # Transaction Detective, Evidence, Timeline, Root Cause
│   │   ├── services/
│   │   │   └── api.ts                # Resilient typed API client
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx                   # Master state coordinator & role switcher
│   │   └── index.css                 # Upay emerald theme & fintech tokens
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .env.example
└── README.md
```

---

## Tech Stack

- **Backend:** Python 3.13, FastAPI 0.141, Uvicorn, Pydantic v2
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons
- **Design Language:** Upay Deep Emerald (`#00875A`), Forest Charcoal (`#0A2518`), and clean slate surfaces inspired by modern fintech products (Upay, Stripe, Linear, Apple)
- **Typography:** Plus Jakarta Sans & Noto Sans Bengali

---

## Demo Flow (90–120 Seconds)

Judges can test the complete end-to-end lifecycle in under two minutes:

1. **Step 1 — Customer Dashboard:** View balance `৳24,580.00` and click *"Need help with a transaction?"*.
2. **Step 2 — Natural Complaint:** Input: `"QR payment korechi, 2000 taka kete geche but merchant pay nai."` (or click the quick chip).
3. **Step 3 — AI Understanding:** AI extracts: QR Payment, ৳2,000, Debited / Merchant Not Credited, High Priority, and candidate `TXN-8F31A2`.
4. **Step 4 & 5 — Transaction Detective:** Click *"Investigate Transaction"* to open the deep forensics view for `TXN-8F31A2`.
5. **Step 6 & 7 — Evidence & Timeline:** Inspect the 5 correlated telemetry cards and the sub-second timeline showing the 10,042ms gateway timeout.
6. **Step 8, 9 & 10 — Diagnostics & Policy:** View the 92% confidence root cause, expand the technical audit trail, review Upay Policy Sec 4.2, and note the recommended batch reconciliation.
7. **Step 11 & 12 — Support Copilot:** Toggle the header role switcher to *"Support Copilot"*. Review the AI executive brief on `CASE-1024` and click *"Approve Resolution"*.
8. **Step 13 — Case Status:** Watch status transition from *Awaiting Approval* → *Resolved* with an immutable audit note.
9. **Step 14 — Incident Intelligence:** Click *"Incident Intelligence"* to observe the systemic cluster of 341 transactions across 82 merchants.
10. **Step 15 — Customer Confirmation:** Switch back to Customer View to see the green resolution banner: *"Your transaction has been reconciled and settled with ABC Cafe."*

---

## Security & Data Privacy

- **Data Minimization & Synthetic Data:** All records are purely synthetic. No private customer records or active banking networks are contacted.
- **PII Tokenization:** Phone numbers and identifiers are masked (`+880 17••-••4567`) before reaching AI diagnostic prompts.
- **Strict Role-Based Isolation:** Customers receive simple, reassuring explanations; support specialists access raw cryptographic telemetry.
- **Human-in-the-Loop Safeguard:** The AI engine cannot autonomously trigger debits, credits, or reversals. A licensed human agent must review and approve all financial actions.

---

## Local Setup

### Prerequisites
- Python 3.10+ (FastAPI & Uvicorn)
- Node.js 20+ & npm (for frontend dev server)

### Option A: One-Click Quick Launch (Recommended)
You can start both the backend API and frontend dev server with a single command:
```powershell
# Double-click or run from root:
.\run_all.bat
```
- **Backend API & Unified UI:** `http://127.0.0.1:8000/`
- **Frontend Dev Server:** `http://localhost:5173/`

### Option B: Run Unified Server (Single Terminal)
Since the production React frontend is already pre-built inside `frontend/dist`, running the FastAPI server directly serves the complete Web App and all APIs simultaneously on port 8000:
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Open `http://127.0.0.1:8000/` in your browser. API docs at `http://127.0.0.1:8000/docs`.

### Option C: Run Frontend Dev Server Separately
```powershell
# If using PowerShell in an existing terminal session:
.\run_frontend.ps1

# Or in a Command Prompt / batch:
.\run_frontend.bat
```
*(Note: If opening a new terminal tab, `node` and `npm` are also automatically in your PATH!)*

---

## Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration works out of the box with zero external API keys needed.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/complaints/analyze` | Parses natural language complaint (Bangla/Banglish/EN) |
| `GET` | `/api/transactions` | Lists synthetic ledger transactions with filters |
| `GET` | `/api/transactions/{id}` | Fetches individual transaction record |
| `GET` | `/api/transactions/{id}/timeline` | Retrieves chronological millisecond timeline |
| `POST` | `/api/investigations` | Executes full multi-source forensic investigation |
| `GET` | `/api/cases` | Lists active dispute cases |
| `POST` | `/api/cases/{id}/approve` | Approves resolution & executes batch reconciliation |
| `POST` | `/api/cases/{id}/escalate` | Escalates dispute to Tier-3 Core Switching team |
| `GET` | `/api/incidents` | Fetches systemic gateway cluster intelligence |
| `GET` | `/api/analytics` | Provides operational dispute analytics |
| `GET` | `/api/split-payments` | Lists split payment groups |
| `POST` | `/api/split-payments` | Creates new bill split group |
| `GET` | `/api/policies` | Queries simulated Upay SOP knowledge base |

---

## Hackathon Scope & Disclaimer

> [!IMPORTANT]
> **Hackathon Prototype Notice:**  
> This application is a hackathon MVP built to demonstrate how AI can understand, investigate, and explain transaction problems inside a digital wallet ecosystem.  
> It uses realistic synthetic mock data and does **NOT** connect to real Upay banking infrastructure, core banking systems (CBS), or live payment gateways. All statistics and metrics are clearly labeled as synthetic demo data.

---

## Future Roadmap

- **Phase 1 (Current):** End-to-end AI transaction resolution, Transaction Detective, Evidence Engine, RAG policy retrieval, and Support Copilot.
- **Phase 2:** Live vector embeddings (pgvector) for Upay policy knowledge bases, merchant self-service dispute acknowledgments, and automated batch reconciliation webhooks.
- **Phase 3:** Predictive failure routing (switching away from degraded gateways before timeouts occur) and Bangla Voice AI telephone support.

---

## Team

Built with ❤️ for the AI Hackathon.
