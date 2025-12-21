"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const [answer, setAnswer] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const [noPos, setNoPos] = useState<{ left: number; top: number } | null>(null);

  // Place the `no` button initially near the yes button (center-right)
  useEffect(() => {
    const placeInitial = () => {
      const container = containerRef.current;
      const noBtn = noRef.current;
      const yesBtn = yesRef.current;
      if (!container || !noBtn) return;
      const cRect = container.getBoundingClientRect();
      const bRect = noBtn.getBoundingClientRect();
      const padding = 8;

      // If we have a yes button, place `no` to the right of it initially
      if (yesBtn) {
        const yRect = yesBtn.getBoundingClientRect();
        // left coordinate relative to container
        let left = Math.round(yRect.right - cRect.left + 12);
        let top = Math.round(yRect.top - cRect.top);

        // center vertically with the yes button if possible
        top = Math.max(padding, Math.min(cRect.height - bRect.height - padding, top + (yRect.height - bRect.height) / 2));
        left = Math.max(padding, Math.min(cRect.width - bRect.width - padding, left));

        setNoPos({ left, top });
        return;
      }

      // fallback center-right
      const left = Math.max(padding, Math.min(cRect.width - bRect.width - padding, cRect.width * 0.6));
      const top = Math.max(padding, (cRect.height - bRect.height) / 2);
      setNoPos({ left, top });
    };

    // run on mount and after a short delay to let fonts/layout settle
    placeInitial();
    const id = setTimeout(placeInitial, 120);
    window.addEventListener("resize", placeInitial);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", placeInitial);
    };
  }, []);

  const moveNoButton = (event?: React.SyntheticEvent) => {
    const container = containerRef.current;
    const noBtn = noRef.current;
    if (!container || !noBtn) return;

    const cRect = container.getBoundingClientRect();
    const bRect = noBtn.getBoundingClientRect();
    const padding = 8;

    // Corners inside container (top-left, top-right, bottom-left, bottom-right)
    const maxLeft = Math.max(padding, Math.round(cRect.width - bRect.width - padding));
    const maxTop = Math.max(padding, Math.round(cRect.height - bRect.height - padding));

    const corners = [
      { left: padding, top: padding }, // top-left
      { left: maxLeft, top: padding }, // top-right
      { left: padding, top: maxTop }, // bottom-left
      { left: maxLeft, top: maxTop }, // bottom-right
    ];

    // choose a corner different from current if possible
    let choiceIndex = Math.floor(Math.random() * corners.length);
    if (noPos) {
      const sameIndex = corners.findIndex(c => Math.abs(c.left - noPos.left) < 4 && Math.abs(c.top - noPos.top) < 4);
      if (sameIndex >= 0) {
        // pick a different index
        const options = corners.map((_, i) => i).filter(i => i !== sameIndex);
        choiceIndex = options[Math.floor(Math.random() * options.length)];
      }
    }

    const { left, top } = corners[choiceIndex];
    setNoPos({ left, top });

    if (event) {
      event.preventDefault();
      try {
        (event as React.SyntheticEvent).stopPropagation();
      } catch {
      }
    }
  };

  return (
    <div className="dashboard-root">
  <div className="watermark" data-text="RAJIB" aria-hidden="true"></div>
      <main className="dashboard-card">
        <h1 className="dashboard-title">Do you love it ?</h1>

        <p className="dashboard-sub">A tiny playful dashboard — click an answer below.</p>

        <div
          className="dashboard-actions"
          role="group"
          aria-label="Love question"
          ref={containerRef}
        >
          <button
            className="btn btn-yes"
            ref={yesRef}
            onClick={() => setAnswer("Yes! ❤️ I'm loving it.")}
            aria-pressed={answer?.startsWith("Yes") || false}
            aria-label="Yes, I love it"
          >
            Yes
          </button>

          <button
            ref={noRef}
            className="btn btn-no"
            style={noPos ? { position: "absolute", left: noPos.left, top: noPos.top } : { position: "absolute" }}
            onMouseEnter={() => moveNoButton()}
            onMouseMove={() => moveNoButton()}
            onMouseDown={(e) => moveNoButton(e)}
            onClick={(e) => moveNoButton(e)}
            aria-pressed={false}
            aria-label="No, I don't love it"
            aria-disabled={true}
            tabIndex={-1}
          >
            No
          </button>
        </div>

        <div className="dashboard-result" aria-live="polite">
          {answer ? <span>{answer}</span> : <span></span>}
        </div>
      </main>
    </div>
  );
}
