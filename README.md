# UPAY ResolveAI

> **Understand. Investigate. Resolve.**

UPAY ResolveAI is a hackathon MVP that explores how AI can help investigate unclear digital payment incidents and turn them into explainable, actionable cases.

The prototype takes a customer complaint, identifies the relevant transaction, correlates available synthetic evidence, checks the applicable policy information, explains the likely cause, and recommends the next step for human approval.

---

## 1. Project Overview

### The problem

A digital payment can move through several systems before it is completed. When one part of that flow is delayed or fails, a customer may see a debit without seeing a successful merchant payment.

From the customer's perspective, the most important questions are simple:

- What happened to my money?
- Did the payment reach the merchant?
- Should I try the payment again?
- What should happen next?

For support teams, answering these questions can require information from several sources.

### Our solution

UPAY ResolveAI adds an AI-assisted investigation layer around the transaction support process.

Instead of treating a complaint as a simple FAQ request, the prototype follows an investigation workflow:

**Understand → Investigate → Verify → Explain → Resolve**

The system is designed around a clear boundary:

> **AI investigates and explains; human specialists remain in control of financial decisions.**

The current implementation uses synthetic transaction, incident, and policy data for demonstration. It does not connect to live Upay banking infrastructure or live payment gateways.

---

## 2. Key Features

### Customer Dashboard
A customer-facing wallet interface with:

- Balance and transaction activity
- Send Money
- Add Money
- Cash Out
- Pay Bill
- QR Pay
- Transaction help entry point

### AI Complaint Assistant
Accepts complaints in:

- Bangla
- Banglish
- English

The prototype extracts useful information such as transaction type, amount, and complaint context, then identifies a candidate transaction for investigation.

### Transaction Detective
The main investigation interface.

It presents:

- Transaction metadata
- Correlated evidence cards
- Chronological transaction timeline
- Root-cause assessment
- Policy information
- Recommended resolution
- Investigation details for support review

### Evidence & Timeline
The prototype combines synthetic records from several simulated sources, such as:

- Core ledger
- Payment gateway
- Clearing engine
- SMS/notification service

The timeline helps show how a transaction moved through the simulated payment flow.

### AI Support Copilot
A support-facing workspace for reviewing cases.

It includes:

- Active dispute cases
- AI-generated case summaries
- Investigation results
- Approve Resolution
- Escalate
- Request Information

Financial actions remain subject to human approval in the prototype.

### Incident Intelligence
The system can group related synthetic transaction failures to demonstrate how several customer complaints may point to a common incident.

The demo includes a synthetic gateway-related cluster involving **341 transactions and 82 merchants**. These figures are demonstration data, not real Upay operational statistics.

### Service Intelligence Analytics
The prototype includes charts for:

- Dispute categories
- Resolution queues
- SLA-related indicators

All displayed metrics are synthetic demo data.

---

## 3. How AI Is Used

### 3.1 Complaint Understanding

The complaint assistant processes natural-language input and extracts relevant entities and intent.

Example:

```text
QR payment korechi, 2000 taka kete geche but merchant pay nai.
```

The prototype can identify information such as:

```text
Transaction Type: QR Payment
Amount: ৳2,000
Situation: Customer debited / merchant not credited
Priority: High
```

### 3.2 Transaction Identification

The extracted information is matched against the synthetic transaction dataset to identify a relevant transaction record.

### 3.3 Investigation and Evidence Correlation

The investigation layer brings together related synthetic records and presents them as a single case.

This allows the support user to see the transaction context rather than relying on a single status message.

### 3.4 Root-Cause Assessment

The prototype uses structured transaction states and simulated telemetry to determine a likely failure point.

The result is presented together with the supporting evidence available in the demo.

### 3.5 Policy / FAQ Retrieval

The project includes a simulated policy knowledge layer used to connect an investigation with relevant policy information.

The current implementation is intended for demonstration and does not represent a live regulatory or production policy service.

### 3.6 Resolution Recommendation

Based on the investigation result and available policy information, the system suggests a next action.

The recommendation is not treated as an autonomous financial decision.

### 3.7 Incident Clustering

Related synthetic failures can be grouped to demonstrate system-level incident detection.

This helps move the workflow from:

**one complaint → one case**

towards:

**multiple related cases → one possible incident**

---

## 4. System Workflow

```text
Customer Complaint
        │
        ▼
AI Complaint Understanding
        │
        ▼
Transaction Identification
        │
        ▼
Transaction Investigation
        │
        ▼
Evidence Correlation
        │
        ▼
Root-Cause Assessment
        │
        ▼
Policy / FAQ Retrieval
        │
        ▼
Resolution Recommendation
        │
        ▼
Human Approval
        │
        ▼
Case Resolution
```

