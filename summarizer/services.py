import os
import re

import requests


API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn"


def generate_summary(text):
    if not os.getenv("HF_TOKEN"):
        return generate_local_summary(text)

    payload = {
        "inputs": text,
        "parameters": {
            "max_length": 180,
            "min_length": 60,
            "do_sample": False,
        },
    }

    try:
        response = requests.post(
            API_URL,
            headers={"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"},
            json=payload,
            timeout=30,
        )

        result = response.json()

        if isinstance(result, list) and result:
            summary = result[0]["summary_text"]
            bullet_points = generate_bullet_points(text)

            return f"""
SUMMARY

{summary}


KEY POINTS

{bullet_points}
""".strip()

        if isinstance(result, dict):
            return result.get("error", "Unable to generate summary.")

        return "Unexpected response."

    except Exception as e:
        return f"Error: {str(e)}"


def generate_bullet_points(text):
    sentences = text.split(".")
    points = []

    for sentence in sentences[:6]:
        sentence = sentence.strip()

        if len(sentence) > 20:
            points.append(f"- {sentence}")

    return "\n".join(points)


def generate_local_summary(text):
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+", text.strip())
        if sentence.strip()
    ]

    if not sentences:
        return "Please add notes before generating a summary."

    summary_sentences = sentences[:3]
    bullet_points = generate_bullet_points(text)

    return f"""
SUMMARY

{" ".join(summary_sentences)}


KEY POINTS

{bullet_points or "- " + sentences[0]}
""".strip()
