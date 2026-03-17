import { useState } from "react";

const pages = {
  home: {
    title: "Home",
    content: (
      <div>
        <h1>Invisible Mentors</h1>
        <p>Welcome to the Invisible Mentors documentation site.</p>
        <p>
          This project demonstrates how automated tools can act as invisible
          mentors, guiding contributors to write clearer, simpler documentation.
        </p>
        <p>
          Use the navigation on the left to explore the{" "}
          <strong>Onboarding Guide</strong>.
        </p>
      </div>
    ),
  },
  onboarding: {
    title: "Onboarding Guide",
    content: (
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
    ),
  },
};

export default function App() {
  const [activePage, setActivePage] = useState<"home" | "onboarding">("home");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", margin: 0 }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 260,
          background: "#001f3f",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 0 20px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
          <img
            src="/logo.png"
            alt="Invisible Mentors"
            style={{ width: "100%", display: "block" }}
          />
        </div>
        <div style={{ padding: "16px 0" }}>
          {(Object.keys(pages) as Array<"home" | "onboarding">).map((key) => (
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
              {pages[key].title}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: "48px 64px",
          overflowY: "auto",
          background: "#fafafa",
          lineHeight: 1.7,
          color: "#212121",
        }}
      >
        <style>{`
          h1 { font-size: 2rem; color: #001f3f; margin-bottom: 16px; }
          h3 { font-size: 1.2rem; color: #0074D9; margin-top: 32px; margin-bottom: 12px; }
          p { margin-bottom: 16px; }
          ol { padding-left: 24px; }
          ol li { margin-bottom: 10px; }
          strong { color: #c62828; background: #ffebee; padding: 1px 4px; border-radius: 3px; }
        `}</style>
        {pages[activePage].content}
      </main>
    </div>
  );
}
