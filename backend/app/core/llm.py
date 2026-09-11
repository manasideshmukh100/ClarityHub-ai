import os
import json
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

class LLMAdapter:
    """
    Provider-agnostic LLM adapter supporting Gemini, OpenAI, Anthropic,
    and a robust Mock fallback for standalone/offline testing.
    """
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()

    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        if self.provider == "gemini" and settings.GEMINI_API_KEY:
            try:
                return await self._call_gemini(system_prompt, user_prompt)
            except Exception as e:
                print(f"[LLMAdapter] Gemini error: {e}. Falling back to mock engine.")
        elif self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                return await self._call_openai(system_prompt, user_prompt)
            except Exception as e:
                print(f"[LLMAdapter] OpenAI error: {e}. Falling back to mock engine.")
        elif self.provider == "anthropic" and settings.ANTHROPIC_API_KEY:
            try:
                return await self._call_anthropic(system_prompt, user_prompt)
            except Exception as e:
                print(f"[LLMAdapter] Anthropic error: {e}. Falling back to mock engine.")
        
        # Fallback / Mock provider logic
        return self._call_mock(system_prompt, user_prompt)

    async def _call_gemini(self, system_prompt: str, user_prompt: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"System Instructions:\n{system_prompt}\n\nUser Question/Input:\n{user_prompt}"}]
                }
            ]
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    async def _call_openai(self, system_prompt: str, user_prompt: str) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def _call_anthropic(self, system_prompt: str, user_prompt: str) -> str:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "claude-3-haiku-20240307",
            "max_tokens": 1000,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}]
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["content"][0]["text"]

    def _call_mock(self, system_prompt: str, user_prompt: str) -> str:
        """
        Smart fallback engine for grounded Q&A, digest generation, and dark-pattern scanning.
        """
        prompt_lower = user_prompt.lower()
        sys_lower = system_prompt.lower()

        if "scan" in sys_lower or "automation agent" in sys_lower or "dark-pattern" in sys_lower:
            return json.dumps({
                "issues_detected": [
                    {
                        "type": "dark_pattern",
                        "subscription": "StreamMax Premium",
                        "reason": "Hidden cancellation button deep in settings menu and unexpected 25% price hike last month.",
                        "recommended_action": "draft_email",
                        "payload": {
                            "to": "support@streammax.com",
                            "subject": "Cancellation & Refund Request — StreamMax Subscription",
                            "body": "Dear StreamMax Support,\n\nI am writing to immediately cancel my StreamMax Premium subscription. I noticed an unannounced price hike from $14.99 to $18.99/mo. Please confirm the cancellation and refund the recent unauthorized charge.\n\nThank you,\nAccount Owner"
                        }
                    },
                    {
                        "type": "upcoming_renewal",
                        "subscription": "FitGym Annual Pass",
                        "reason": "Annual renewal of $499.00 due in 7 days with zero gym visits recorded in 90 days.",
                        "recommended_action": "draft_email",
                        "payload": {
                            "to": "cancellations@fitgym.com",
                            "subject": "Notice of Non-Renewal for Membership #88391",
                            "body": "To Whom It May Concern,\n\nPlease accept this letter as formal notice that I do not wish to renew my FitGym Annual Pass ending on the upcoming renewal date. Please confirm no further billing will occur.\n\nSincerely,\nAccount Owner"
                        }
                    },
                    {
                        "type": "medication_refill",
                        "subscription": "Lipitor Prescription",
                        "reason": "Prescription warranty/refill window closes in 5 days.",
                        "recommended_action": "create_reminder",
                        "payload": {
                            "title": "Refill Lipitor Prescription at CVS Pharmacy",
                            "due_date": "In 3 days"
                        }
                    }
                ],
                "annual_waste_estimate": 788.00
            })

        if "digest" in sys_lower or "life digest" in prompt_lower:
            return """### 📅 Your Weekly Life Digest

**Highlights & Action Items for this week:**
- 🚨 **Price Hike Alert:** StreamMax Premium increased by 25% to $18.99/mo without prior email notice.
- 🏋️ **Gym Renewal Notice:** FitGym Annual Membership ($499.00) renews in 7 days.
- 💊 **Rx Refill Due:** Prescription refill for Lipitor is due by Friday.
- 💡 **Estimated Annual Savings Opportunity:** $788.00/yr by resolving flagged subscriptions.
"""

        # General RAG Q&A grounded answer mock
        return f"Based on your uploaded documents, here is the answer to your query: {user_prompt}\n\n[Citation: Document Vault Entry]"

llm_adapter = LLMAdapter()
