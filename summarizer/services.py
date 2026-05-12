import re


def summarize_notes(text, max_sentences=4):
    cleaned = " ".join(text.split())
    if not cleaned:
        return ""

    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
    if len(sentences) <= max_sentences:
        return cleaned

    keywords = {
        "important",
        "definition",
        "process",
        "steps",
        "types",
        "advantages",
        "disadvantages",
        "example",
        "conclusion",
        "therefore",
        "because",
        "exam",
    }

    scored = []
    for index, sentence in enumerate(sentences):
        words = re.findall(r"[A-Za-z0-9]+", sentence.lower())
        keyword_hits = sum(1 for word in words if word in keywords)
        length_score = min(len(words), 30) / 30
        position_score = 1 if index in (0, len(sentences) - 1) else 0
        scored.append((keyword_hits + length_score + position_score, index, sentence))

    selected = sorted(scored, reverse=True)[:max_sentences]
    selected.sort(key=lambda item: item[1])
    return " ".join(item[2] for item in selected)
