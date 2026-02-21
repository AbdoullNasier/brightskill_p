import json
from .models import BookRecommendation


def parse_book_payload(raw_text):
    # Prefer structured json but allow plain fallback from model output.
    try:
        parsed = json.loads(raw_text)
        return {
            "title": parsed.get("title", "The 7 Habits of Highly Effective People"),
            "author": parsed.get("author", "Stephen R. Covey"),
            "reason": parsed.get("reason", "Practical habits for communication and leadership growth."),
        }
    except Exception:
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        title = "The 7 Habits of Highly Effective People"
        author = "Stephen R. Covey"
        reason = "Practical habits for communication and leadership growth."
        for line in lines:
            if line.lower().startswith("title:"):
                title = line.split(":", 1)[1].strip()
            elif line.lower().startswith("author:"):
                author = line.split(":", 1)[1].strip()
            elif line.lower().startswith("reason:"):
                reason = line.split(":", 1)[1].strip()
        return {"title": title, "author": author, "reason": reason}


def create_book_recommendation(user, topic, source_type, source_id):
    from ai_engine.services import ask_gemini

    prompt = (
        f"Suggest a popular and well-regarded book about {topic} for someone who wants "
        "to improve their soft skills. Provide title, author, and one-sentence reason. "
        "Return strict JSON with keys title, author, reason."
    )

    result = ask_gemini(prompt)
    parsed = parse_book_payload(result)
    recommendation = BookRecommendation.objects.create(
        user=user,
        source_type=source_type,
        source_id=source_id,
        title=parsed["title"],
        author=parsed["author"],
        reason=parsed["reason"],
    )
    return recommendation
