import os
import requests

API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn"

headers = {
    "Authorization": f"Bearer {os.getenv('HF_TOKEN')}"
}


def generate_summary(text):

    payload = {
        "inputs": text,
        "parameters": {
            "max_length": 180,
            "min_length": 60,
            "do_sample": False
        }
    }

    try:

        response = requests.post(
            API_URL,
            headers=headers,
            json=payload
        )

        print("STATUS:", response.status_code)
        print("TEXT:", response.text)

        result = response.json()

        if isinstance(result, list):

            summary = result[0]["summary_text"]

            bullet_points = generate_bullet_points(text)

            final_output = f"""
 SUMMARY

{summary}


KEY POINTS

{bullet_points}
"""

            return final_output

        elif isinstance(result, dict):

            return result.get(
                "error",
                "Unable to generate summary."
            )

        return "Unexpected response."

    except Exception as e:

        return f"Error: {str(e)}"


def generate_bullet_points(text):

    sentences = text.split(".")

    points = []

    for sentence in sentences[:6]:

        sentence = sentence.strip()

        if len(sentence) > 20:

            points.append(f"• {sentence}")

    return "\n".join(points)