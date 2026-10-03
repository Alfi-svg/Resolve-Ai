import copy
from typing import List, Dict, Any, Optional

INITIAL_SPLITS: List[Dict[str, Any]] = [
    {
        "split_id": "SPLIT-4091",
        "title": "Dinner at ABC Cafe",
        "total_amount": 3000.0,
        "mode": "Equal Split",
        "created_by": "Alfi (You)",
        "created_at": "03 Oct 2026, 7:30 PM",
        "status": "Active",
        "participants": [
            {"name": "Alfi (You)", "phone": "+880 1711-234567", "amount": 1000.0, "status": "Paid", "avatar_color": "#00875A"},
            {"name": "Sami", "phone": "+880 1712-345678", "amount": 1000.0, "status": "Pending", "avatar_color": "#3B82F6"},
            {"name": "Rahim", "phone": "+880 1819-998877", "amount": 1000.0, "status": "Pending", "avatar_color": "#F59E0B"}
        ]
    },
    {
        "split_id": "SPLIT-3820",
        "title": "Gulshan Grocery Share",
        "total_amount": 4500.0,
        "mode": "Custom Amount",
        "created_by": "Alfi (You)",
        "created_at": "01 Oct 2026, 4:15 PM",
        "status": "Settled",
        "participants": [
            {"name": "Alfi (You)", "phone": "+880 1711-234567", "amount": 1500.0, "status": "Paid", "avatar_color": "#00875A"},
            {"name": "Tanvir", "phone": "+880 1911-002233", "amount": 1800.0, "status": "Paid", "avatar_color": "#8B5CF6"},
            {"name": "Farhan", "phone": "+880 1611-445566", "amount": 1200.0, "status": "Paid", "avatar_color": "#EC4899"}
        ]
    }
]

ALL_SPLITS = copy.deepcopy(INITIAL_SPLITS)

def get_splits() -> List[Dict[str, Any]]:
    return ALL_SPLITS

def add_split(split_data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = f"SPLIT-{4100 + len(ALL_SPLITS)}"
    entry = {
        "split_id": new_id,
        "title": split_data.get("title", "New Split Bill"),
        "total_amount": float(split_data.get("total_amount", 0.0)),
        "mode": split_data.get("mode", "Equal Split"),
        "created_by": "Alfi (You)",
        "created_at": "Just now",
        "status": "Active",
        "participants": split_data.get("participants", [])
    }
    ALL_SPLITS.insert(0, entry)
    return entry

def remind_participant(split_id: str, participant_name: str) -> bool:
    for s in ALL_SPLITS:
        if s["split_id"] == split_id:
            return True
    return False

def mark_participant_paid(split_id: str, participant_name: str) -> bool:
    for s in ALL_SPLITS:
        if s["split_id"] == split_id:
            for p in s["participants"]:
                if p["name"] == participant_name:
                    p["status"] = "Paid"
            # check if all paid
            if all(p["status"] == "Paid" for p in s["participants"]):
                s["status"] = "Settled"
            return True
    return False
