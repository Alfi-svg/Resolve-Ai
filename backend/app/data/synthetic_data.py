import copy
from typing import List, Dict, Any, Optional

SYNTHETIC_TRANSACTIONS: List[Dict[str, Any]] = [
    {
        "transaction_id": "TXN-8F31A2",
        "customer_id": "CUST-01928",
        "customer_name": "Alfi",
        "merchant_id": "M-99120",
        "merchant_name": "ABC Cafe",
        "recipient_phone": "+880 1711-889922",
        "amount": 2000.0,
        "transaction_type": "QR Payment",
        "timestamp": "03 Oct 2026, 8:42 PM",
        "wallet_status": "Debited",
        "gateway_status": "Timeout",
        "merchant_status": "Not Credited",
        "settlement_status": "Missing",
        "notification_status": "Delivered",
        "failure_code": "PGW_TIMEOUT_504",
        "status": "Needs Investigation",
        "needs_investigation": True,
        "events": [
            {"time": "08:42:01 PM", "name": "Payment Initiated", "source": "Mobile App v4.8", "status": "OK"},
            {"time": "08:42:02 PM", "name": "Wallet Debit Confirmed", "source": "Core Ledger Service", "status": "OK", "details": "Account 01711234567 debited ৳2,000.00"},
            {"time": "08:42:04 PM", "name": "Gateway Request Sent", "source": "PGW-East-02", "status": "OK", "details": "HTTP POST /v2/charge (trace-8f31)"},
            {"time": "08:42:14 PM", "name": "Gateway Response Timeout", "source": "PGW-East-02", "status": "FAILED", "details": "Timeout threshold 10,000ms exceeded. No ACK received"},
            {"time": "08:42:15 PM", "name": "Merchant Settlement Pending", "source": "Settlement Engine", "status": "WARNING", "details": "Settlement batch missing merchant credit entry"},
            {"time": "08:42:16 PM", "name": "Customer Notification Generated", "source": "Notification Queue", "status": "OK", "details": "SMS and push notification sent: Debit confirmed"}
        ]
    },
    {
        "transaction_id": "TXN-7A42B1",
        "customer_id": "CUST-01928",
        "customer_name": "Alfi",
        "recipient_phone": "+880 1719-882233",
        "merchant_name": "Rahim Ahmed",
        "amount": 1500.0,
        "transaction_type": "Send Money",
        "timestamp": "03 Oct 2026, 6:15 PM",
        "wallet_status": "Debited",
        "gateway_status": "Success",
        "merchant_status": "Credited",
        "settlement_status": "Settled",
        "notification_status": "Delivered",
        "failure_code": None,
        "status": "Completed",
        "needs_investigation": False,
        "events": [
            {"time": "06:15:00 PM", "name": "Send Money Initiated", "source": "App", "status": "OK"},
            {"time": "06:15:01 PM", "name": "Debit Confirmed", "source": "Ledger", "status": "OK"},
            {"time": "06:15:02 PM", "name": "Recipient Credited", "source": "Ledger", "status": "OK"}
        ]
    },
    {
        "transaction_id": "TXN-9E11C3",
        "customer_id": "CUST-01928",
        "customer_name": "Alfi",
        "merchant_name": "City Bank Add Money",
        "amount": 5000.0,
        "transaction_type": "Add Money",
        "timestamp": "03 Oct 2026, 2:30 PM",
        "wallet_status": "Unchanged",
        "gateway_status": "Timeout",
        "merchant_status": "N/A",
        "settlement_status": "Reversed",
        "notification_status": "Delivered",
        "failure_code": "CBS_NETWORK_TIMEOUT",
        "status": "Reversed",
        "needs_investigation": False,
        "events": [
            {"time": "02:30:00 PM", "name": "Bank Pull Request", "source": "CBS Gateway", "status": "OK"},
            {"time": "02:30:15 PM", "name": "Bank Gateway Timeout", "source": "City Bank API", "status": "FAILED"},
            {"time": "02:30:20 PM", "name": "Auto-Reversal Executed", "source": "Reconciliation Engine", "status": "OK"}
        ]
    },
    {
        "transaction_id": "TXN-4C82D9",
        "customer_id": "CUST-02481",
        "customer_name": "Tariqul Islam",
        "merchant_id": "AGT-3021",
        "merchant_name": "Agent Rahim Store",
        "amount": 3000.0,
        "transaction_type": "Cash Out",
        "timestamp": "03 Oct 2026, 8:38 PM",
        "wallet_status": "Debited",
        "gateway_status": "Timeout",
        "merchant_status": "Not Credited",
        "settlement_status": "Missing",
        "notification_status": "Delivered",
        "failure_code": "AGENT_SYNC_TIMEOUT",
        "status": "Needs Investigation",
        "needs_investigation": True,
        "events": [
            {"time": "08:38:00 PM", "name": "Cash Out Token Issued", "source": "Agent App", "status": "OK"},
            {"time": "08:38:05 PM", "name": "Customer Debit Confirmed", "source": "Core Ledger", "status": "OK"},
            {"time": "08:38:20 PM", "name": "Agent Cash Delivery Unconfirmed", "source": "Agent Terminal", "status": "FAILED"}
        ]
    },
    {
        "transaction_id": "TXN-6B90E5",
        "customer_id": "CUST-08912",
        "customer_name": "Farhana Yasmin",
        "merchant_name": "DPDC Electricity",
        "amount": 4320.0,
        "transaction_type": "Bill Payment",
        "timestamp": "03 Oct 2026, 8:40 PM",
        "wallet_status": "Debited",
        "gateway_status": "Timeout",
        "merchant_status": "Pending",
        "settlement_status": "Missing",
        "notification_status": "Delivered",
        "failure_code": "AGGREGATOR_TIMEOUT_504",
        "status": "Needs Investigation",
        "needs_investigation": True,
        "events": [
            {"time": "08:40:01 PM", "name": "Bill Payment Sent", "source": "App", "status": "OK"},
            {"time": "08:40:02 PM", "name": "Wallet Debited", "source": "Core Ledger", "status": "OK"},
            {"time": "08:40:15 PM", "name": "Biller Aggregator Timeout", "source": "DPDC Biller API", "status": "FAILED"}
        ]
    },
    {
        "transaction_id": "TXN-1D55F8",
        "customer_id": "CUST-03310",
        "customer_name": "Mehedi Hasan",
        "merchant_id": "M-88219",
        "merchant_name": "Shwapno Superstore",
        "amount": 850.0,
        "transaction_type": "QR Payment",
        "timestamp": "03 Oct 2026, 8:41 PM",
        "wallet_status": "Debited",
        "gateway_status": "Timeout",
        "merchant_status": "Not Credited",
        "settlement_status": "Missing",
        "notification_status": "Delivered",
        "failure_code": "PGW_TIMEOUT_504",
        "status": "Needs Investigation",
        "needs_investigation": True,
        "events": [
            {"time": "08:41:00 PM", "name": "QR Scan Pay", "source": "App", "status": "OK"},
            {"time": "08:41:01 PM", "name": "Debit Successful", "source": "Core Ledger", "status": "OK"},
            {"time": "08:41:12 PM", "name": "Gateway Timeout", "source": "PGW-East-02", "status": "FAILED"}
        ]
    },
    {
        "transaction_id": "TXN-3A88G2",
        "customer_id": "CUST-01928",
        "customer_name": "Alfi",
        "merchant_id": "M-99120",
        "merchant_name": "ABC Cafe",
        "amount": 1000.0,
        "transaction_type": "QR Payment",
        "timestamp": "02 Oct 2026, 1:15 PM",
        "wallet_status": "Debited",
        "gateway_status": "Success",
        "merchant_status": "Credited",
        "settlement_status": "Settled",
        "notification_status": "Delivered",
        "failure_code": None,
        "status": "Completed",
        "needs_investigation": False,
        "events": [
            {"time": "01:15:00 PM", "name": "QR Scan", "source": "App", "status": "OK"},
            {"time": "01:15:02 PM", "name": "Settled", "source": "Gateway", "status": "OK"}
        ]
    },
    {
        "transaction_id": "TXN-2B71K4",
        "customer_id": "CUST-01928",
        "customer_name": "Alfi",
        "merchant_name": "Deshi Grill",
        "amount": 1250.0,
        "transaction_type": "QR Payment",
        "timestamp": "01 Oct 2026, 9:20 PM",
        "wallet_status": "Debited",
        "gateway_status": "Success",
        "merchant_status": "Credited",
        "settlement_status": "Settled",
        "notification_status": "Delivered",
        "failure_code": None,
        "status": "Completed",
        "needs_investigation": False,
        "events": []
    },
    {
        "transaction_id": "TXN-5E99L1",
        "customer_id": "CUST-05512",
        "customer_name": "Nafisa Kamal",
        "merchant_id": "M-77112",
        "merchant_name": "Unimart Gulshan",
        "amount": 3490.0,
        "transaction_type": "QR Payment",
        "timestamp": "03 Oct 2026, 8:43 PM",
        "wallet_status": "Debited",
        "gateway_status": "Timeout",
        "merchant_status": "Not Credited",
        "settlement_status": "Missing",
        "notification_status": "Delivered",
        "failure_code": "PGW_TIMEOUT_504",
        "status": "Needs Investigation",
        "needs_investigation": True,
        "events": [
            {"time": "08:43:00 PM", "name": "QR Payment", "source": "POS Terminal", "status": "OK"},
            {"time": "08:43:02 PM", "name": "Wallet Debited", "source": "Core Ledger", "status": "OK"},
            {"time": "08:43:14 PM", "name": "Gateway Timeout", "source": "PGW-East-02", "status": "FAILED"}
        ]
    },
    {
        "transaction_id": "TXN-8C43M7",
        "customer_id": "CUST-01928",
        "customer_name": "Alfi",
        "recipient_phone": "+880 1819-554433",
        "merchant_name": "Tanvir Hasan",
        "amount": 2500.0,
        "transaction_type": "Send Money",
        "timestamp": "29 Sep 2026, 11:10 AM",
        "wallet_status": "Debited",
        "gateway_status": "Success",
        "merchant_status": "Credited",
        "settlement_status": "Settled",
        "notification_status": "Delivered",
        "failure_code": None,
        "status": "Completed",
        "needs_investigation": False,
        "events": []
    }
]