For incident-level analysis:

```text
Individual Transactions
        │
        ▼
Failure Pattern Detection
        │
        ▼
Related Transaction Clustering
        │
        ▼
Possible Systemic Incident
```

---

## 5. Technology Stack

### Backend

- Python 3.13
- FastAPI
- Uvicorn
- Pydantic v2

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

### AI / Intelligence Components

- Natural-language complaint understanding
- Entity and intent extraction
- Structured investigation logic
- Simulated RAG/policy retrieval
- Rule-based transaction analysis
- Root-cause assessment
- Incident clustering
- AI-assisted support summarization

### Data

The prototype uses synthetic datasets for:

- Transactions
- Dispute cases
- Incident relationships
- Policy/SOP information

No real customer transaction records are included.

---

## 6. Project Structure

```text
AI Devfest/
├── backend/
│   └── app/
│       ├── ai/
│       │   ├── complaint_parser.py
│       │   ├── investigator.py
│       │   ├── policy_rag.py
│       │   ├── resolution.py
│       │   ├── root_cause.py
│       │   └── summarizer.py
│       │
│       ├── api/
│       │   ├── analytics.py
│       │   ├── cases.py
│       │   ├── complaints.py
│       │   ├── incidents.py
│       │   ├── investigations.py
│       │   ├── policies.py
│       │   ├── split_payments.py
│       │   └── transactions.py
│       │
│       ├── data/
│       │   ├── cases_data.py
│       │   ├── incidents_data.py
│       │   ├── policies_data.py
│       │   └── synthetic_data.py
│       │
│       ├── models/
│       │   └── schemas.py
│       │
│       └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── common/
│   │   │   ├── customer/
│   │   │   └── investigation/
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── .env.example
└── README.md
```

---

## 7. Requirements

Before running the project, install:

- Python 3.10 or newer
- Node.js 20 or newer
- npm
- Git

Recommended environment:

- Windows, macOS, or Linux
- At least 4 GB RAM
- Modern web browser

---

## 8. Installation & Setup

### Step 1 — Clone the repository

```bash
git clone <PUBLIC_GITHUB_REPOSITORY_URL>
cd <PROJECT_DIRECTORY>
```

### Step 2 — Backend setup

Create and activate a virtual environment:

#### Windows

```powershell
python -m venv .venv
.venv\Scripts\activate
```

#### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### Step 3 — Frontend setup

```bash
cd frontend
npm install
cd ..
```

### Step 4 — Environment configuration

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The current prototype is designed to run with synthetic data and does not require production banking credentials.

---

## 9. Environment Variables

Use `.env.example` as the source of truth for the required variables.

Do not commit real secrets to GitHub.

Example:

```env
# Example only
API_BASE_URL=http://127.0.0.1:8000
```

If additional API keys or service credentials are introduced, document:

1. Variable name
2. Purpose
3. Whether it is required
4. Where to obtain it

Never publish secret values in the repository.

---

## 10. Running the Project

### Option A — Quick Launch

If `run_all.bat` is included:

```powershell
.\run_all.bat
```

The application will be available at:

```text
http://127.0.0.1:8000/
```

### Option B — Run Backend

```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Open:

```text
http://127.0.0.1:8000/
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### Option C — Run Frontend Separately

From the project root:

```powershell
.\run_frontend.ps1
```

or:

```powershell
.\run_frontend.bat
```

The Vite development server runs at:

```text
http://localhost:5173/
```

---

## 11. Demo / Testing Instructions

The following flow demonstrates the main ResolveAI journey.

### 1. Open Customer View

Start from the customer dashboard and select:

```text
Need help with a transaction?
```

### 2. Submit a complaint

Use:

```text
QR payment korechi, 2000 taka kete geche but merchant pay nai.
```

### 3. Review AI understanding

The system should identify:

- QR payment
- ৳2,000
- Customer debited
- Merchant not credited
- Candidate transaction

### 4. Investigate the transaction

Open the suggested transaction and select:

```text
Investigate Transaction
```

### 5. Review evidence

Check:

- Transaction metadata
- Evidence cards
- Timeline
- Gateway/clearing events
- Root-cause assessment

### 6. Review policy information

Open the policy section and review the relevant simulated policy/SOP information.

### 7. Review resolution recommendation

Check the recommended next action and its supporting information.

### 8. Open Support Copilot

Switch to:

```text
Support Copilot
```

Review the case summary and available actions.

