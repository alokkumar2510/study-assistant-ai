"""
ai_service.py
-------------
AI integration service powered by Groq (free tier).
Uses the OpenAI-compatible client to call Groq's chat completions endpoint.

Model used: llama-3.3-70b-versatile (free, fast)
API docs:   https://console.groq.com/docs/openai
"""

import os
from openai import OpenAI

# ---------------------------------------------------------------------------
# Groq client setup (OpenAI-compatible, 100% free tier)
# ---------------------------------------------------------------------------
_api_key = os.environ.get("GROQ_API_KEY", "")

client = OpenAI(
    api_key=_api_key,
    base_url="https://api.groq.com/openai/v1",
)

DEEPSEEK_MODEL = "llama-3.3-70b-versatile"

# System prompt that shapes the assistant's personality for a study app
_STUDY_SYSTEM_PROMPT = (
    "You are a smart, friendly, and encouraging AI study assistant embedded in a study app. "
    "Your job is to help students understand concepts, answer questions clearly, give helpful "
    "study tips, and motivate them. Keep answers concise yet thorough. Use markdown formatting "
    "where helpful (e.g. bullet points, bold key terms). Respond in the same language as the user."
)


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------
def _chat(system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
    """
    Internal wrapper that calls DeepSeek chat completions and returns the text reply.

    Args:
        system_prompt: Instruction / persona for the model.
        user_prompt:   The actual user request.
        temperature:   Sampling temperature (0 = deterministic, 1 = creative).

    Returns:
        The model's reply as a plain string.

    Raises:
        Exception: Propagates any API errors so callers can handle them.
    """
    response = client.chat.completions.create(
        model=DEEPSEEK_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=1024,
    )
    return response.choices[0].message.content.strip()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_response(message: str) -> str:
    """
    Generate an AI response to a student's question using DeepSeek.

    Args:
        message: The user's chat message.

    Returns:
        A helpful, human-friendly reply string.
    """
    return _chat(_STUDY_SYSTEM_PROMPT, message)


def generate_flashcards_from_text(text: str, num_cards: int = 5) -> list[dict]:
    """
    Use DeepSeek to generate smart flashcards from a block of study text.

    Args:
        text:      The source text (notes, paragraph, topic description).
        num_cards: How many flashcards to generate.

    Returns:
        A list of {"question": str, "answer": str} dicts.
    """
    prompt = (
        f"Generate exactly {num_cards} flashcard question-and-answer pairs based on the "
        f"following study text. Return ONLY a valid JSON array with this exact structure, "
        f"no extra commentary:\n"
        f'[{{"question": "...", "answer": "..."}}, ...]\n\n'
        f"Study text:\n{text}"
    )
    import json
    raw = _chat(
        "You are a flashcard generator. Always respond with valid JSON only — no markdown fences.",
        prompt,
        temperature=0.5,
    )
    # Strip markdown code fences if the model added them anyway
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]          # drop opening fence line
        raw = raw.rsplit("```", 1)[0].strip()  # drop closing fence
    return json.loads(raw)


def generate_quiz_questions(topic: str, num_questions: int = 5) -> list[dict]:
    """
    Use DeepSeek to generate multiple-choice quiz questions for a topic.

    Args:
        topic:         The subject or topic to quiz on.
        num_questions: Number of questions to generate.

    Returns:
        A list of dicts, each with:
        {
            "question":       str,
            "options":        [str, str, str, str],
            "correct_answer": int   # 0-based index into options
        }
    """
    prompt = (
        f"Generate exactly {num_questions} multiple-choice quiz questions about '{topic}'. "
        f"Each question must have exactly 4 answer options and one correct answer. "
        f"Return ONLY a valid JSON array with this exact structure, no extra text:\n"
        f'[{{"question": "...", "options": ["A...", "B...", "C...", "D..."], "correct_answer": 0}}, ...]\n'
        f"'correct_answer' is the 0-based index of the correct option in the options array."
    )
    import json
    raw = _chat(
        "You are a quiz generator. Always respond with valid JSON only — no markdown fences.",
        prompt,
        temperature=0.6,
    )
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0].strip()
    return json.loads(raw)
