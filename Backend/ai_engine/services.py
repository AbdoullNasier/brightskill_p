import re

from decouple import config
from google import genai
from google.genai import types


SOFT_SKILLS_TOPICS = {
    "communication",
    "leadership",
    "teamwork",
    "conflict",
    "time management",
    "emotional intelligence",
    "critical thinking",
    "adaptability",
    "public speaking",
    "negotiation",
    "productivity",
    "career growth",
    "personal development",
    "soft skills",
}

OFF_TOPIC_HINTS = {
    "crypto",
    "stock",
    "politics",
    "sports betting",
    "adult",
    "hacking",
    "malware",
    "torrent",
}

_client = None


def is_off_topic(user_prompt):
    normalized = re.sub(r"\s+", " ", user_prompt.lower()).strip()
    if any(term in normalized for term in OFF_TOPIC_HINTS):
        return True
    return not any(topic in normalized for topic in SOFT_SKILLS_TOPICS)


def preprocess_user_prompt(user_prompt):
    system_instruction = "You are an AI that only discusses soft skills and personal development."
    if is_off_topic(user_prompt):
        return (
            f"{system_instruction} The user asked an off-topic question: {user_prompt}. "
            "Respond politely redirecting to soft skills."
        )
    return f"{system_instruction} {user_prompt}"


def _get_client():
    global _client
    api_key = config("GEMINI_API_KEY", default="")
    if not api_key:
        return None

    if _client is None:
        _client = genai.Client(api_key=api_key)
    return _client


def ask_gemini(prompt, max_output_tokens=180, temperature=0.4, timeout_seconds=12):
    client = _get_client()
    if client is None:
        return "I can help with soft skills coaching, but the AI service key is not configured yet."

    try:
        response = client.models.generate_content(
            model=config("GEMINI_MODEL", default="gemini-2.0-flash"),
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        return (
            getattr(response, "text", "")
            or "I can help you improve communication, leadership, and other soft skills."
        ).strip()
    except Exception:
        return "I could not reach the AI service right now. Please try again in a moment."
