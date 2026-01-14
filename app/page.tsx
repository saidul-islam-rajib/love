"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const [answer, setAnswer] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const [noPos, setNoPos] = useState<{ left: number; top: number } | null>(null);
  const isMovingRef = useRef(false); // Prevent multiple moves at once

  // Place the `no` button initially near the yes button (center-right)
  useEffect(() => {
    const placeInitial = () => {
      const container = containerRef.current;
      const noBtn = noRef.current;
      const yesBtn = yesRef.current;
      if (!container || !noBtn || !yesBtn) return;

      const cRect = container.getBoundingClientRect();
      const yRect = yesBtn.getBoundingClientRect();
      const bRect = noBtn.getBoundingClientRect();

      // Calculate position relative to container
      const yesLeftRelative = yRect.left - cRect.left;
      const yesTopRelative = yRect.top - cRect.top;

      // Place No button to the right of Yes button with a small gap
      const left = yesLeftRelative + yRect.width + 14; // 14px gap
      const top = yesTopRelative;

      setNoPos({ left, top });
    };

    // run on mount and after a short delay to let fonts/layout settle
    placeInitial();
    const id = setTimeout(placeInitial, 120);
    const id2 = setTimeout(placeInitial, 300); // Extra delay for mobile
    window.addEventListener("resize", placeInitial);
    return () => {
      clearTimeout(id);
      clearTimeout(id2);
      window.removeEventListener("resize", placeInitial);
    };
  }, []);

  // Track mouse position to detect proximity to No button
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMovingRef.current) return; // Skip if already moving

      const noBtn = noRef.current;
      const container = containerRef.current;
      if (!noBtn || !container) return;

      const rect = noBtn.getBoundingClientRect();
      const detectionRadius = 120; // Detection radius

      // Calculate distance from cursor to button center
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - buttonCenterX, 2) +
        Math.pow(e.clientY - buttonCenterY, 2)
      );

      // Move button if cursor gets too close
      if (distance < detectionRadius) {
        moveNoButton();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isMovingRef.current) return; // Skip if already moving

      const noBtn = noRef.current;
      const container = containerRef.current;
      if (!noBtn || !container || !e.touches[0]) return;

      const rect = noBtn.getBoundingClientRect();
      const detectionRadius = 100; // Smaller radius for touch

      // Calculate distance from touch to button center
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.touches[0].clientX - buttonCenterX, 2) +
        Math.pow(e.touches[0].clientY - buttonCenterY, 2)
      );

      // Move button if touch gets too close
      if (distance < detectionRadius) {
        moveNoButton();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [noPos]);

  const moveNoButton = (event?: React.SyntheticEvent) => {
    if (isMovingRef.current) return; // Prevent multiple simultaneous moves

    const container = containerRef.current;
    const noBtn = noRef.current;
    if (!container || !noBtn) return;

    isMovingRef.current = true; // Lock movement

    const cRect = container.getBoundingClientRect();
    const bRect = noBtn.getBoundingClientRect();
    const padding = 8;

    // Calculate corner positions
    const maxLeft = Math.max(padding, Math.round(cRect.width - bRect.width - padding));
    const maxTop = Math.max(padding, Math.round(cRect.height - bRect.height - padding));

    // Only 4 corners
    const corners = [
      { left: padding, top: padding }, // top-left
      { left: maxLeft, top: padding }, // top-right
      { left: padding, top: maxTop }, // bottom-left
      { left: maxLeft, top: maxTop }, // bottom-right
    ];

    // Choose a corner different from current position
    let availableCorners = corners;

    if (noPos) {
      // Filter out the current corner (within 50px tolerance)
      availableCorners = corners.filter(corner => {
        const distance = Math.sqrt(
          Math.pow(corner.left - noPos.left, 2) +
          Math.pow(corner.top - noPos.top, 2)
        );
        return distance > 50; // Not the same corner
      });
    }

    // If all corners filtered out, use all corners
    if (availableCorners.length === 0) {
      availableCorners = corners;
    }

    // Pick a random corner from available ones
    const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
    setNoPos(randomCorner);

    // Unlock movement after animation completes (300ms)
    setTimeout(() => {
      isMovingRef.current = false;
    }, 300);

    // Only stop propagation, don't prevent default
    if (event) {
      try {
        event.stopPropagation();
      } catch (e) {
        // Ignore errors
      }
    }
  };

  return (
    <div className="dashboard-root">
      <div className="watermark" data-text="RAJIB" aria-hidden="true"></div>
      <main className="dashboard-card">
        <h1 className="dashboard-title">There is my first app</h1>

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
            onClick={async () => {
              setAnswer("Sending... ✉️");
              try {
                const res = await fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subject: 'Someone clicked Yes!',
                    message: "User clicked Yes on the dashboard - They love it! 🎉",
                    to: 'saidul.rajib.bd@gmail.com',
                  }),
                });
                if (res.ok) {
                  setAnswer("success");
                } else {
                  const err = await res.json();
                  setAnswer('Failed to send: ' + (err?.error || res.statusText));
                }
              } catch (err: any) {
                setAnswer('Error sending email: ' + String(err?.message || err));
              }
            }}
            aria-pressed={answer === "success"}
            aria-label="Yes, I love it"
          >
            Yes
          </button>

          <button
            ref={noRef}
            className="btn btn-no"
            style={noPos ? { position: "absolute", left: noPos.left, top: noPos.top, visibility: 'visible' } : { position: "absolute", visibility: 'hidden' }}
            onMouseEnter={() => moveNoButton()}
            onMouseMove={() => moveNoButton()}
            onMouseDown={(e) => moveNoButton(e)}
            onTouchStart={(e) => moveNoButton(e)}
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
          {answer === "success" ? (
            <div className="success-celebration">
              {/* Confetti elements */}
              <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                  <div key={i} className="confetti" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'][Math.floor(Math.random() * 6)]
                  }}></div>
                ))}
              </div>

              {/* Success checkmark circle */}
              <div className="success-checkmark">
                <svg className="checkmark-svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>

              {/* Success text */}
              <div className="success-content">
                <h2 className="success-title">Awesome! 🎉</h2>
                <p className="success-text">Email sent successfully!</p>
                <p className="success-email">to: saidul.rajib.bd@gmail.com ✅</p>
              </div>

              {/* Celebration emoji burst */}
              <div className="emoji-burst">
                <span className="emoji">🎊</span>
                <span className="emoji">✨</span>
                <span className="emoji">🎉</span>
                <span className="emoji">💚</span>
                <span className="emoji">🌟</span>
              </div>
            </div>
          ) : answer ? (
            <span>{answer}</span>
          ) : null}
        </div>
      </main>
    </div>
  );
}