# Generate additional realistic synthetic transactions to exceed 35 entries
MERCHANT_NAMES = ["Star Kabab", "Yellow Lifestyle", "Aarong Uttara", "KFC Dhanmondi", "Pizza Hut Gulshan", "Bata Shoe Co", "Agora Superstore", "Daraz Bangladesh", "Chaldal Grocery", "Labaid Diagnostic"]
TYPES = ["QR Payment", "Send Money", "Add Money", "Cash Out", "Bill Payment"]

for i in range(11, 42):
    t_id = f"TXN-{i:02d}AA{i%9}"
    is_failed = (i % 4 == 0)
    m_name = MERCHANT_NAMES[i % len(MERCHANT_NAMES)]
    t_type = TYPES[i % len(TYPES)]
    amt = round(350.0 + (i * 125.5 % 4500), 2)
    
    SYNTHETIC_TRANSACTIONS.append({
        "transaction_id": t_id,
        "customer_id": f"CUST-{1000+i}",
        "customer_name": f"User {i}",
        "merchant_id": f"M-{8000+i}",
        "merchant_name": m_name,
        "recipient_phone": f"+880 171{i:02d}-99281",
        "amount": amt,
        "transaction_type": t_type,
        "timestamp": f"0{1 + (i % 3)} Oct 2026, {8 + (i % 12)}:{10 + (i % 45):02d} {'PM' if i % 2 == 0 else 'AM'}",
        "wallet_status": "Debited" if not is_failed or (i % 3 == 0) else "Failed",
        "gateway_status": "Timeout" if is_failed else "Success",
        "merchant_status": "Not Credited" if is_failed else "Credited",
        "settlement_status": "Missing" if is_failed else "Settled",
        "notification_status": "Delivered",
        "failure_code": "PGW_TIMEOUT_504" if is_failed else None,
        "status": "Needs Investigation" if is_failed else "Completed",
        "needs_investigation": is_failed,
        "events": [
            {"time": "10:00:00 AM", "name": "Payment Initiated", "source": "System", "status": "OK"},
            {"time": "10:00:02 AM", "name": "Ledger Operation", "source": "Core Ledger", "status": "OK"},
            {"time": "10:00:12 AM", "name": "Gateway Check", "source": "PGW", "status": "FAILED" if is_failed else "OK"}
        ]
    })

def get_all_transactions() -> List[Dict[str, Any]]:
    return copy.deepcopy(SYNTHETIC_TRANSACTIONS)

def get_transaction_by_id(tx_id: str) -> Optional[Dict[str, Any]]:
    for t in SYNTHETIC_TRANSACTIONS:
        if t["transaction_id"].upper() == tx_id.upper():
            return copy.deepcopy(t)
    return None

def update_transaction_status(tx_id: str, new_status: str, settlement_status: str = "Settled"):
    for t in SYNTHETIC_TRANSACTIONS:
        if t["transaction_id"].upper() == tx_id.upper():
            t["status"] = new_status
            t["needs_investigation"] = False
            t["settlement_status"] = settlement_status
            if new_status == "Resolved":
                t["merchant_status"] = "Credited"
                t["events"].append({
                    "time": "Just now",
                    "name": "Reconciliation Completed by Support",
                    "source": "ResolveAI Core",
                    "status": "OK",
                    "details": "Batch settlement reconciled; merchant credited"
                })
            return copy.deepcopy(t)
    return None
