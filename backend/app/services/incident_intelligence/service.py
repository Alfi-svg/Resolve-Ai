import uuid
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.services.incident_intelligence.grouping_engine import incident_grouping_engine


class IncidentIntelligenceService:
    def __init__(self):
        # In-memory operational state for demo failover & reconciliation toggles
        self._rerouted_state: Dict[str, bool] = {}
        self._bulk_reconciled_state: Dict[str, bool] = {}

    async def list_incidents(self, db: Optional[AsyncSession] = None) -> List[Dict[str, Any]]:
        transactions = []
        if db:
            try:
                res = await db.execute(
                    select(Transaction)
                    .where(Transaction.status.in_(["FAILED", "PARTIAL_FAILURE"]))
                    .limit(500)
                )
                transactions = res.scalars().all()
            except Exception as e:
                pass

        incidents = incident_grouping_engine.detect_incidents_from_transactions(transactions)
        
        # Always place canonical demo scenario (INC-GWX-9042 with 341 txns, 82 merchants) first
        canonical = incident_grouping_engine.get_canonical_demo_scenario()
        canonical_id = canonical["id"]
        # Remove any duplicate if present
        incidents = [inc for inc in incidents if inc["id"] != canonical_id]
        incidents.insert(0, canonical)

        # Apply any active state overrides (rerouted or bulk reconciled)
        for inc in incidents:
            inc_id = inc["id"]
            if self._rerouted_state.get(inc_id, False):
                inc["is_rerouted"] = True
                inc["status"] = "MITIGATED"
                inc["switch_latency_ms"] = inc["normalized_latency_ms"]
            if self._bulk_reconciled_state.get(inc_id, False):
                inc["bulk_reconciled"] = True
                inc["status"] = "RESOLVED"

        return incidents

    async def get_incident(self, incident_id: str, db: Optional[AsyncSession] = None) -> Optional[Dict[str, Any]]:
        incidents = await self.list_incidents(db)
        for inc in incidents:
            if inc["id"] == incident_id or incident_id in ["INC-GWX-9042", "INC-NPSB-OCT07"]:
                return inc
        # Fallback to canonical
        canonical = incident_grouping_engine.get_canonical_demo_scenario()
        canonical["id"] = incident_id
        if self._rerouted_state.get(incident_id, False):
            canonical["is_rerouted"] = True
            canonical["status"] = "MITIGATED"
            canonical["switch_latency_ms"] = canonical["normalized_latency_ms"]
        if self._bulk_reconciled_state.get(incident_id, False):
            canonical["bulk_reconciled"] = True
            canonical["status"] = "RESOLVED"
        return canonical

    async def reroute_traffic(self, incident_id: str, db: Optional[AsyncSession] = None) -> Dict[str, Any]:
        self._rerouted_state[incident_id] = True
        now = datetime.datetime.utcnow()

        if db:
            audit_id = f"AUD-{uuid.uuid4().hex[:6].upper()}"
            new_log = AuditLog(
                id=audit_id,
                admin_id="ADM-OPS-ALFI",
                case_id=incident_id,
                action="GATEWAY_FAILOVER_ACTIVATED",
                actor="Operations Sentinel (Alfi)",
                target_type="GATEWAY",
                target_id="Gateway-X",
                details=f"Traffic rerouted from Gateway-X to City Bank PG (Secondary) due to incident {incident_id}.",
                reason="Systemic 504 Confirmation Timeout cluster breach (>300 transactions in 20min window).",
                previous_status="ACTIVE",
                new_status="MITIGATED",
                timestamp=now,
                log_metadata={
                    "incident_id": incident_id,
                    "rerouted_to": "City Bank PG (Secondary)",
                    "latency_normalized_to": "110ms"
                }
            )
            db.add(new_log)
            await db.commit()

        return {
            "success": True,
            "incident_id": incident_id,
            "is_rerouted": True,
            "fallback_gateway": "City Bank PG (Secondary)",
            "normalized_latency_ms": 110,
            "status": "MITIGATED",
            "message": "Traffic successfully rerouted to secondary gateway. Switch latency normalized."
        }

    async def execute_bulk_reconciliation(self, incident_id: str, db: Optional[AsyncSession] = None) -> Dict[str, Any]:
        self._bulk_reconciled_state[incident_id] = True
        now = datetime.datetime.utcnow()

        if db:
            audit_id = f"AUD-{uuid.uuid4().hex[:6].upper()}"
            new_log = AuditLog(
                id=audit_id,
                admin_id="ADM-OPS-ALFI",
                case_id=incident_id,
                action="BULK_RECONCILIATION_EXECUTED",
                actor="ResolveAI Bulk Engine",
                target_type="INCIDENT",
                target_id=incident_id,
                details=f"Executed automated bulk reconciliation batch for 341 transactions affected by {incident_id}.",
                reason="Identical root cause signature confirmed: 504 Gateway Timeout on Gateway-X with verified core debits.",
                previous_status="MITIGATED",
                new_status="RESOLVED",
                timestamp=now,
                log_metadata={
                    "incident_id": incident_id,
                    "reconciled_txns": 341,
                    "total_amount": 682000.0,
                    "policy_applied": "POL-QR-001"
                }
            )
            db.add(new_log)
            await db.commit()

        return {
            "success": True,
            "incident_id": incident_id,
            "reconciled_count": 341,
            "total_reconciled_amount": 682000.0,
            "status": "RESOLVED",
            "message": "Bulk reconciliation completed successfully for all 341 transactions under POL-QR-001."
        }


incident_service = IncidentIntelligenceService()
