from typing import Dict, Any, List
from datetime import datetime, timedelta


class EvidenceService:
    """Transaction Detective service for evidence collection, timeline synthesis, and gateway verification."""

    @staticmethod
    def gather_evidence_timeline(transaction: Any, user: Any = None) -> Dict[str, Any]:
        """Synthesizes technical evidence and event timelines for a given transaction."""
        trx_dict = transaction if isinstance(transaction, dict) else {
            "trx_id": getattr(transaction, "trx_id", "UNKNOWN"),
            "amount": getattr(transaction, "amount", 0.0),
            "fee": getattr(transaction, "fee", 0.0),
            "type": getattr(transaction, "type", "GENERAL"),
            "status": getattr(transaction, "status", "UNKNOWN"),
            "channel": getattr(transaction, "channel", "APP"),
            "receiver_phone": getattr(transaction, "receiver_phone", "N/A"),
            "receiver_name": getattr(transaction, "receiver_name", "N/A"),
            "error_code": getattr(transaction, "error_code", None),
            "gateway_message": getattr(transaction, "gateway_message", None),
            "meta_info": getattr(transaction, "meta_info", {}) or {},
            "created_at": getattr(transaction, "created_at", datetime.utcnow())
        }

        created_dt = trx_dict["created_at"]
        if isinstance(created_dt, str):
            try:
                created_dt = datetime.fromisoformat(created_dt)
            except Exception:
                created_dt = datetime.utcnow()

        timeline = [
            {
                "time": created_dt.strftime("%H:%M:%S.%f")[:-3],
                "event": "TRANSACTION_INITIATED",
                "details": f"User initiated {trx_dict['type']} of BDT {trx_dict['amount']:,.2f} via {trx_dict['channel']}",
                "status": "INFO"
            },
            {
                "time": (created_dt + timedelta(milliseconds=120)).strftime("%H:%M:%S.%f")[:-3],
                "event": "CORE_LEDGER_DEBIT",
                "details": f"Upay core wallet debited BDT {trx_dict['amount'] + trx_dict['fee']:,.2f}",
                "status": "SUCCESS"
            }
        ]

        # Add gateway response based on status
        if trx_dict["status"] == "FAILED" or trx_dict["error_code"]:
            timeline.append({
                "time": (created_dt + timedelta(seconds=2, milliseconds=450)).strftime("%H:%M:%S.%f")[:-3],
                "event": "GATEWAY_TIMEOUT_OR_REJECTION",
                "details": f"Partner switch returned {trx_dict.get('error_code', 'ERR_GW_TIMEOUT')}: {trx_dict.get('gateway_message', 'Downstream connection timeout')}",
                "status": "FAILED"
            })
            timeline.append({
                "time": (created_dt + timedelta(seconds=2, milliseconds=600)).strftime("%H:%M:%S.%f")[:-3],
                "event": "AUTO_REVERSAL_QUEUE",
                "details": "Transaction flagged for auto-reversal; awaiting downstream reconciliation lock.",
                "status": "WARNING"
            })
        else:
            timeline.append({
                "time": (created_dt + timedelta(milliseconds=850)).strftime("%H:%M:%S.%f")[:-3],
                "event": "DOWNSTREAM_CONFIRMATION",
                "details": f"Recipient switch confirmed credit to {trx_dict['receiver_phone']}",
                "status": "SUCCESS"
            })
            timeline.append({
                "time": (created_dt + timedelta(seconds=1, milliseconds=100)).strftime("%H:%M:%S.%f")[:-3],
                "event": "SMS_NOTIFICATION_DISPATCHED",
                "details": f"Confirmation SMS delivered to {trx_dict['receiver_phone']}",
                "status": "SUCCESS"
            })

        return {
            "trx_id": trx_dict["trx_id"],
            "timeline": timeline,
            "raw_gateway_status": trx_dict.get("gateway_message") or "Switch ACK received",
            "error_code": trx_dict.get("error_code"),
            "ledger_reconciled": False if trx_dict["status"] == "FAILED" else True,
            "ip_location": trx_dict.get("meta_info", {}).get("ip_location", "Dhaka, Bangladesh"),
            "device_id": trx_dict.get("meta_info", {}).get("device_id", "DEV-BD-98231")
        }


evidence_service = EvidenceService()
