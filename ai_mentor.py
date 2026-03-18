"""
ai_mentor.py — Invisible Mentor CLI
Reads documentation text, sends it to Gemini AI, and returns either a
full Analysis + Refactored Version, a Markdown Audit Table, or a clean
Markdown PR comment report.

Usage (local):
  export GEMINI_API_KEY="your-key-here"
  python ai_mentor.py                             # demo — full analysis
  python ai_mentor.py "your text here"            # inline text — full analysis
  python ai_mentor.py --file docs/onboarding.md  # file — full analysis
  python ai_mentor.py --table                     # demo — markdown audit table
  python ai_mentor.py --table --file docs/x.md   # file — markdown audit table

Usage (GitHub Actions — PR comment):
  python ai_mentor.py --pr --file docs/onboarding.md > mentor_report.md
  This writes clean Markdown (no decorators) so the sticky-comment bot
  can post it directly to the Pull Request.

Note: This script is designed for CI/CD pipelines and local development.
      The GEMINI_API_KEY must be set as an environment variable or GitHub Secret.
"""

from google import genai
from google.genai import types
import os
import re
import sys
import pathlib

# ── Configuration ─────────────────────────────────────────────────────────────

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable is not set.")
    print("  • Local:  export GEMINI_API_KEY='your-key-from-aistudio.google.com'")
    print("  • CI/CD:  add GEMINI_API_KEY as a GitHub Actions repository secret")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)

# ── Load system prompt from mentor_persona.txt ────────────────────────────────

PERSONA_FILE = pathlib.Path(__file__).parent / "mentor_persona.txt"
if not PERSONA_FILE.exists():
    print(f"ERROR: {PERSONA_FILE} not found. Make sure it lives alongside ai_mentor.py.")
    sys.exit(1)

SYSTEM_PROMPT = PERSONA_FILE.read_text(encoding="utf-8").strip()

# ── Demo text ─────────────────────────────────────────────────────────────────

DEMO_TEXT = (
    "We must utilize our existing paradigms to leverage the robust infrastructure "
    "and synergize cross-functional teams, enabling us to deliver best-in-class, "
    "scalable solutions that move the needle on our actionable deliverables."
)

# ── Mode 1: Full analysis + refactored version ────────────────────────────────

def refactor_docs(text: str) -> dict:
    """Returns {"analysis": str, "refactored": str, "raw": str}"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=text.strip(),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            max_output_tokens=8192,
        ),
    )
    raw = response.text or ""

    analysis_match = re.search(
        r"#+\s*Analysis[\s\S]*?\n([\s\S]*?)(?=#+\s*Refactored Version|$)",
        raw, re.IGNORECASE,
    )
    refactored_match = re.search(
        r"#+\s*Refactored Version[\s\S]*?\n([\s\S]*?)$",
        raw, re.IGNORECASE,
    )

    return {
        "analysis":   (analysis_match.group(1).strip()   if analysis_match   else ""),
        "refactored": (refactored_match.group(1).strip() if refactored_match else raw.strip()),
        "raw":        raw,
    }


def print_full_result(result: dict, original: str) -> None:
    SEP = "─" * 60
    print(f"\n{SEP}")
    print("ORIGINAL TEXT")
    print(SEP)
    print(original.strip())

    if result["analysis"]:
        print(f"\n{SEP}")
        print("MENTOR ANALYSIS")
        print(SEP)
        print(result["analysis"])

    print(f"\n{SEP}")
    print("REFACTORED VERSION")
    print(SEP)
    print(result["refactored"])
    print(f"{SEP}\n")


# ── Mode 2: Markdown Audit Table ──────────────────────────────────────────────

TABLE_PROMPT = """\
Act as an Enterprise Modernization Architect.
Analyze the following text and output your response EXCLUSIVELY as a \
Markdown table with exactly these three columns:

| Original Phrase | Issue Identified | Suggested Refactor |
| :--- | :--- | :--- |

Rules:
- One row per problematic phrase or sentence fragment.
- "Original Phrase" — quote the exact words from the source text.
- "Issue Identified" — name the problem concisely (e.g. Corporate Jargon, \
Passive Voice, Vague Language).
- "Suggested Refactor" — provide a short, plain-language replacement.
- Output ONLY the table. No intro text, no summary, no extra commentary.

TEXT:
"""

def audit_table(text: str) -> str:
    """Ask Gemini to produce a pure Markdown audit table and return it."""
    prompt = TABLE_PROMPT + text.strip()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=4096,
        ),
    )
    return (response.text or "").strip()


def print_audit_table(table: str, source_label: str) -> None:
    SEP = "═" * 60
    print(f"\n{SEP}")
    print(f"  INVISIBLE MENTOR — JARGON AUDIT TABLE")
    print(f"  Source: {source_label}")
    print(f"{SEP}\n")
    print(table)
    print(f"\n{SEP}\n")


# ── Mode 3: Clean Markdown PR comment ─────────────────────────────────────────

def pr_comment(text: str, source_label: str) -> str:
    """
    Returns a fully-rendered Markdown string suitable for posting as a
    GitHub Pull Request comment via sticky-pull-request-comment.
    No shell decorators — pure Markdown only.
    """
    table = audit_table(text)
    lines = [
        "## 🏛️ Invisible Mentor — Documentation Audit",
        "",
        f"> **Source file reviewed:** `{source_label}`",
        "",
        "Your Invisible Mentor scanned this document and found the following "
        "phrases that should be simplified before merging:",
        "",
        table,
        "",
        "---",
        "",
        "*Fix the items above, push again, and this comment will update "
        "automatically. — Powered by [Gemini AI](https://aistudio.google.com)*",
    ]
    return "\n".join(lines)


# ── Argument parsing ───────────────────────────────────────────────────────────

def parse_args():
    """
    Returns (mode, text, source_label)
    mode is "full", "table", or "pr"
    """
    args = sys.argv[1:]
    mode = "full"
    filepath = None

    if "--pr" in args:
        mode = "pr"
        args.remove("--pr")
    elif "--table" in args:
        mode = "table"
        args.remove("--table")

    if "--file" in args:
        idx = args.index("--file")
        if idx + 1 >= len(args):
            print("ERROR: --file requires a path argument.")
            sys.exit(1)
        filepath = pathlib.Path(args[idx + 1])
        if not filepath.exists():
            print(f"ERROR: File not found: {filepath}")
            sys.exit(1)
        text = filepath.read_text(encoding="utf-8")
        label = str(filepath)
    elif args:
        text = " ".join(args)
        label = "inline text"
    else:
        text = DEMO_TEXT
        label = "built-in demo"
        print(f"No input given — running {label}...\n")

    return mode, text, label


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mode, text, label = parse_args()

    if mode == "pr":
        # Pure Markdown output — pipe to a file for the PR comment bot
        print(pr_comment(text, label))
    elif mode == "table":
        table = audit_table(text)
        print_audit_table(table, label)
    else:
        result = refactor_docs(text)
        print_full_result(result, text)
