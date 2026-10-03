from typing import Dict, Any

def generate_case_summary(tx: Dict[str, Any], root_cause: Dict[str, Any], recommendation: Dict[str, Any]) -> str:
    tx_id = tx.get("transaction_id", "N/A")
    amt = tx.get("amount", 0.0)
    merchant = tx.get("merchant_name") or tx.get("recipient_phone") or "recipient"
    cust = tx.get("customer_name", "Customer")
    
    return (
        f"Customer {cust} encountered an unsettled transaction of ৳{amt:,.2f} at {merchant} ({tx_id}). "
        f"Automated diagnostic reveals a {root_cause['summary'].lower()} Core wallet balance was successfully debited, "
        f"but merchant credit remained unacknowledged. AI recommends: {recommendation['recommended_action']} "
        f"Requires human agent verification before proceeding with batch settlement."
    )

def generate_customer_explanation(tx: Dict[str, Any], root_cause: Dict[str, Any], is_resolved: bool = False) -> Dict[str, str]:
    amt = tx.get("amount", 0.0)
    merchant = tx.get("merchant_name", "দোকানদার")
    
    if is_resolved:
        return {
            "english": f"Good news! Your transaction of ৳{amt:,.2f} at {merchant} has been reconciled and settled successfully. The merchant has received the payment.",
            "bangla": f"সুসংবাদ! {merchant}-এ আপনার ৳{amt:,.2f} টাকার লেনদেনটি সফলভাবে সমন্বয় করা হয়েছে এবং মার্চেন্ট পেমেন্ট নিশ্চিত করেছেন।"
        }
        
    return {
        "english": f"We verified that ৳{amt:,.2f} was deducted from your wallet, but the merchant's bank timed out during confirmation. Our dispute specialist has received this case and will complete reconciliation shortly.",
        "bangla": f"আমরা নিশ্চিত করেছি যে আপনার ওয়ালেট থেকে ৳{amt:,.2f} কাটা হয়েছে, কিন্তু গেটওয়ে টাইমআউটের কারণে মার্চেন্টের কাছে কনফার্মেশন পৌঁছায়নি। আমাদের টিম দ্রুত এটি সমন্বয় করছে।"
    }
