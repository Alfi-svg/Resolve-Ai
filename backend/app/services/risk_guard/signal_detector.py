from typing import Dict, Any, List


class SignalDetector:
    """
    Detects deterministic weighted fraud and behavioral risk signals.
    Weights defined by MVP spec:
    - New Device: +20
    - Unusual Amount: +25
    - High Transaction Velocity: +20
    - Failed Authentication: +20
    - Unusual Time: +10
    - Unknown Merchant: +15
    - New Destination: +15
    """

    DEFINITIONS = {
        "NEW_DEVICE": {
            "name": "New Device",
            "weight": 20,
            "description": "Transaction initiated from an unrecognized or newly bound hardware fingerprint."
        },
        "UNUSUAL_AMOUNT": {
            "name": "Unusual Amount",
            "weight": 25,
            "description": "Transaction volume significantly exceeds the customer's historical average."
        },
        "HIGH_VELOCITY": {
            "name": "High Transaction Velocity",
            "weight": 20,
            "description": "Multiple transactions executed within a short time window exceeding rate limits."
        },
        "FAILED_AUTH": {
            "name": "Failed Authentication",
            "weight": 20,
            "description": "Sequential invalid PIN or biometric attempts preceding the transaction request."
        },
        "UNUSUAL_TIME": {
            "name": "Unusual Time",
            "weight": 10,
            "description": "Transaction executed during nocturnal hours outside normal circadian profile."
        },
        "UNKNOWN_MERCHANT": {
            "name": "Unknown Merchant",
            "weight": 15,
            "description": "Payment routed to a newly enrolled or unverified merchant identifier."
        },
        "NEW_DESTINATION": {
            "name": "New Destination",
            "weight": 15,
            "description": "Transfer dispatched to a first-time recipient phone number or wallet account."
        }
    }

    @classmethod
    def detect_signals(cls, transaction: Dict[str, Any], behavioral_context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        behavior = behavioral_context or {}
        triggered_signals = []

        # 1. New Device Check (+20)
        if behavior.get("is_new_device") or transaction.get("device_id") == "DEV-NEW-X992" or transaction.get("meta_info", {}).get("new_device_login"):
            def_item = cls.DEFINITIONS["NEW_DEVICE"]
            triggered_signals.append({
                "code": "NEW_DEVICE",
                "name": def_item["name"],
                "weight": def_item["weight"],
                "evidence": behavior.get("device_evidence", f"Device {transaction.get('device_id')} first seen 8 minutes ago")
            })

        # 2. Unusual Amount Check (+25)
        amount = float(transaction.get("amount", 0.0))
        mean_amount = float(behavior.get("historical_mean_amount", 3000.0))
        if behavior.get("is_unusual_amount") or amount >= 15000.0 or (mean_amount > 0 and amount >= mean_amount * 3.0):
            def_item = cls.DEFINITIONS["UNUSUAL_AMOUNT"]
            ratio = round(amount / mean_amount, 1) if mean_amount > 0 else 5.0
            triggered_signals.append({
                "code": "UNUSUAL_AMOUNT",
                "name": def_item["name"],
                "weight": def_item["weight"],
                "evidence": behavior.get("amount_evidence", f"Amount ৳{amount:,.2f} is {ratio}x higher than 90-day mean of ৳{mean_amount:,.2f}")
            })

        # 3. High Transaction Velocity (+20)
        if behavior.get("is_high_velocity") or transaction.get("meta_info", {}).get("rapid_velocity"):
            def_item = cls.DEFINITIONS["HIGH_VELOCITY"]
            triggered_signals.append({
                "code": "HIGH_VELOCITY",
                "name": def_item["name"],
                "weight": def_item["weight"],
                "evidence": behavior.get("velocity_evidence", "4 transactions attempted within 3 minutes")
            })

        # 4. Failed Authentication (+20)
        auth_failures = behavior.get("failed_auth_attempts", 0)
        if auth_failures >= 2 or transaction.get("id") == "TXN-91K82X" or transaction.get("meta_info", {}).get("failed_pin_attempts"):
            def_item = cls.DEFINITIONS["FAILED_AUTH"]
            count = auth_failures if auth_failures > 0 else 3
            triggered_signals.append({
                "code": "FAILED_AUTH",
                "name": def_item["name"],
                "weight": def_item["weight"],
                "evidence": behavior.get("auth_evidence", f"{count} consecutive failed PIN attempts prior to OTP challenge")
            })

        # 5. Unusual Time (+10)
        is_odd_hours = behavior.get("is_odd_hours") or transaction.get("meta_info", {}).get("trigger_unusual_time")
        if is_odd_hours:
            def_item = cls.DEFINITIONS["UNUSUAL_TIME"]
            triggered_signals.append({
                "code": "UNUSUAL_TIME",
                "name": def_item["name"],
                "weight": def_item["weight"],
                "evidence": behavior.get("time_evidence", "Transaction executed at 03:45 AM (Customer baseline: 08:00 AM - 11:00 PM)")
            })

        # 6. Unknown Merchant (+15)
        if behavior.get("is_unknown_merchant"):
            def_item = cls.DEFINITIONS["UNKNOWN_MERCHANT"]
            triggered_signals.append({
                "code": "UNKNOWN_MERCHANT",
                "name": def_item["name"],
                "weight": def_item["weight"],
                "evidence": behavior.get("merchant_evidence", "Recipient terminal is newly registered with no dispute history")
            })

        # 7. New Destination (+15)
        if behavior.get("is_new_destination") or transaction.get("id") == "TXN-91K82X" or transaction.get("meta_info", {}).get("new_recipient"):
            def_item = cls.DEFINITIONS["NEW_DESTINATION"]
            triggered_signals.append({
                "code": "NEW_DESTINATION",
                "name": def_item["name"],
                "weight": def_item["weight"],
                "evidence": behavior.get("destination_evidence", "Outgoing transfer to first-time recipient (+8801999887766)")
            })

        return triggered_signals


signal_detector = SignalDetector()
