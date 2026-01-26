import os
import re
import time
from collections import Counter
from google import genai
from pinecone import Pinecone
from dotenv import load_dotenv
from pathlib import Path

# 1. Path setup & .env load
base_path = Path(__file__).resolve().parent
load_dotenv(dotenv_path=base_path / ".env")

# 2. Initialize Clients
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
index = pc.Index(os.getenv('PINECONE_INDEX_NAME', 'jarvis-knowledge'))

print("✅ API Keys & Pinecone connected successfully.")

# Simple in-memory user profile for adaptive prompting
USER_PROFILE = {
    "tone": "friendly",           # friendly | formal | concise
    "depth": "medium",           # short | medium | deep
    "skill": "intermediate",     # beginner | intermediate | expert
    "language": "ta-en",         # ta-en for Tamil-English mix
}

# Lightweight task detection to select prompt style
def detect_task(user_input: str) -> str:
    lower = user_input.lower()
    if any(kw in lower for kw in ["code", "bug", "error", "stack trace", "exception", "function", "class"]):
        return "debug"
    if re.search(r"\bmath|integral|derivative|solve|equation|%|\d+\s*[+\-*/^]", lower):
        return "math"
    if any(kw in lower for kw in ["summarize", "summary", "tl;dr", "bullet"]):
        return "summary"
    if any(kw in lower for kw in ["plan", "steps", "roadmap", "break down"]):
        return "plan"
    return "tutor"

def get_context(query):
    """Pinecone memory search with confidence scoring and metadata."""
    res = client.models.embed_content(model='text-embedding-004', contents=query)
    query_emb = res.embeddings[0].values

    results = index.query(vector=query_emb, top_k=5, include_metadata=True)

    snippets = []
    for match in results.get('matches', []):
        meta = match.get('metadata', {})
        score = match.get('score', 0.0)
        # Convert similarity to a simple 0-1 confidence (assume score already similarity)
        confidence = max(0.0, min(1.0, score))
        snippets.append({
            "title": meta.get('title', 'No Title'),
            "source": meta.get('source', 'Unknown'),
            "date": meta.get('date'),
            "text": meta.get('text') or meta.get('chunk') or meta.get('content', ''),
            "confidence": confidence
        })

    # Sort by confidence and keep top 3
    snippets = sorted(snippets, key=lambda s: s['confidence'], reverse=True)[:3]

    context_text = ""
    for snip in snippets:
        line = f"- {snip['title']} (Source: {snip['source']})"
        if snip.get('date'):
            line += f" [{snip['date']}]"
        line += f" [conf: {snip['confidence']:.2f}]"
        context_text += "\n" + line
    
    return context_text.strip(), snippets


def summarize_context(snippets):
    """Create a short textual context for the model."""
    lines = []
    for snip in snippets:
        text = (snip.get('text') or '')[:300]
        lines.append(f"{snip['title']} | {snip['source']} | conf {snip['confidence']:.2f}: {text}")
    return "\n".join(lines)

def build_prompt(user_input: str, context_text: str, snippet_text: str, task: str) -> str:
    tone = USER_PROFILE.get("tone", "friendly")
    depth = USER_PROFILE.get("depth", "medium")
    skill = USER_PROFILE.get("skill", "intermediate")
    lang = USER_PROFILE.get("language", "ta-en")

    style_map = {
        "tutor": "Be explanatory, use examples.",
        "debug": "Be concise, show steps to reproduce, hypothesize causes, propose fixes.",
        "summary": "Return a short bullet summary first.",
        "plan": "List steps in order, then highlight risks.",
        "math": "Show the formula and final value."
    }
    style = style_map.get(task, style_map["tutor"])

    depth_text = {
        "short": "Keep it under 5 bullets.",
        "medium": "Keep it crisp, 5-8 bullets max.",
        "deep": "Provide deeper reasoning but stay structured."
    }.get(depth, "Keep it crisp.")

    language_hint = "Answer in Tamil-English mix" if lang == "ta-en" else "Answer in English"

    return f"""
You are JARVIS. {language_hint}. Tone: {tone}. Skill level of user: {skill}. {style} {depth_text}

Context (high-confidence snippets):
{snippet_text or context_text or "[no context found]"}

Question: {user_input}

Guidelines:
- Cite source names if available.
- If context is weak, say what is unverified.
- If a plan is needed, list steps then give a short answer.
"""


def self_check(answer: str, snippets) -> float:
    """Simple overlap score between answer and context to guard hallucinations."""
    if not snippets:
        return 1.0
    ctx = " ".join([snip.get('text', '') for snip in snippets])
    def keywords(text):
        words = re.findall(r"[a-zA-Z]{4,}", text.lower())
        return Counter(words)
    a_kw = keywords(answer)
    c_kw = keywords(ctx)
    if not a_kw or not c_kw:
        return 0.5
    overlap = sum((a_kw & c_kw).values())
    norm = max(1, sum(a_kw.values()))
    return overlap / norm


def try_math_tool(user_input: str):
    """Evaluate simple math expressions with sympy if present."""
    if not re.search(r"[\d][\d\s+\-*/^().]*", user_input):
        return None
    try:
        import sympy as sp
        expr = sp.sympify(user_input)
        result = sp.simplify(expr)
        return f"Computed result: {result}"
    except Exception:
        return None


def jarvis_talk():
    print("\n🤖 JARVIS: Online. Inniku tech news pathi kelunga nanba!")
    print("-" * 60)

    while True:
        user_input = input("\n👤 YOU: ")
        
        if user_input.lower() in ['exit', 'quit', 'bye']:
            print("🤖 JARVIS: Bye nanba! See you soon.")
            break

        try:
            t0 = time.perf_counter()

            # 0. Quick math tool if applicable
            math_ans = try_math_tool(user_input)
            
            # 1. Memory retrieval
            context_text, snippets = get_context(user_input)
            snippet_text = summarize_context(snippets)

            # 2. Adaptive prompt
            task = detect_task(user_input)
            prompt = build_prompt(user_input, context_text, snippet_text, task)

            # 3. Generate response (Gemini 2.0 Flash)
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            answer = response.text

            # 4. Self-check & optional regenerate if context exists and overlap is low
            overlap = self_check(answer, snippets)
            if snippets and overlap < 0.12:
                regen_prompt = prompt + "\nContext adherence was low. Regenerate with explicit citations from the above context."
                regen = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=regen_prompt
                )
                answer = regen.text

            # 5. If math tool produced result, prepend it
            if math_ans:
                answer = math_ans + "\n\n" + answer

            latency = (time.perf_counter() - t0) * 1000

            print(f"\n🤖 JARVIS [{task} | {latency:.0f} ms]: {answer}")

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    jarvis_talk()