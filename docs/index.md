# Invisible Mentors

**A production-ready pipeline that mentors contributors automatically — so maintainers can focus on building.**

---

Open source projects thrive when contributors feel supported. But as a project grows, the time required to review documentation, correct jargon, and coach new contributors grows with it. Eventually, the maintainer becomes the bottleneck.

Invisible Mentors removes that bottleneck. Every pull request is reviewed automatically by a two-layer system: **Vale** scans for jargon and unclear writing, and **Gemini AI** rewrites flagged passages and posts the suggestions directly to the PR as a comment.

The contributor gets feedback in seconds. The maintainer's time is protected.

---

## What This Site Covers

- **[Contributor Onboarding Guide](onboarding.md)** — How to contribute to this project and understand the pipeline

---

## How the Pipeline Works

When a contributor opens a pull request:

1. Vale scans all files in `docs/` against the project's jargon ruleset
2. If no issues are found, the documentation deploys automatically to this site
3. If jargon is detected, Gemini AI generates a structured rewrite and posts it to the PR as a comment
4. The contributor revises and pushes — the pipeline re-runs automatically
5. Once the writing is clean, the docs deploy

**No manual review needed until the writing is already clear.**

---

## The Project at a Glance

| What | Details |
|:---|:---|
| **Repository** | [github.com/saisravan909/Invisible-Mentors](https://github.com/saisravan909/Invisible-Mentors) |
| **License** | MIT — free to use, adapt, and redistribute |
| **AI Model** | Gemini 2.5 Flash via Google AI Studio |
| **Prose Linter** | Vale with custom jargon ruleset |
| **Conference** | Linux Foundation Open Source Summit, May 2026 |

---

*Built by **Sai Sravan Cherukuri**, Enterprise Modernization Architect.*