### 9. Approve the case

For the demo case, use:

```text
Approve Resolution
```

The case should move from:

```text
Awaiting Approval → Resolved
```

### 10. Open Incident Intelligence

Review the synthetic incident cluster showing related transactions and merchants.

### 11. Return to Customer View

Confirm that the customer-facing status reflects the resolved demonstration case.

---

## 12. API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/complaints/analyze` | Analyze Bangla/Banglish/English complaint |
| GET | `/api/transactions` | List synthetic transactions |
| GET | `/api/transactions/{id}` | Get a transaction |
| GET | `/api/transactions/{id}/timeline` | Get transaction timeline |
| POST | `/api/investigations` | Run transaction investigation |
| GET | `/api/cases` | List dispute cases |
| POST | `/api/cases/{id}/approve` | Approve a resolution |
| POST | `/api/cases/{id}/escalate` | Escalate a case |
| GET | `/api/incidents` | Retrieve incident intelligence |
| GET | `/api/analytics` | Retrieve demo analytics |
| GET | `/api/split-payments` | List split-payment groups |
| POST | `/api/split-payments` | Create a split-payment group |
| GET | `/api/policies` | Query simulated policy information |

---

## 13. Security & Data Handling

This prototype is intentionally isolated from real financial infrastructure.

### Synthetic data

All transaction, customer, case, and incident records used by the MVP are synthetic demonstration data.

### No live banking connection

The application does not connect to:

- Live Upay banking infrastructure
- Core banking systems
- Live payment gateways
- Real customer transaction databases

### Human approval

The AI layer does not independently authorize financial actions. The prototype keeps a human approval step before the demonstrated resolution action.

### Sensitive information

No real customer credentials or production secrets should be committed to the repository.

---

## 14. External Resources & Pre-existing Components

The project uses general-purpose development technologies and libraries that are permitted for the hackathon, including:

- Python
- FastAPI
- Uvicorn
- Pydantic
- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

The project also uses synthetic, project-specific demonstration data created for the prototype.

Any external API, model, dataset, service, or additional pre-existing component introduced during development should be listed here and documented with its purpose and source.

### Current external-service status

The current MVP is designed to run without a live external banking API and does not use real Upay transaction data.

---

## 15. Hackathon Scope

UPAY ResolveAI is a challenge-specific prototype developed as an MVP for the AI Hackathon.

The current implementation focuses on demonstrating:

1. Complaint understanding
2. Transaction investigation
3. Evidence correlation
4. Root-cause assessment
5. Policy/FAQ intelligence
6. Resolution recommendation
7. Human approval
8. Incident-level pattern detection

The prototype is not presented as a production banking system.

---

## 16. Development & Submission Notes

The project repository is maintained on GitHub so that the development process can be reviewed.

During the contest period, meaningful changes should be committed progressively, including:

- Feature implementation
- UI changes
- Backend changes
- AI logic changes
- Bug fixes
- Integration work
- Final-day updates

The repository should retain the development history rather than replacing it with a single final upload.

> **Team submission note:** The Git history should be kept continuous throughout the applicable contest phases, including the initial development period and any on-site update period.

---

## 17. Live Deployment

**Live Demo:** `<ADD_FINAL_DEPLOYMENT_URL_HERE>`

If the deployment is not publicly accessible, judges can run the project locally using the setup instructions above.

---

## 18. Current Status & Roadmap

### Phase 1 — Current MVP

- AI transaction complaint analysis
- Transaction Detective
- Evidence Engine
- Policy/FAQ retrieval
- Root-cause assessment
- Resolution recommendation
- Support Copilot
- Incident Intelligence

### Phase 2 — Planned Expansion

- Vector-based policy retrieval
- Merchant-side dispute acknowledgement
- Automated reconciliation webhooks
- Broader transaction intelligence

### Phase 3 — Longer-term Direction

- Predictive failure routing
- Bangla voice-based support
- Earlier detection of gateway degradation

---

## 19. Important Prototype Disclaimer

UPAY ResolveAI is a hackathon prototype.

The transaction records, customer information, incident counts, analytics, and investigation results shown in the application are synthetic demonstration data.

Figures such as **92% confidence**, **341 related transactions**, and **82 merchants** represent prototype scenarios and should not be interpreted as real Upay operational statistics or production model performance.

The system is intended to demonstrate the concept of AI-assisted transaction investigation and resolution, not to represent a live financial infrastructure integration.

---

## 20. Team

**UPAY ResolveAI**

Built for the **AI DevFest 2026 AI Hackathon**.

> **Understand. Investigate. Resolve.**
