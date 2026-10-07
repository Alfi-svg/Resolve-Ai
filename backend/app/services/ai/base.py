from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.schemas.common import AIReasoningStep


class BaseAIService(ABC):
    """Abstract interface for AI analysis services."""

    @abstractmethod
    async def analyze_complaint_intent(self, text: str) -> Dict[str, Any]:
        """Classify complaint intent and extract entities."""
        pass

    @abstractmethod
    async def identify_transaction(self, user_id: str, intent_data: Dict[str, Any], user_transactions: List[Any]) -> Dict[str, Any]:
        """Match complaint to historical transaction."""
        pass

    @abstractmethod
    async def analyze_root_cause(self, transaction_data: Dict[str, Any], evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Diagnose root cause using transaction logs and gateway events."""
        pass

    @abstractmethod
    async def evaluate_risk(self, transaction_data: Dict[str, Any], user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate fraud score and risk signals."""
        pass

    @abstractmethod
    async def generate_recommendation(
        self,
        intent: Dict[str, Any],
        root_cause: Dict[str, Any],
        policy: Dict[str, Any],
        risk: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Produce structured resolution recommendation."""
        pass
