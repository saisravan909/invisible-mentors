import { useState, useMemo } from "react";

type PageKey = "home" | "onboarding" | "score" | "refactor";

const NAV_ITEMS: { key: PageKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "onboarding", label: "Onboarding Guide" },
  { key: "score", label: "📊 Quality Score" },
  { key: "refactor", label: "✨ Refactor Bot" },
];

const JARGON_TERMS = [
  "best-in-class",
  "cutting-edge",
  "paradigm shift",
  "circle back",
  "deep dive",
  "move the needle",
  "boil the ocean",
  "utilize",
  "leverage",
  "paradigm",
  "synergy",
  "robust",
  "seamless",
  "scalable",
  "actionable",
];

function buildJargonRegex() {
  const sorted = [...JARGON_TERMS].sort((a, b) => b.length - a.length);
  const pattern = sorted.map((t) => t.replace(/[-]/g, "\\$&")).join("|");
  return new RegExp(`(${pattern})`, "gi");
}

function highlightJargon(text: string): React.ReactNode {
  const regex = buildJargonRegex();
  const parts = text.split(regex);
  const testRegex = new RegExp(`^(${JARGON_TERMS.map((t) => t.replace(/[-]/g, "\\$&")).join("|")})$`, "i");
  return parts.map((part, i) =>
    testRegex.test(part) ? (
      <mark
        key={i}
        title="Jargon detected"
        style={{
          background: "#ffcdd2",
          color: "#b71c1c",
          borderRadius: 3,
          padding: "1px 4px",
          fontWeight: 600,
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const cleaned = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const m = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}

function analyzeText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const wordList = trimmed.match(/\b\w+\b/g) ?? [];
  const wordCount = wordList.length;
  const sentenceCount = Math.max(1, (trimmed.match(/[.!?]+/g) ?? []).length);
  const syllableCount = wordList.reduce((s, w) => s + countSyllables(w), 0);

  const fkGrade =
    wordCount < 2
      ? 12
      : Math.round(
          0.39 * (wordCount / sentenceCount) +
            11.8 * (syllableCount / wordCount) -
            15.59
        );

  const jargonRegex = buildJargonRegex();
  const foundJargon: string[] = [];
  let m: RegExpExecArray | null;
  jargonRegex.lastIndex = 0;
  while ((m = jargonRegex.exec(trimmed)) !== null) {
    foundJargon.push(m[0]);
  }

  const jargonPenalty = Math.min(foundJargon.length * 1.5, 6);
  const effectiveGrade = Math.max(1, fkGrade + jargonPenalty);

  return { wordCount, sentenceCount, fkGrade, foundJargon, effectiveGrade };
}

function gradeInfo(grade: number) {
  if (grade <= 6) return { label: "Excellent", color: "#1b5e20", bg: "#e8f5e9", border: "#a5d6a7", ring: "#43a047" };
  if (grade <= 8) return { label: "Good", color: "#1565c0", bg: "#e3f2fd", border: "#90caf9", ring: "#1976d2" };
  if (grade <= 11) return { label: "Needs Work", color: "#e65100", bg: "#fff3e0", border: "#ffcc80", ring: "#fb8c00" };
  return { label: "Poor", color: "#b71c1c", bg: "#ffebee", border: "#ef9a9a", ring: "#e53935" };
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e0e0e0",
        borderRadius: 10,
        padding: "18px 24px",
        textAlign: "center",
        flex: 1,
        minWidth: 100,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: "#001f3f" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function QualityScorePage() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState("");

  const result = useMemo(() => analyzeText(submitted), [submitted]);
  const info = result ? gradeInfo(result.effectiveGrade) : null;

  const EXAMPLE =
    "We need to leverage our core paradigms to synergize cross-functional teams and utilize best-in-class solutions. By doing a deep dive into the actionable deliverables, we can move the needle on our robust, scalable platform.";

  return (
    <div>
      <h1>📊 Quality Score</h1>
      <p>
        Paste any documentation text to get an instant readability grade — powered by the
        Flesch-Kincaid formula and jargon detection.
      </p>

      <button
        onClick={() => { setText(EXAMPLE); setSubmitted(EXAMPLE); }}
        style={{ marginBottom: 16, padding: "6px 14px", background: "transparent", border: "1px solid #0074D9", color: "#0074D9", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
      >
        Load example →
      </button>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your documentation text here..."
        style={{ width: "100%", minHeight: 120, padding: 14, borderRadius: 8, border: "1px solid #ddd", fontSize: 15, lineHeight: 1.6, fontFamily: "sans-serif", resize: "vertical", boxSizing: "border-box" }}
      />

      <button
        onClick={() => setSubmitted(text)}
        disabled={!text.trim()}
        style={{ marginTop: 12, padding: "10px 24px", background: text.trim() ? "#001f3f" : "#ccc", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: text.trim() ? "pointer" : "default" }}
      >
        Analyze →
      </button>

      {result && info && (
        <div style={{ marginTop: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                border: `6px solid ${info.ring}`,
                background: info.bg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 13, color: info.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Grade</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: info.color, lineHeight: 1 }}>{Math.round(result.effectiveGrade)}</div>
            </div>

            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: info.color }}>{info.label}</div>
              <div style={{ fontSize: 15, color: "#555", marginTop: 6 }}>
                Flesch-Kincaid Grade {result.fkGrade}
                {result.foundJargon.length > 0 && (
                  <> · +{result.foundJargon.length} jargon {result.foundJargon.length === 1 ? "word" : "words"} detected</>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: "#888" }}>
                {result.effectiveGrade <= 8 && "Great job — this is easy to read and jargon-free."}
                {result.effectiveGrade > 8 && result.effectiveGrade <= 11 && "Readable but could be simplified further."}
                {result.effectiveGrade > 11 && "This text is hard to read. Try the Refactor Bot to improve it."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
            <StatCard value={result.wordCount} label="Words" />
            <StatCard value={result.sentenceCount} label="Sentences" />
            <StatCard value={result.foundJargon.length} label="Jargon Found" />
            <StatCard value={`${Math.round((result.wordCount / Math.max(1, result.sentenceCount)) * 10) / 10}`} label="Avg Words/Sentence" />
          </div>

          {result.foundJargon.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "#b71c1c" }}>⚠ Jargon detected</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[...new Set(result.foundJargon.map((w) => w.toLowerCase()))].map((w) => (
                  <span
                    key={w}
                    style={{ background: "#ffcdd2", color: "#b71c1c", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "#555" }}>Your text (jargon highlighted)</h3>
          <div
            style={{ padding: 20, background: "white", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 15, lineHeight: 1.8 }}
          >
            {highlightJargon(submitted)}
          </div>
        </div>
      )}
    </div>
  );
}

function RefactorPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"before" | "after">("after");

  const handleRefactor = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setAnalysis("");
    setError("");
    setView("after");
    try {
      const res = await fetch("/api/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setOutput(data.rewritten);
        setAnalysis(data.analysis ?? "");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const EXAMPLE =
    "We need to leverage our core paradigms to synergize cross-functional teams and utilize best-in-class solutions to move the needle on our actionable deliverables.";

  const tabBtn = (active: boolean) =>
    ({
      padding: "8px 20px",
      background: active ? "#001f3f" : "white",
      color: active ? "white" : "#555",
      border: "1px solid #ddd",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: active ? 700 : 400,
    } as React.CSSProperties);

  return (
    <div>
      <h1>✨ Refactor Bot</h1>
      <p>
        Paste any jargon-filled text and your Invisible Mentor — powered by Gemini AI — will
        analyse what's wrong and rewrite it in plain, professional language.
      </p>

      <button
        onClick={() => { setInput(EXAMPLE); setOutput(""); setAnalysis(""); }}
        style={{ marginBottom: 16, padding: "6px 14px", background: "transparent", border: "1px solid #0074D9", color: "#0074D9", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
      >
        Load example jargon →
      </button>

      <h3 style={{ margin: "0 0 8px", fontSize: "1rem", color: "#0074D9" }}>Your text</h3>
      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setOutput(""); setAnalysis(""); }}
        placeholder="Paste documentation, emails, or any text filled with corporate jargon..."
        style={{ width: "100%", minHeight: 140, padding: 14, borderRadius: 8, border: "1px solid #ddd", fontSize: 15, lineHeight: 1.6, fontFamily: "sans-serif", resize: "vertical", boxSizing: "border-box" }}
      />

      <button
        onClick={handleRefactor}
        disabled={loading || !input.trim()}
        style={{ marginTop: 14, padding: "12px 28px", background: loading || !input.trim() ? "#ccc" : "#0074D9", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: loading || !input.trim() ? "default" : "pointer" }}
      >
        {loading ? "Your mentor is thinking..." : "Refactor with AI →"}
      </button>

      {error && (
        <div style={{ marginTop: 20, padding: 16, background: "#ffebee", borderRadius: 8, color: "#c62828" }}>
          {error}
        </div>
      )}

      {(output || analysis) && (
        <div style={{ marginTop: 36 }}>
          {analysis && (
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: "#001f3f",
                    color: "white",
                    borderRadius: 6,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Mentor Analysis
                </div>
                <span style={{ fontSize: 13, color: "#888" }}>what your Invisible Mentor found</span>
              </div>
              <div
                style={{
                  padding: 20,
                  background: "#fffde7",
                  border: "1px solid #ffe082",
                  borderLeft: "4px solid #f9a825",
                  borderRadius: 8,
                  fontSize: 14,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  color: "#4a3800",
                }}
              >
                {analysis}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "#0074D9",
                  color: "white",
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Before vs. After
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setView("before")} style={tabBtn(view === "before")}>
                ❌ Before
              </button>
              <button onClick={() => setView("after")} style={tabBtn(view === "after")}>
                ✅ After
              </button>
            </div>
          </div>

          {view === "before" && (
            <div>
              <div style={{ padding: 20, background: "#fff8f8", border: "1px solid #ef9a9a", borderRadius: 8, fontSize: 15, lineHeight: 1.8 }}>
                {highlightJargon(input)}
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: "#b71c1c" }}>
                ⚠ Jargon words highlighted in red
              </div>
            </div>
          )}

          {view === "after" && (
            <div>
              <div style={{ padding: 20, background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 8, fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {output}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#388e3c" }}>✓ Rewritten by your Invisible Mentor</span>
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  style={{ padding: "4px 12px", background: "transparent", border: "1px solid #388e3c", color: "#388e3c", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HomePage() {
  return (
    <div>
      <h1>Invisible Mentors</h1>
      <p>Automated tools that guide contributors to write clearer, simpler documentation — like a mentor that never sleeps.</p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 24 }}>
        {[
          { icon: "📋", title: "Onboarding Guide", desc: "See a real doc with jargon lurking inside." },
          { icon: "📊", title: "Quality Score", desc: "Paste any text and get a readability grade instantly." },
          { icon: "✨", title: "Refactor Bot", desc: "Gemini AI rewrites jargon into plain language." },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ flex: 1, minWidth: 180, background: "white", border: "1px solid #e0e0e0", borderRadius: 10, padding: "20px 18px" }}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <div style={{ fontWeight: 700, color: "#001f3f", marginTop: 8, marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 14, color: "#666" }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnboardingPage() {
  return (
    <div>
      <h1>Contributor Onboarding</h1>
      <p>Welcome! Our goal is to make contributing as easy as possible.</p>
      <h3>Quick Start</h3>
      <ol>
        <li>Fork the repository on GitHub.</li>
        <li>Clone your fork to your local machine.</li>
        <li>
          We encourage you to <strong>utilize</strong> our setup script to{" "}
          <strong>leverage</strong> the latest <strong>paradigms</strong>.
        </li>
      </ol>
      <h3>Why we do this</h3>
      <p>
        We believe that documentation should be a mentor that never sleeps. If
        you see a way to improve this guide, please submit a Pull Request!
      </p>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("home");

  const pageContent: Record<PageKey, React.ReactNode> = {
    home: <HomePage />,
    onboarding: <OnboardingPage />,
    score: <QualityScorePage />,
    refactor: <RefactorPage />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", margin: 0 }}>
      <nav
        style={{ width: 260, background: "#001f3f", color: "white", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 }}
      >
        <div style={{ padding: "0 0 20px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
          <img src="/logo.png" alt="Invisible Mentors" style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ padding: "16px 0" }}>
          {NAV_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 20px",
                background: activePage === key ? "rgba(0,116,217,0.25)" : "transparent",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activePage === key ? 600 : 400,
                borderLeft: activePage === key ? "3px solid #0074D9" : "3px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ flex: 1, padding: "48px 64px", overflowY: "auto", background: "#fafafa", lineHeight: 1.7, color: "#212121" }}>
        <style>{`
          h1 { font-size: 2rem; color: #001f3f; margin-top: 0; margin-bottom: 16px; }
          p { margin-bottom: 16px; }
          ol { padding-left: 24px; }
          ol li { margin-bottom: 10px; }
          strong { color: #c62828; background: #ffebee; padding: 1px 4px; border-radius: 3px; }
        `}</style>
        {pageContent[activePage]}
      </main>
    </div>
  );
}
