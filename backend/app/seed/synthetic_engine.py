import datetime
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.user import User
from app.models.merchant import Merchant
from app.models.gateway import Gateway
from app.models.transaction import Transaction
from app.models.transaction_event import TransactionEvent
from app.models.support_case import SupportCase
from app.models.ai_investigation import AIInvestigation
from app.models.evidence import Evidence
from app.models.policy import Policy
from app.models.risk_case import RiskCase
from app.models.audit_log import AuditLog

logger = logging.getLogger("upay_resolveai.synthetic_engine")


async def generate_synthetic_fintech_dataset(db: AsyncSession, force_refresh: bool = False):
    """
    Generates rich, relational, highly realistic synthetic fintech data for Upay ResolveAI.
    Covers:
    - Users with masked phones & risk profiles
    - Merchants across Bangladesh
    - Payment Gateways with latency & health scores
    - Scenario 1: HERO QR Payment Partial Failure (TXN-8F31A2 at ABC Cafe)
    - Scenario 2: Suspicious High-Risk Outgoing Transfer (TXN-91K82X of ৳45,000)
    - Scenario 3: Normal Verified Merchant Payment (TXN-23A91B of ৳850)
    - Scenario 4: Systemic Gateway Outage Cluster (341 failed txns across 82 merchants in 20 mins)
    - Support Cases, AI Investigations, Forensics Evidence, and Regulatory Policies
    """
    # Check if already seeded
    existing_txn = await db.execute(select(Transaction).where(Transaction.id == "TXN-8F31A2"))
    if existing_txn.scalar_one_or_none() and not force_refresh:
        logger.info("Synthetic dataset already present in database. Skipping generation.")
        return

    if force_refresh:
        logger.info("Purging old dataset for complete refresh...")
        for model in [AuditLog, RiskCase, Evidence, AIInvestigation, SupportCase, TransactionEvent, Transaction, Merchant, Gateway, Policy, User]:
            await db.execute(delete(model))
        await db.commit()

    logger.info("Generating realistic fintech synthetic dataset for Upay ResolveAI...")

    base_time = datetime.datetime(2026, 10, 7, 6, 30, 0)

    # ----------------------------------------------------
    # 1. POLICIES
    # ----------------------------------------------------
    policies = [
        Policy(
            id="POL-QR-001",
            title="QR Payment Downstream Settlement Timeout Reversal",
            category="GATEWAY_FAILURE",
            rule="When customer core wallet is debited but gateway confirmation times out or merchant settlement webhook drops, initiate automated ledger refund within 15 minutes.",
            resolution_action="INSTANT_REFUND"
        ),
        Policy(
            id="POL-MFS-002",
            title="High-Risk Account Takeover & Anomaly Quarantine",
            category="FRAUD_PREVENTION",
            rule="Transactions with composite risk score >= 75.0 involving newly registered devices and midnight velocity must trigger automated fund hold and escalate to SIU.",
            resolution_action="FREEZE_FUNDS"
        ),
        Policy(
            id="POL-MFS-003",
            title="Accidental Send Money Recipient Withdrawal Lock",
            category="WRONG_RECIPIENT",
            rule="Upon customer accidental transfer dispute within 2 hours, place 24-hour temporary withdrawal lock on recipient wallet pending mutual consent verification.",
            resolution_action="TEMPORARY_HOLD"
        ),
        Policy(
            id="POL-MFS-004",
            title="Systemic Switch Incident Automatic Batch Reconciliation",
            category="SYSTEMIC_INCIDENT",
            rule="When partner gateway error rate exceeds 30% over 5 minutes, activate circuit breaker and flag all stranded debits for bulk automated settlement reversal.",
            resolution_action="BATCH_REVERSAL_QUEUE"
        )
    ]
    for pol in policies:
        db.add(pol)

    # ----------------------------------------------------
    # 2. GATEWAYS
    # ----------------------------------------------------
    gateways = [
        Gateway(
            id="GW-BRAC-SWITCH",
            name="BRAC Inter-switch Payment Gateway",
            status="DEGRADED",
            latency=1840,
            health_score=68.5
        ),
        Gateway(
            id="GW-CITY-PG",
            name="City Bank Internet Payment Gateway",
            status="OPERATIONAL",
            latency=110,
            health_score=99.2
        ),
        Gateway(
            id="GW-NPSB-SWITCH",
            name="National Payment Switch Bangladesh (NPSB)",
            status="OUTAGE",
            latency=5400,
            health_score=14.0
        ),
        Gateway(
            id="GW-MTB-SWITCH",
            name="Mutual Trust Bank Direct MFS Switch",
            status="OPERATIONAL",
            latency=95,
            health_score=99.8
        )
    ]
    for gw in gateways:
        db.add(gw)

    # ----------------------------------------------------
    # 3. MERCHANTS
    # ----------------------------------------------------
    merchants = [
        Merchant(
            id="MERCH-ABC-01",
            name="ABC Cafe",
            category="RESTAURANT",
            location="Banani, Dhaka",
            status="ACTIVE"
        ),
        Merchant(
            id="MERCH-SHW-01",
            name="Shwapno Superstore Mirpur",
            category="SUPERSTORE",
            location="Mirpur-10, Dhaka",
            status="ACTIVE"
        ),
        Merchant(
            id="MERCH-AGR-01",
            name="Agora Supermarket Gulshan",
            category="SUPERSTORE",
            location="Gulshan-2, Dhaka",
            status="ACTIVE"
        ),
        Merchant(
            id="MERCH-GLO-01",
            name="Gloria Jean's Coffees Dhanmondi",
            category="RESTAURANT",
            location="Dhanmondi-27, Dhaka",
            status="ACTIVE"
        ),
        Merchant(
            id="MERCH-YEL-01",
            name="Yellow Flagship Clothing",
            category="FASHION",
            location="Uttara Sector 3, Dhaka",
            status="ACTIVE"
        ),
        Merchant(
            id="MERCH-BAT-01",
            name="Bata Shoe Store Elephant Road",
            category="RETAIL",
            location="Elephant Road, Dhaka",
            status="ACTIVE"
        ),
        Merchant(
            id="MERCH-RYA-01",
            name="Ryans Computers IDB Bhaban",
            category="ELECTRONICS",
            location="Agargaon, Dhaka",
            status="ACTIVE"
        )
    ]

    # Generate 82 distinct merchants for Scenario 4 systemic gateway issue
    for i in range(1, 83):
        merchants.append(Merchant(
            id=f"MERCH-SYS-{i:03d}",
            name=f"Merchant Partner #{i:02d} ({['Grocery', 'Pharma', 'Express', 'Dine', 'Tech'][i % 5]})",
            category=["SUPERSTORE", "PHARMACY", "RETAIL", "RESTAURANT", "ELECTRONICS"][i % 5],
            location=f"{['Dhanmondi', 'Gulshan', 'Mirpur', 'Uttara', 'Motijheel', 'Banani', 'Chittagong GEC', 'Sylhet Zindabazar'][i % 8]}, BD",
            status="ACTIVE"
        ))

    for m in merchants:
        db.add(m)

    # ----------------------------------------------------
    # 4. USERS
    # ----------------------------------------------------
    users = [
        User(
            id="USR-001",
            name="Alfi Rahman",
            phone_masked="+88017****5678",
            account_status="ACTIVE",
            wallet_balance=14500.0,
            risk_level="LOW",
            role="USER",
            created_at=base_time - datetime.timedelta(days=180)
        ),
        User(
            id="USR-002",
            name="Tanvir Hasan",
            phone_masked="+88018****6543",
            account_status="FLAGGED",
            wallet_balance=3200.0,
            risk_level="HIGH",
            role="USER",
            created_at=base_time - datetime.timedelta(days=45)
        ),
        User(
            id="USR-003",
            name="Sadia Chowdhury",
            phone_masked="+88019****9912",
            account_status="ACTIVE",
            wallet_balance=28750.0,
            risk_level="LOW",
            role="USER",
            created_at=base_time - datetime.timedelta(days=320)
        ),
        User(
            id="USR-004",
            name="Kamrul Islam",
            phone_masked="+88016****4433",
            account_status="ACTIVE",
            wallet_balance=6120.0,
            risk_level="MEDIUM",
            role="USER",
            created_at=base_time - datetime.timedelta(days=90)
        ),
        User(
            id="ADM-001",
            name="Upay Ops Intelligence Admin",
            phone_masked="+88019****0001",
            account_status="ACTIVE",
            wallet_balance=1000000.0,
            risk_level="LOW",
            role="ADMIN",
            created_at=base_time - datetime.timedelta(days=500)
        )
    ]
    for u in users:
        db.add(u)

    # ----------------------------------------------------
    # 5. SCENARIO 1: HERO RESOLVEAI SCENARIO
    # QR Payment: TXN-8F31A2 | ৳2,000 | ABC Cafe | PARTIAL_FAILURE
    # Flow: Customer initiated payment -> wallet debited -> gateway request accepted
    #       -> gateway confirmation timeout -> merchant settlement missing
    # ----------------------------------------------------
    s1_time = base_time - datetime.timedelta(minutes=18)
    txn_s1 = Transaction(
        id="TXN-8F31A2",
        user_id="USR-001",
        merchant_id="MERCH-ABC-01",
        type="QR_PAYMENT",
        amount=2000.0,
        currency="BDT",
        status="PARTIAL_FAILURE",
        channel="QR",
        device_id="DEV-IPHONE-14",
        location="Banani, Dhaka",
        created_at=s1_time,
        failure_code="GW_TIMEOUT_504",
        gateway_id="GW-BRAC-SWITCH",
        meta_info={
            "qr_format": "BANGLA_QR",
            "pos_terminal_id": "ABC-POS-04",
            "counter": "Counter #2 (Pastry & Coffee)"
        }
    )
    db.add(txn_s1)

    # Events for Scenario 1
    events_s1 = [
        TransactionEvent(
            id="EVT-S1-01",
            transaction_id="TXN-8F31A2",
            event_type="APP_INITIATE",
            source="APP_CLIENT",
            timestamp=s1_time,
            status="SUCCESS",
            metadata={"device": "DEV-IPHONE-14", "app_version": "v3.4.1", "qr_scanned": "BQR-ABC-BANANI"}
        ),
        TransactionEvent(
            id="EVT-S1-02",
            transaction_id="TXN-8F31A2",
            event_type="WALLET_DEBIT",
            source="CORE_LEDGER",
            timestamp=s1_time + datetime.timedelta(milliseconds=120),
            status="SUCCESS",
            metadata={"balance_before": 16500.0, "balance_after": 14500.0, "ledger_seq": "LDG-89210-CR"}
        ),
        TransactionEvent(
            id="EVT-S1-03",
            transaction_id="TXN-8F31A2",
            event_type="GATEWAY_REQUEST",
            source="PAYMENT_GATEWAY",
            timestamp=s1_time + datetime.timedelta(milliseconds=340),
            status="SUCCESS",
            metadata={"gateway": "GW-BRAC-SWITCH", "route": "/v2/settle/merchant", "request_id": "REQ-BRAC-8891"}
        ),
        TransactionEvent(
            id="EVT-S1-04",
            transaction_id="TXN-8F31A2",
            event_type="GATEWAY_RESPONSE",
            source="PAYMENT_GATEWAY",
            timestamp=s1_time + datetime.timedelta(milliseconds=5340),
            status="TIMEOUT",
            metadata={"error_code": "GW_TIMEOUT_504", "details": "Socket connection timed out after 5000ms"}
        ),
        TransactionEvent(
            id="EVT-S1-05",
            transaction_id="TXN-8F31A2",
            event_type="MERCHANT_NOTIFICATION",
            source="MERCHANT_INTEGRATION_HUB",
            timestamp=s1_time + datetime.timedelta(milliseconds=5400),
            status="FAILED",
            metadata={"target_terminal": "ABC-POS-04", "reason": "No settlement payload received from gateway switch"}
        ),
        TransactionEvent(
            id="EVT-S1-06",
            transaction_id="TXN-8F31A2",
            event_type="SETTLEMENT_REQUEST",
            source="RECON_ENGINE",
            timestamp=s1_time + datetime.timedelta(milliseconds=5450),
            status="FAILED",
            metadata={"status": "MISSING_SETTLEMENT", "reconciliation_flag": "UNRECONCILED_DEBIT"}
        )
    ]
    for ev in events_s1:
        db.add(ev)

    # Support Case for Scenario 1
    case_s1 = SupportCase(
        id="CASE-8F31A2",
        user_id="USR-001",
        transaction_id="TXN-8F31A2",
        complaint="I scanned the QR code at ABC Cafe to pay 2,000 taka. The money was deducted from my Upay balance, but the cashier says their system didn't receive the payment!",
        status="OPEN",
        priority="HIGH",
        risk_score=12.0,
        assigned_admin="Upay Ops Intelligence Admin",
        created_at=s1_time + datetime.timedelta(minutes=3)
    )
    db.add(case_s1)

    # AI Investigation for Scenario 1
    inv_s1 = AIInvestigation(
        id="INV-8F31A2",
        case_id="CASE-8F31A2",
        intent="FAILED_PAYMENT_MISSING_MERCHANT_SETTLEMENT",
        transaction_id="TXN-8F31A2",
        root_cause="Inter-switch Gateway Timeout: Core wallet was successfully debited ৳2,000.00, but BRAC Inter-switch Gateway (GW-BRAC-SWITCH) timed out (GW_TIMEOUT_504). Downstream merchant POS received no settlement acknowledgment.",
        confidence=0.98,
        risk_score=12.0,
        recommendation="Execute instant automated refund of ৳2,000.00 to customer wallet under Policy POL-QR-001. Dispatch SMS notification to customer and notify ABC Cafe terminal to close open tab.",
        status="NEEDS_APPROVAL"
    )
    db.add(inv_s1)

    # Evidence for Scenario 1
    evidences_s1 = [
        Evidence(
            id="EVD-S1-01",
            investigation_id="INV-8F31A2",
            source="CORE_LEDGER",
            event="WALLET_DEBIT_CONFIRMED",
            timestamp=s1_time + datetime.timedelta(milliseconds=120),
            importance="CRITICAL",
            details="Core wallet successfully debited BDT 2,000.00 from user 01712345678. Ledger journal reference #LDG-89210-CR."
        ),
        Evidence(
            id="EVD-S1-02",
            investigation_id="INV-8F31A2",
            source="PAYMENT_GATEWAY",
            event="GATEWAY_TIMEOUT",
            timestamp=s1_time + datetime.timedelta(milliseconds=5340),
            importance="CRITICAL",
            details="Gateway switch GW-BRAC-SWITCH socket dropped connection after 5000ms. Response code: GW_TIMEOUT_504."
        ),
        Evidence(
            id="EVD-S1-03",
            investigation_id="INV-8F31A2",
            source="MERCHANT_INTEGRATION_HUB",
            event="SETTLEMENT_MISSING",
            timestamp=s1_time + datetime.timedelta(milliseconds=5400),
            importance="HIGH",
            details="ABC Cafe terminal POS-04 webhook received no credit confirmation packet. Transaction remains unsettled at merchant counter."
        ),
        Evidence(
            id="EVD-S1-04",
            investigation_id="INV-8F31A2",
            source="POLICY_RAG",
            event="POLICY_MATCH_POL_QR_001",
            timestamp=s1_time + datetime.timedelta(milliseconds=5500),
            importance="MEDIUM",
            details="Matched compliance rule POL-QR-001: Automatic reversal mandated within 15 minutes for uncredited merchant switch timeouts."
        )
    ]
    for ev in evidences_s1:
        db.add(ev)

    # Hero Auto-Detected Case RES-2026-00182 for Operations Queue
    case_hero = SupportCase(
        id="RES-2026-00182",
        user_id="USR-001",
        transaction_id="TXN-8F31A2",
        complaint="Autonomous stream detector identified WALLET_DEBITED_MERCHANT_NOT_CREDITED pattern: Core wallet was debited ৳2,000 but partner Gateway-X experienced an HTTP 504 confirmation timeout.",
        status="WAITING_APPROVAL",
        priority="HIGH",
        risk_score=18.0,
        assigned_admin="Upay Ops Intelligence Admin",
        created_at=s1_time + datetime.timedelta(minutes=1)
    )
    db.add(case_hero)

    inv_hero = AIInvestigation(
        id="INV-RES-00182",
        case_id="RES-2026-00182",
        intent="FAILED_PAYMENT_MISSING_MERCHANT_SETTLEMENT",
        transaction_id="TXN-8F31A2",
        root_cause="Gateway Confirmation Timeout: Customer wallet was debited ৳2,000 but partner Gateway-X experienced an HTTP 504 confirmation timeout, preventing merchant settlement credit.",
        confidence=0.98,
        risk_score=18.0,
        recommendation="INITIATE_RECONCILIATION: Execute instant automated refund of ৳2,000.00 to customer wallet under Policy POL-QR-001.",
        status="WAITING_APPROVAL"
    )
    db.add(inv_hero)

    evidences_hero = [
        Evidence(
            id="EVD-RES-01",
            investigation_id="INV-RES-00182",
            source="CORE_LEDGER",
            event="WALLET_DEBIT_CONFIRMED",
            timestamp=s1_time + datetime.timedelta(milliseconds=120),
            importance="CRITICAL",
            details="Core wallet successfully debited BDT 2,000.00 from user 01700000000. Ledger reference #LDG-89210-CR."
        ),
        Evidence(
            id="EVD-RES-02",
            investigation_id="INV-RES-00182",
            source="PAYMENT_GATEWAY",
            event="GATEWAY_CONFIRMATION_TIMEOUT",
            timestamp=s1_time + datetime.timedelta(milliseconds=5340),
            importance="CRITICAL",
            details="Gateway switch GW-BRAC-SWITCH / Gateway-X socket dropped connection after 5000ms. Response code: GW_TIMEOUT_504."
        ),
        Evidence(
            id="EVD-RES-03",
            investigation_id="INV-RES-00182",
            source="MERCHANT_INTEGRATION_HUB",
            event="MERCHANT_SETTLEMENT_MISSING",
            timestamp=s1_time + datetime.timedelta(milliseconds=5400),
            importance="HIGH",
            details="ABC Cafe terminal POS-04 webhook received no credit confirmation packet. Transaction remains unsettled at merchant counter."
        ),
        Evidence(
            id="EVD-RES-04",
            investigation_id="INV-RES-00182",
            source="POLICY_RAG",
            event="POLICY_MATCH_POL_QR_001",
            timestamp=s1_time + datetime.timedelta(milliseconds=5500),
            importance="MEDIUM",
            details="Matched compliance rule POL-QR-001: Automatic reversal mandated within 15 minutes for uncredited merchant switch timeouts."
        )
    ]
    for ev in evidences_hero:
        db.add(ev)

    # ----------------------------------------------------
    # 6. SCENARIO 2: SUSPICIOUS HIGH-RISK TRANSACTION
    # TXN-91K82X | ৳45,000 | User USR-002 | Risk: HIGH (88.5)
    # Signals: New device, Unusual amount, Unusual time, Multiple failed authentication attempts, New destination
    # ----------------------------------------------------
    s2_time = base_time - datetime.timedelta(hours=2, minutes=45)
    txn_s2 = Transaction(
        id="TXN-91K82X",
        user_id="USR-002",
        merchant_id=None,
        type="SEND_MONEY",
        amount=45000.0,
        currency="BDT",
        status="PARTIAL_FAILURE",  # Held by risk engine
        channel="APP",
        device_id="DEV-NEW-X992",
        location="Chittagong GEC, BD",
        created_at=s2_time,
        failure_code="RISK_HOLD_QUARANTINE",
        gateway_id="GW-MTB-SWITCH",
        meta_info={
            "recipient_phone": "+8801999887766",
            "recipient_name": "Rapid Cash Point",
            "is_midnight": True,
            "device_registered_mins_ago": 8,
            "failed_auth_attempts": 3,
            "risk_signals": [
                "NEW_DEVICE_LOGIN",
                "UNUSUAL_HIGH_AMOUNT_15X",
                "UNUSUAL_MIDNIGHT_HOUR",
                "MULTIPLE_FAILED_AUTH_ATTEMPTS",
                "NEW_UNSEEN_DESTINATION"
            ]
        }
    )
    db.add(txn_s2)

    events_s2 = [
        TransactionEvent(
            id="EVT-S2-01",
            transaction_id="TXN-91K82X",
            event_type="AUTH_REQUEST",
            source="AUTH_SERVICE",
            timestamp=s2_time - datetime.timedelta(minutes=3),
            status="FAILED",
            metadata={"attempt": 1, "reason": "PIN_MISMATCH", "device": "DEV-NEW-X992"}
        ),
        TransactionEvent(
            id="EVT-S2-02",
            transaction_id="TXN-91K82X",
            event_type="AUTH_REQUEST",
            source="AUTH_SERVICE",
            timestamp=s2_time - datetime.timedelta(minutes=2),
            status="FAILED",
            metadata={"attempt": 2, "reason": "PIN_MISMATCH", "device": "DEV-NEW-X992"}
        ),
        TransactionEvent(
            id="EVT-S2-03",
            transaction_id="TXN-91K82X",
            event_type="AUTH_REQUEST",
            source="AUTH_SERVICE",
            timestamp=s2_time - datetime.timedelta(minutes=1),
            status="SUCCESS",
            metadata={"attempt": 3, "verified": "OTP_FALLBACK", "device": "DEV-NEW-X992"}
        ),
        TransactionEvent(
            id="EVT-S2-04",
            transaction_id="TXN-91K82X",
            event_type="RISK_SURVEILLANCE_FLAG",
            source="RISK_GUARD_ENGINE",
            timestamp=s2_time,
            status="FAILED",
            metadata={"risk_score": 88.5, "verdict": "HIGH_RISK_SUSPEND", "action": "TEMPORARY_QUARANTINE"}
        ),
        TransactionEvent(
            id="EVT-S2-05",
            transaction_id="TXN-91K82X",
            event_type="WALLET_DEBIT",
            source="CORE_LEDGER",
            timestamp=s2_time + datetime.timedelta(milliseconds=80),
            status="PENDING",
            metadata={"state": "HELD_IN_ESCROW", "amount": 45000.0, "reason": "Awaiting SIU clearing"}
        )
    ]
    for ev in events_s2:
        db.add(ev)

    case_s2 = SupportCase(
        id="CASE-91K82X",
        user_id="USR-002",
        transaction_id="TXN-91K82X",
        complaint="Automated Risk Guard Alert: High-risk anomaly detected on outgoing transfer of ৳45,000 from newly registered device at 03:45 AM.",
        status="INVESTIGATING",
        priority="CRITICAL",
        risk_score=88.5,
        assigned_admin="SIU Fraud Surveillance Team",
        created_at=s2_time + datetime.timedelta(minutes=1)
    )
    db.add(case_s2)

    inv_s2 = AIInvestigation(
        id="INV-91K82X",
        case_id="CASE-91K82X",
        intent="UNAUTHORIZED_ACCOUNT_TAKEOVER_SUSPICION",
        transaction_id="TXN-91K82X",
        root_cause="High-confidence Account Takeover Pattern: Unusual midnight transfer executed from an unrecognized device (DEV-NEW-X992) following multiple failed authentication attempts to an unverified recipient.",
        confidence=0.94,
        risk_score=88.5,
        recommendation="Enforce fund freeze under Policy POL-MFS-002. Lock recipient account temporarily and initiate customer callback verification.",
        status="ACTIONED"
    )
    db.add(inv_s2)

    risk_case_s2 = RiskCase(
        id="RC-91K82X",
        case_number="RC-2026-91K82X",
        user_id="USR-002",
        trx_id="TXN-91K82X",
        risk_score=88.5,
        risk_level="HIGH",
        category="RAPID_VELOCITY",
        signals=[
            {"code": "NEW_DEVICE", "name": "New Device Registered", "weight": 25, "desc": "DEV-NEW-X992 registered 8 mins ago"},
            {"code": "AMOUNT_SPIKE", "name": "Unusual Velocity / Amount", "weight": 25, "desc": "৳45,000 (15x historical 90-day mean)"},
            {"code": "ODD_HOURS", "name": "Unusual Time (Circadian Anomaly)", "weight": 15, "desc": "03:45 AM (Non-business hours)"},
            {"code": "FAILED_AUTH", "name": "Multiple Failed Auth Attempts", "weight": 20, "desc": "3 failed PIN attempts before OTP fallback"},
            {"code": "NEW_RECIPIENT", "name": "New Unverified Destination", "weight": 15, "desc": "Recipient +8801999887766 never seen before"},
        ],
        ai_explanation="Transaction TXN-91K82X exhibits signature characteristics of credential stuffing and account takeover. High velocity fund drain initiated from an un-enrolled device at non-business hours immediately following authentication threshold violations.",
        evidence={"device": "DEV-NEW-X992", "ip": "103.114.98.22", "auth_fails": 3, "amount": 45000.0},
        status="FLAGGED"
    )
    db.add(risk_case_s2)

    evidences_s2 = [
        Evidence(
            id="EVD-S2-01",
            investigation_id="INV-91K82X",
            source="RISK_GUARD_ENGINE",
            event="ANOMALOUS_VELOCITY_SCORE",
            timestamp=s2_time,
            importance="CRITICAL",
            details="Amount ৳45,000 is 15.2x higher than account historical 90-day moving average (৳2,950)."
        ),
        Evidence(
            id="EVD-S2-02",
            investigation_id="INV-91K82X",
            source="AUTH_SERVICE",
            event="CONSECUTIVE_AUTH_FAILURES",
            timestamp=s2_time - datetime.timedelta(minutes=2),
            importance="HIGH",
            details="2 consecutive PIN brute-force errors before SMS OTP override on unrecognized hardware fingerprint."
        ),
        Evidence(
            id="EVD-S2-03",
            investigation_id="INV-91K82X",
            source="TELEMETRY",
            event="NEW_DEVICE_AND_LOCATION",
            timestamp=s2_time - datetime.timedelta(minutes=8),
            importance="HIGH",
            details="Hardware model SM-A526B registered 8 minutes prior from IP range in Chittagong, while historical activity was 100% Dhaka."
        )
    ]
    for ev in evidences_s2:
        db.add(ev)

    # ----------------------------------------------------
    # 7. SCENARIO 3: NORMAL VERIFIED TRANSACTION
    # TXN-23A91B | ৳850 | Shwapno Superstore | Risk: LOW (5.0) | Status: SUCCESS
    # ----------------------------------------------------
    s3_time = base_time - datetime.timedelta(hours=4, minutes=12)
    txn_s3 = Transaction(
        id="TXN-23A91B",
        user_id="USR-001",
        merchant_id="MERCH-SHW-01",
        type="MERCHANT_PAYMENT",
        amount=850.0,
        currency="BDT",
        status="SUCCESS",
        channel="APP",
        device_id="DEV-IPHONE-14",
        location="Mirpur-10, Dhaka",
        created_at=s3_time,
        failure_code=None,
        gateway_id="GW-CITY-PG",
        meta_info={
            "pos_counter": "Counter #06",
            "invoice_no": "INV-SHW-99214",
            "cashback_awarded": 15.0
        }
    )
    db.add(txn_s3)

    events_s3 = [
        TransactionEvent(
            id="EVT-S3-01",
            transaction_id="TXN-23A91B",
            event_type="APP_INITIATE",
            source="APP_CLIENT",
            timestamp=s3_time,
            status="SUCCESS",
            metadata={"device": "DEV-IPHONE-14", "location": "Mirpur-10, Dhaka"}
        ),
        TransactionEvent(
            id="EVT-S3-02",
            transaction_id="TXN-23A91B",
            event_type="WALLET_DEBIT",
            source="CORE_LEDGER",
            timestamp=s3_time + datetime.timedelta(milliseconds=95),
            status="SUCCESS",
            metadata={"balance_before": 17350.0, "balance_after": 16500.0}
        ),
        TransactionEvent(
            id="EVT-S3-03",
            transaction_id="TXN-23A91B",
            event_type="GATEWAY_REQUEST",
            source="PAYMENT_GATEWAY",
            timestamp=s3_time + datetime.timedelta(milliseconds=210),
            status="SUCCESS",
            metadata={"gateway": "GW-CITY-PG", "switch_ref": "CTY-98231"}
        ),
        TransactionEvent(
            id="EVT-S3-04",
            transaction_id="TXN-23A91B",
            event_type="GATEWAY_RESPONSE",
            source="PAYMENT_GATEWAY",
            timestamp=s3_time + datetime.timedelta(milliseconds=320),
            status="SUCCESS",
            metadata={"gateway_latency_ms": 110, "auth_code": "AUTH-OK-9821"}
        ),
        TransactionEvent(
            id="EVT-S3-05",
            transaction_id="TXN-23A91B",
            event_type="MERCHANT_NOTIFICATION",
            source="MERCHANT_INTEGRATION_HUB",
            timestamp=s3_time + datetime.timedelta(milliseconds=380),
            status="SUCCESS",
            metadata={"terminal": "SHW-POS-06", "receipt_printed": True}
        ),
        TransactionEvent(
            id="EVT-S3-06",
            transaction_id="TXN-23A91B",
            event_type="SETTLEMENT_RESPONSE",
            source="RECON_ENGINE",
            timestamp=s3_time + datetime.timedelta(milliseconds=450),
            status="SUCCESS",
            metadata={"settlement_status": "RECONCILED", "batch_id": "BATCH-20261007-01"}
        )
    ]
    for ev in events_s3:
        db.add(ev)

    # ----------------------------------------------------
    # 8. SCENARIO 4: SYSTEMIC GATEWAY OUTAGE CLUSTER
    # 341 failed transactions | 82 merchants | 1 gateway (GW-NPSB-SWITCH) | 20 minute window
    # Generates dense realistic synthetic transactions for incident intelligence
    # ----------------------------------------------------
    incident_start = base_time - datetime.timedelta(minutes=35)
    logger.info("Synthesizing Scenario 4: 341 failed transactions across 82 merchants on GW-NPSB-SWITCH...")

    sample_users = ["USR-001", "USR-002", "USR-003", "USR-004"]
    error_codes = ["ERR_NPSB_CIRCUIT_BREAKER", "ERR_NPSB_504_TIMEOUT", "ERR_NPSB_CONN_RESET"]
    types_list = ["QR_PAYMENT", "MERCHANT_PAYMENT"]

    for idx in range(1, 342):
        # Evenly spread across 20 minute window (1200 seconds / 341 = ~3.5 seconds interval)
        offset_seconds = (idx * 3.5)
        txn_timestamp = incident_start + datetime.timedelta(seconds=offset_seconds)
        
        # Pick from the 82 systemic merchants deterministically
        merchant_idx = ((idx - 1) % 82) + 1
        merchant_id = f"MERCH-SYS-{merchant_idx:03d}"
        user_id = sample_users[idx % len(sample_users)]
        amount = round(150.0 + ((idx * 37) % 4850), 2)  # Realistic varied amounts between ৳150 and ৳5,000

        txn_id = f"TXN-INC-{idx:04d}"
        err_code = error_codes[idx % len(error_codes)]

        inc_txn = Transaction(
            id=txn_id,
            user_id=user_id,
            merchant_id=merchant_id,
            type=types_list[idx % len(types_list)],
            amount=amount,
            currency="BDT",
            status="FAILED",
            channel="QR" if idx % 2 == 0 else "APP",
            device_id=f"DEV-SIM-{idx % 40:02d}",
            location=["Dhanmondi, Dhaka", "Gulshan, Dhaka", "Mirpur, Dhaka", "Uttara, Dhaka", "Chittagong GEC"][idx % 5],
            created_at=txn_timestamp,
            failure_code=err_code,
            gateway_id="GW-NPSB-SWITCH",
            meta_info={
                "incident_cluster": "INC-NPSB-OCT07",
                "switch_circuit_breaker": True,
                "retry_count": 2
            }
        )
        db.add(inc_txn)

        # Add key forensic timeline events for each (or key samples)
        # To keep DB balanced, create full events for the first 40 and sample events for the rest
        if idx <= 40 or idx % 5 == 0:
            db.add(TransactionEvent(
                id=f"EVT-INC-{idx:04d}-A",
                transaction_id=txn_id,
                event_type="WALLET_DEBIT",
                source="CORE_LEDGER",
                timestamp=txn_timestamp + datetime.timedelta(milliseconds=80),
                status="SUCCESS",
                metadata={"debit_amount": amount, "ledger_status": "DEBIT_HOLD"}
            ))
            db.add(TransactionEvent(
                id=f"EVT-INC-{idx:04d}-B",
                transaction_id=txn_id,
                event_type="GATEWAY_REQUEST",
                source="PAYMENT_GATEWAY",
                timestamp=txn_timestamp + datetime.timedelta(milliseconds=200),
                status="FAILED",
                metadata={"gateway": "GW-NPSB-SWITCH", "failure_code": err_code, "latency_ms": 4800}
            ))
            db.add(TransactionEvent(
                id=f"EVT-INC-{idx:04d}-C",
                transaction_id=txn_id,
                event_type="MERCHANT_NOTIFICATION",
                source="MERCHANT_INTEGRATION_HUB",
                timestamp=txn_timestamp + datetime.timedelta(milliseconds=5000),
                status="FAILED",
                metadata={"target_merchant": merchant_id, "error": "National switch upstream rejection"}
            ))

    # ----------------------------------------------------
    # 9. INITIAL AUDIT LOGS
    # ----------------------------------------------------
    audit_logs = [
        AuditLog(
            id="AUD-901",
            action="INVESTIGATION_COMPLETED",
            actor="ResolveAI Autonomous Engine",
            admin_id="AI-ENGINE",
            case_id="CASE-8F31A2",
            target_type="CASE",
            target_id="CASE-8F31A2",
            details="Autonomous diagnosis reached 94% confidence: RC_GATEWAY_TIMEOUT_SETTLEMENT_DROP. Recommended reconciliation under POL-QR-001.",
            reason="Autonomous evidence correlation completed",
            previous_status="OPEN",
            new_status="OPEN",
            log_metadata={"confidence": 0.94, "policy_id": "POL-QR-001", "transaction_id": "TXN-8F31A2"},
            timestamp=base_time - datetime.timedelta(minutes=15)
        ),
        AuditLog(
            id="AUD-902",
            action="APPROVE",
            actor="Human Admin (ADM-OPS-ALFI)",
            admin_id="ADM-OPS-ALFI",
            case_id="CASE-PREV-001",
            target_type="CASE",
            target_id="CASE-PREV-001",
            details="Approved automated reconciliation reversal credit of ৳1,500.00 for CASE-PREV-001 (TRX: TXN-PREV-01). Dispatched ledger credit to customer wallet.",
            reason="Verified ledger debit confirmed while gateway returned 504 timeout. Valid dispute under POL-QR-001.",
            previous_status="OPEN",
            new_status="RESOLVED",
            log_metadata={
                "admin_id": "ADM-OPS-ALFI",
                "case_id": "CASE-PREV-001",
                "transaction_id": "TXN-PREV-01",
                "action": "APPROVE",
                "reason": "Verified ledger debit confirmed while gateway returned 504 timeout.",
                "previous_status": "OPEN",
                "new_status": "RESOLVED",
                "trust_principle": "AI recommends. Human approves. System executes."
            },
            timestamp=base_time - datetime.timedelta(hours=2)
        ),
        AuditLog(
            id="AUD-903",
            action="REJECT",
            actor="Human Admin (ADM-OPS-ALFI)",
            admin_id="ADM-OPS-ALFI",
            case_id="CASE-REJ-002",
            target_type="CASE",
            target_id="CASE-REJ-002",
            details="AI recommendation rejected by operations admin: Merchant terminal confirmed offline settlement reconciliation batch successfully captured.",
            reason="Merchant terminal confirmed offline settlement reconciliation batch successfully captured. Customer received physical invoice goods.",
            previous_status="OPEN",
            new_status="REJECTED",
            log_metadata={
                "admin_id": "ADM-OPS-ALFI",
                "case_id": "CASE-REJ-002",
                "action": "REJECT",
                "reason": "Merchant terminal confirmed offline settlement reconciliation batch successfully captured.",
                "previous_status": "OPEN",
                "new_status": "REJECTED"
            },
            timestamp=base_time - datetime.timedelta(hours=3)
        ),
        AuditLog(
            id="AUD-904",
            action="ESCALATE",
            actor="Human Admin (ADM-OPS-ALFI)",
            admin_id="ADM-OPS-ALFI",
            case_id="CASE-ESC-003",
            target_type="CASE",
            target_id="CASE-ESC-003",
            details="Case escalated to Tier 2 Forensic Audit Team: Discrepancy between acquirer switch journal and merchant terminal hash requires manual bank query.",
            reason="Discrepancy between acquirer switch journal and merchant terminal hash requires manual bank query.",
            previous_status="OPEN",
            new_status="ESCALATED",
            log_metadata={
                "admin_id": "ADM-OPS-ALFI",
                "case_id": "CASE-ESC-003",
                "action": "ESCALATE",
                "reason": "Discrepancy between acquirer switch journal and merchant terminal hash requires manual bank query.",
                "previous_status": "OPEN",
                "new_status": "ESCALATED"
            },
            timestamp=base_time - datetime.timedelta(hours=4)
        ),
        AuditLog(
            id="AUD-905",
            action="RISK_ALERT_FLAGGED",
            actor="Risk Guard Engine",
            admin_id="RISK-GUARD",
            case_id=None,
            target_type="TRANSACTION",
            target_id="TXN-91K82X",
            details="Compound anomaly detected (Score: 80.0/100). ATO signals triggered: New device, 15x velocity, 03:45 AM, 3 auth failures.",
            reason="Deterministic risk scoring exceeded threshold",
            previous_status="MONITORED",
            new_status="HIGH_RISK",
            log_metadata={"risk_score": 80.0, "signals_count": 4, "user_id": "USR-002"},
            timestamp=base_time - datetime.timedelta(minutes=45)
        ),
        AuditLog(
            id="AUD-906",
            action="INCIDENT_DETECTED",
            actor="Switch Telemetry Sentinel",
            admin_id="SWITCH-SENTINEL",
            case_id=None,
            target_type="GATEWAY",
            target_id="GW-NPSB-SWITCH",
            details="Systemic latency spike (8,450ms) and 341 consecutive 504 timeouts across 82 merchants within 20-minute window.",
            reason="Switch failure rate 100% in 20min window",
            previous_status="OPERATIONAL",
            new_status="OUTAGE",
            log_metadata={"failed_txns": 341, "merchants_count": 82, "status": "OUTAGE"},
            timestamp=base_time - datetime.timedelta(minutes=30)
        )
    ]
    for al in audit_logs:
        db.add(al)

    await db.commit()
    logger.info("Successfully seeded all synthetic scenarios: Hero TXN-8F31A2, Suspicious TXN-91K82X, Normal TXN-23A91B, and 341-txn GW-NPSB-SWITCH incident cluster!")
