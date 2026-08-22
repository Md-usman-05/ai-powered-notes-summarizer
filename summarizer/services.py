"""Hosted AI summary generation service with no heuristic fallback."""

import os
import re

import requests


MODEL_ID = "facebook/bart-large-cnn"
API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_ID}"
MAX_CHUNK_CHARS = 3_400


class SummaryGenerationError(RuntimeError):
    """Raised when BART-CNN cannot generate a trustworthy summary."""


def generate_summary(text):
    """Generate a saved summary using the hosted AI service only."""
    return _generate_ai_summary(text, max_length=180, min_length=55)


def generate_key_points(text):
    """Generate concise review points from source material using the hosted AI service only.

    The AI creates the content. The final sentence split only presents that
    generated content as accessible list items in the interface.
    """
    generated = _generate_ai_summary(text, max_length=150, min_length=40)
    points = [item.strip(" -•\t") for item in re.split(r"(?<=[.!?])\s+", generated) if len(item.strip()) > 12]
    return points[:6] or [generated]


def _generate_ai_summary(text, *, max_length, min_length):
    token = os.getenv("HF_TOKEN")
    if not token:
        raise SummaryGenerationError("Summary generation is not configured. Add the service token to the backend environment and restart Django.")

    clean_text = " ".join(text.split())
    if len(clean_text) < 40:
        raise SummaryGenerationError("Please provide at least a few complete sentences to summarize.")

    # Do not ask the model for an output close to the source length.  That can
    # cause a faithful summarization model to simply reproduce short inputs.
    # These bounds keep the result concise for short notes and readable for
    # longer documents.
    word_count = len(clean_text.split())
    max_length = min(max_length, max(32, int(word_count * 0.4)))
    min_length = min(min_length, max(14, int(word_count * 0.16)), max_length - 6)

    chunks = _split_into_chunks(clean_text)
    partial_summaries = [_request_bart(chunk, token, max_length=max_length, min_length=min_length) for chunk in chunks]

    # A final BART pass produces one coherent result for multi-page inputs.
    if len(partial_summaries) > 1:
        return _request_bart(" ".join(partial_summaries), token, max_length=max_length, min_length=min_length)
    return partial_summaries[0]


def _request_bart(text, token, *, max_length, min_length):
    try:
        response = requests.post(
            API_URL,
            headers={"Authorization": f"Bearer {token}"},
            json={
                "inputs": text,
                "parameters": {
                    "max_length": max_length,
                    "min_length": min_length,
                    "do_sample": False,
                },
            },
            timeout=60,
        )
    except requests.RequestException as exc:
        raise SummaryGenerationError("Could not reach the summary service. Please try again shortly.") from exc

    try:
        payload = response.json()
    except ValueError as exc:
        raise SummaryGenerationError("The summary service returned an unreadable response. Please try again.") from exc

    if response.status_code >= 400:
        detail = payload.get("error") if isinstance(payload, dict) else None
        raise SummaryGenerationError(detail or "The summary service could not generate a result right now.")

    if isinstance(payload, list) and payload and payload[0].get("summary_text"):
        return payload[0]["summary_text"].strip()

    detail = payload.get("error") if isinstance(payload, dict) else None
    raise SummaryGenerationError(detail or "The summary service did not return a summary. Please try again.")


def _split_into_chunks(text):
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks, current = [], ""
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if len(current) + len(sentence) + 1 > MAX_CHUNK_CHARS and current:
            chunks.append(current)
            current = ""
        current = f"{current} {sentence}".strip()
    if current:
        chunks.append(current)
    return chunks or [text[:MAX_CHUNK_CHARS]]
