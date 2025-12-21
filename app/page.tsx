"use client";

import React, { useState } from "react";

export default function Home() {
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <div className="dashboard-root">
      <main className="dashboard-card">
        <h1 className="dashboard-title">Do you love it ?</h1>

        <p className="dashboard-sub">A tiny playful dashboard — click an answer below.</p>

        <div className="dashboard-actions" role="group" aria-label="Love question">
          <button
            className="btn btn-yes"
            onClick={() => setAnswer("Yes! ❤️ I'm loving it.")}
            aria-pressed={answer?.startsWith("Yes") || false}
            aria-label="Yes, I love it"
          >
            yes
          </button>

          <button
            className="btn btn-no"
            onClick={() => setAnswer("Oh no... 😢 Tell me what to improve.")}
            aria-pressed={answer?.startsWith("Oh no") || false}
            aria-label="No, I don't love it"
          >
            no
          </button>
        </div>

        <div className="dashboard-result" aria-live="polite">
          {answer ? <span>{answer}</span> : <span>Make a choice — your reaction will appear here.</span>}
        </div>
      </main>
    </div>
  );
}
