import re
from typing import Dict, Any, List

def analyze_subscription_dark_pattern(sub_name: str, cancel_text: str, monthly_cost: float, last_price: float) -> Dict[str, Any]:
    """
    Analyzes subscription cancellation flow text and price changes to detect dark patterns.
    """
    is_dark_pattern = False
    reasons = []
    score = 1

    # Check price hike
    if last_price and last_price > 0 and monthly_cost > last_price:
        increase_pct = ((monthly_cost - last_price) / last_price) * 100
        if increase_pct >= 10:
            is_dark_pattern = True
            score += 2
            reasons.append(f"Silent price increase of {increase_pct:.1f}% (from ${last_price:.2f} to ${monthly_cost:.2f}/mo).")

    # Check cancellation wording heuristics
    text_lower = cancel_text.lower()
    dark_pattern_keywords = [
        "call customer service to cancel",
        "phone only",
        "chat with live agent during business hours",
        "written letter required",
        "certified mail",
        "cancellation fee",
        "early termination penalty",
        "multi-step exit survey required"
    ]

    for kw in dark_pattern_keywords:
        if kw in text_lower:
            is_dark_pattern = True
            score += 2
            reasons.append(f"Hard-to-exit cancellation requirement: '{kw}'.")

    score = min(score, 5)

    return {
        "is_dark_pattern": is_dark_pattern,
        "difficulty_score": score,
        "reasons": reasons,
        "recommended_action": "Draft formal cancellation & price-hike complaint email"
    }
