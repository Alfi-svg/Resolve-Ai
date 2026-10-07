import datetime
from typing import List, Dict, Any
from app.schemas.investigation import TimelineItem


class TimelineEngine:
    """
    Forensic Timeline Reconstruction Engine.
    Converts raw technical socket logs and ledger entries into an intuitive, human-readable
    chronological sequence of milestones.
    """

    @classmethod
    def reconstruct_timeline(
        cls,
        transaction: Dict[str, Any],
        raw_events: List[Any]
    ) -> List[TimelineItem]:
        timeline: List[TimelineItem] = []

        event_titles = {
            "APP_INITIATE": ("Payment initiated", "Customer scanned Bangla QR and entered wallet PIN"),
            "WALLET_DEBIT": ("Wallet debited", f"Upay core wallet balance debited ৳{transaction.get('amount', 0.0):,.2f}"),
            "GATEWAY_REQUEST": ("Gateway request accepted", "Transaction payload routed to partner MFS switch gateway"),
            "GATEWAY_RESPONSE": ("Gateway confirmation timeout", "Downstream payment switch connection timed out after 5,000ms"),
            "MERCHANT_NOTIFICATION": ("Merchant settlement not confirmed", "Point-of-sale terminal received no confirmation packet"),
            "SETTLEMENT_REQUEST": ("Reconciliation discrepancy logged", "Marked as stranded debit requiring automated balance adjustment"),
            "SETTLEMENT_RESPONSE": ("Settlement confirmed", "Downstream partner ledger acknowledged final credit"),
            "AUTH_REQUEST": ("Authentication verified", "Hardware fingerprint and biometric/PIN check processed"),
            "RISK_SURVEILLANCE_FLAG": ("Security quarantine engaged", "Risk Guard detected anomalous transaction pattern")
        }

        if raw_events:
            for ev in raw_events:
                e_type = getattr(ev, "event_type", ev.get("event_type") if isinstance(ev, dict) else "EVENT")
                e_time_raw = getattr(ev, "timestamp", ev.get("timestamp") if isinstance(ev, dict) else "")
                e_source = getattr(ev, "source", ev.get("source") if isinstance(ev, dict) else "SYSTEM")
                e_status = getattr(ev, "status", ev.get("status") if isinstance(ev, dict) else "SUCCESS")

                # Format time nicely: HH:MM:SS
                time_str = "00:00:00"
                if isinstance(e_time_raw, datetime.datetime):
                    time_str = e_time_raw.strftime("%H:%M:%S")
                elif isinstance(e_time_raw, str):
                    try:
                        dt = datetime.datetime.fromisoformat(e_time_raw)
                        time_str = dt.strftime("%H:%M:%S")
                    except Exception:
                        time_str = e_time_raw[-8:] if len(e_time_raw) >= 8 else e_time_raw

                # Lookup title or fallback
                title, desc = event_titles.get(e_type, (e_type.replace("_", " ").title(), "Event processed"))
                
                # If Gateway Response succeeded
                if e_type == "GATEWAY_RESPONSE" and e_status == "SUCCESS":
                    title = "Gateway confirmation received"
                    desc = "Switch verified transaction settlement"

                timeline.append(TimelineItem(
                    time=time_str,
                    title=title,
                    description=desc,
                    status=e_status,
                    source=e_source
                ))
            return timeline

        # Fallback generated timeline for Hero scenario or generic transaction
        created_str = str(transaction.get("created_at", "10:31:02"))
        time_part = created_str[11:19] if len(created_str) >= 19 else "10:31:02"

        timeline.extend([
            TimelineItem(
                time=time_part,
                title="Payment initiated",
                description="Customer confirmed payment on authorized device",
                status="SUCCESS",
                source="APP_CLIENT"
            ),
            TimelineItem(
                time=time_part,
                title="Wallet debited",
                description=f"Core wallet balance debited ৳{transaction.get('amount', 0.0):,.2f}",
                status="SUCCESS",
                source="CORE_LEDGER"
            ),
            TimelineItem(
                time=time_part,
                title="Gateway request accepted",
                description="Transaction routed to partner payment gateway switch",
                status="SUCCESS",
                source="PAYMENT_GATEWAY"
            )
        ])

        if transaction.get("status") in ["PARTIAL_FAILURE", "FAILED"]:
            timeline.append(TimelineItem(
                time=time_part,
                title="Gateway confirmation timeout",
                description="Payment gateway failed to return settlement confirmation within SLA",
                status="TIMEOUT",
                source="PAYMENT_GATEWAY"
            ))
            timeline.append(TimelineItem(
                time=time_part,
                title="Merchant settlement not confirmed",
                description="Merchant point-of-sale terminal dropped transaction without receipt",
                status="FAILED",
                source="MERCHANT_SWITCH"
            ))
        else:
            timeline.append(TimelineItem(
                time=time_part,
                title="Settlement confirmed",
                description="Merchant acknowledged payment receipt",
                status="SUCCESS",
                source="MERCHANT_SWITCH"
            ))

        return timeline


timeline_engine = TimelineEngine()
