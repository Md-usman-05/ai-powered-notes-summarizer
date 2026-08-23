"""Hosted AI summary generation service using Qwen instruction model."""

import os
import re

import requests


MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
API_URL = "https://router.huggingface.co/v1/chat/completions"

# Keep chunks reasonably sized so the hosted model has room
# for instructions and generated output.
MAX_CHUNK_CHARS = 12_000


class SummaryGenerationError(RuntimeError):
    """Raised when the hosted AI service cannot generate a reliable result."""


SYSTEM_PROMPT = """
You are NoteMind, an academic notes summarization assistant.

Your job is to summarize ONLY the information provided by the user.

Accuracy rules:
- Never invent facts.
- Never add information that is not present in the source.
- Do not use outside knowledge.
- Preserve important technical terms.
- Preserve important definitions.
- Preserve formulas, equations, dates, names, classifications, and relationships when present.
- Do not change the meaning of the source.
- Remove repetition and unnecessary wording.
- Organize related ideas together.
- Write clear, natural English suitable for a college student revising for an exam.
- Prefer concise paragraphs with meaningful structure.
- If the source contains uncertainty, preserve that uncertainty.
"""


def generate_summary(text):
    """Generate a concise, source-grounded academic summary."""
    return _generate_ai_summary(
        text,
        max_tokens=450,
    )


def generate_key_points(text):
    """Generate concise study points using the hosted AI model."""

    clean_text = _clean_text(text)

    if len(clean_text) < 40:
        raise SummaryGenerationError(
            "Please provide at least a few complete sentences to summarize."
        )

    token = _get_token()

    prompt = f"""
Create 5 to 6 important study points from the following notes.

Rules:
- Use ONLY information present in the notes.
- Do not introduce outside facts.
- Do not invent examples.
- Keep each point concise.
- Preserve important technical terminology.
- Include important definitions, concepts, formulas, processes, or conclusions when present.
- Return ONLY the bullet points.
- Start every point with "-".

SOURCE NOTES:

{clean_text}
"""

    generated = _request_qwen(
        prompt,
        token,
        max_tokens=350,
    )

    points = []

    for line in generated.splitlines():
        line = line.strip()

        if not line:
            continue

        line = re.sub(
            r"^(?:[-•*]|\d+[.)])\s*",
            "",
            line,
        ).strip()

        if len(line) > 12:
            points.append(line)

    if points:
        return points[:6]

    # Safe fallback only for formatting the AI-generated response.
    sentences = re.split(
        r"(?<=[.!?])\s+",
        generated,
    )

    points = [
        sentence.strip()
        for sentence in sentences
        if len(sentence.strip()) > 12
    ]

    return points[:6] or [generated.strip()]


def _generate_ai_summary(text, *, max_tokens):
    token = _get_token()

    clean_text = _clean_text(text)

    if len(clean_text) < 40:
        raise SummaryGenerationError(
            "Please provide at least a few complete sentences to summarize."
        )

    chunks = _split_into_chunks(clean_text)

    partial_summaries = []

    for chunk in chunks:
        prompt = f"""
Summarize the following academic notes.

Requirements:
- Keep only the important information.
- Do not invent or assume anything.
- Preserve definitions, technical terms, formulas, dates, names,
  processes, classifications, and important relationships.
- Remove repetition.
- Make the summary substantially shorter than the source.
- Write clear study-friendly English.
- Use short paragraphs.
- Do not mention that you are an AI.
- Do not refer to these instructions.

SOURCE:

{chunk}
"""

        summary = _request_qwen(
            prompt,
            token,
            max_tokens=max_tokens,
        )

        partial_summaries.append(summary.strip())

    if not partial_summaries:
        raise SummaryGenerationError(
            "The summary service did not return any usable content."
        )

    # One final synthesis pass for multi-chunk documents.
    if len(partial_summaries) > 1:
        combined = "\n\n".join(partial_summaries)

        # Prevent an excessively large synthesis request.
        combined = combined[:MAX_CHUNK_CHARS * 2]

        final_prompt = f"""
Create one coherent academic summary from the following AI-generated
section summaries.

Important:
- Use ONLY information contained in these section summaries.
- Do not add outside knowledge.
- Do not invent details.
- Remove duplicated information.
- Preserve important technical terminology.
- Preserve formulas, definitions, dates, names, and relationships.
- Combine related ideas logically.
- Make the result concise but complete enough for exam revision.
- Do not mention the section summaries or these instructions.

SECTION SUMMARIES:

{combined}
"""

        return _request_qwen(
            final_prompt,
            token,
            max_tokens=max_tokens,
        ).strip()

    return partial_summaries[0]


def _request_qwen(prompt, token, *, max_tokens):
    """Call Hugging Face's OpenAI-compatible chat-completion endpoint."""

    try:
        response = requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL_ID,
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                "temperature": 0.1,
                "top_p": 0.9,
                "max_tokens": max_tokens,
            },
            timeout=120,
        )

    except requests.RequestException as exc:
        raise SummaryGenerationError(
            "Could not reach the AI summary service. Please try again shortly."
        ) from exc

    try:
        payload = response.json()
    except ValueError as exc:
        raise SummaryGenerationError(
            "The AI summary service returned an unreadable response."
        ) from exc

    if response.status_code >= 400:
        detail = None

        if isinstance(payload, dict):
            error = payload.get("error")

            if isinstance(error, dict):
                detail = (
                    error.get("message")
                    or error.get("error")
                )
            else:
                detail = error

        raise SummaryGenerationError(
            detail
            or "The AI summary service could not generate a result right now."
        )

    try:
        content = (
            payload["choices"][0]["message"]["content"]
        )

    except (
        KeyError,
        IndexError,
        TypeError,
    ) as exc:
        raise SummaryGenerationError(
            "The AI summary service returned an unexpected response."
        ) from exc

    if not content or not content.strip():
        raise SummaryGenerationError(
            "The AI summary service returned an empty result."
        )

    return content.strip()


def _get_token():
    token = os.getenv("HF_TOKEN")

    if not token:
        raise SummaryGenerationError(
            "Summary generation is not configured. "
            "Add HF_TOKEN to the backend environment and restart Django."
        )

    return token


def _clean_text(text):
    return " ".join(str(text).split()).strip()


def _split_into_chunks(text):
    """
    Split on sentence boundaries where possible.

    This is intentionally larger than the old BART chunks because
    Qwen is an instruction-following model rather than a short
    sequence-to-sequence summarizer.
    """

    sentences = re.split(
        r"(?<=[.!?])\s+",
        text,
    )

    chunks = []
    current = ""

    for sentence in sentences:
        sentence = sentence.strip()

        if not sentence:
            continue

        proposed = (
            f"{current} {sentence}".strip()
        )

        if (
            len(proposed) > MAX_CHUNK_CHARS
            and current
        ):
            chunks.append(current)
            current = sentence
        else:
            current = proposed

    if current:
        chunks.append(current)

    return chunks or [text[:MAX_CHUNK_CHARS]]