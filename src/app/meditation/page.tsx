
"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import styles from "./meditation.module.css";

const durations = [5, 10, 15];

export default function MeditationPage() {
  const [duration, setDuration] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setActive(false);
          setCompleted(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  function selectDuration(value: number) {
    setDuration(value);
    setSecondsLeft(value * 60);
    setActive(false);
    setCompleted(false);
  }

  function startMeditation() {
    if (secondsLeft === 0) {
      setSecondsLeft(duration * 60);
    }
    setCompleted(false);
    setActive(true);
  }

  function resetMeditation() {
    setActive(false);
    setCompleted(false);
    setSecondsLeft(duration * 60);
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <main className={styles.page}>
      <SiteHeader />

      <div className={styles.container}>
        <header className={styles.hero}>
          <span className={styles.overline}>YOUR SPACE TO RESET</span>
          <h1>
            Find your <span>calm.</span>
          </h1>
          <p>
            Step away from the noise. Take a mindful pause, breathe naturally
            and return with a clearer mind.
          </p>
        </header>

        <section className={styles.session}>
          <div className={styles.sessionLabel}>
            <span className={styles.statusDot} />
            GUIDED BREATHING SESSION
          </div>

          <div className={styles.visual}>
            <div
              className={`${styles.orbit} ${
                active ? styles.orbitActive : ""
              }`}
            >
              <div className={`${styles.ring} ${styles.ringOne}`} />
              <div className={`${styles.ring} ${styles.ringTwo}`} />

              <div className={styles.breathingCircle}>
                <div className={styles.circleContent}>
                  <span className={styles.breatheIn}>
                    🌸 Breathe in
                  </span>
                  <span className={styles.breatheOut}>
                    🍃 Breathe out
                  </span>
                  <span className={styles.relax}>
                    🧘 Relax
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sessionCopy}>
            <h2>
              {completed
                ? "Session complete."
                : active
                  ? "Follow your breath."
                  : "Take a moment for yourself."}
            </h2>
            <p>
              {completed
                ? "Well done. Carry this calm into the rest of your day."
                : active
                  ? "Breathe in gently as the circle grows. Breathe out as it shrinks."
                  : "No rush. Just you, your breath and a little quiet."}
            </p>
          </div>

          <div className={styles.timer}>
            <span className={styles.timeValue}>
              {minutes}:{seconds}
            </span>
            <span className={styles.timeCaption}>TIME REMAINING</span>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={
                active
                  ? () => setActive(false)
                  : startMeditation
              }
            >
              {active
                ? "Pause session"
                : completed
                  ? "Start again"
                  : secondsLeft < duration * 60
                    ? "Resume meditation"
                    : "Begin meditation"}
              <span>{active ? "Ⅱ" : "→"}</span>
            </button>

            <button
              className={styles.resetButton}
              onClick={resetMeditation}
            >
              Reset
            </button>
          </div>
        </section>

        <section className={styles.durationSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.overline}>MAKE IT YOURS</span>
            <h2>Choose your duration</h2>
            <p>How much time would you like to give yourself?</p>
          </div>

          <div className={styles.durationGrid}>
            {durations.map((value) => (
              <button
                key={value}
                className={`${styles.durationCard} ${
                  duration === value ? styles.selected : ""
                }`}
                onClick={() => selectDuration(value)}
              >
                <span className={styles.durationNumber}>{value}</span>
                <span className={styles.durationUnit}>MINUTES</span>
                <span className={styles.durationChoice}>
                  {duration === value ? "Selected" : "Choose duration"}
                </span>
                {duration === value && (
                  <span className={styles.selectedIndicator} />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.quote}>
          <span className={styles.quoteMark}>“</span>
          <span className={styles.overline}>A THOUGHT TO REFLECT ON</span>
          <h2>
            You have the right to work, but never to the fruit of work.
          </h2>
          <p>Bhagavad Gita · 2.47 (English translation)</p>
        </section>

        <footer className={styles.footer}>
          Take it one breath at a time. You are doing just fine.
        </footer>
      </div>
    </main>
  );
}


