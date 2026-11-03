
"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";

const doubts = [
  {
    subject: "Mathematics",
    title: "How do I approach difficult probability questions?",
    mentor: "Aarav Sharma",
    initials: "AS",
  },
  {
    subject: "Physics",
    title: "Understanding rotational motion and torque",
    mentor: "Priya Mehta",
    initials: "PM",
  },
  {
    subject: "Chemistry",
    title: "How should I remember organic reactions?",
    mentor: "Rohan Verma",
    initials: "RV",
  },
  {
    subject: "Mathematics",
    title: "How can I improve my speed in calculus?",
    mentor: "Aarav Sharma",
    initials: "AS",
  },
  {
    subject: "Physics",
    title: "When should I use conservation of energy?",
    mentor: "Priya Mehta",
    initials: "PM",
  },
];

const plans = [
  { name: "Weekly", price: "199", duration: "7 days" },
  { name: "Monthly", price: "399", duration: "30 days", popular: true },
  { name: "Quarterly", price: "699", duration: "90 days" },
];

export default function HomePage() {
  const [doubtIndex, setDoubtIndex] = useState(0);

  const visibleDoubts = [
    doubts[doubtIndex % doubts.length],
    doubts[(doubtIndex + 1) % doubts.length],
    doubts[(doubtIndex + 2) % doubts.length],
  ];

  function nextDoubts() {
    setDoubtIndex((old) => (old + 1) % doubts.length);
  }

  function previousDoubts() {
    setDoubtIndex((old) => (old - 1 + doubts.length) % doubts.length);
  }

  return (
    <main>
      <SiteHeader />

      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">YOUR PREPARATION, REIMAGINED</span>
          <h1>Prepare smarter.<br /><span>Achieve bigger.</span></h1>
          <p>
            Learn with mentors, clear your doubts, build consistency and
            make every study session count.
          </p>
          <div className="hero-actions">
            <Link href="/signin" className="button-primary">Get Started →</Link>
            <Link href="/focus-room" className="button-secondary">Explore Focus Room</Link>
          </div>
          <div className="hero-stats">
            <div><strong>24/7</strong><span>Learning space</span></div>
            <div><strong>1:1</strong><span>Mentor guidance</span></div>
            <div><strong>100%</strong><span>Growth mindset</span></div>
          </div>
        </div>

        <div className="hero-art">
          <div className="art-glow" />
          <div className="study-card">
            <span className="art-emoji">📚</span>
            <h3>Your next chapter starts here.</h3>
            <p>Focus. Learn. Improve.</p>
            <div className="progress-track"><span /></div>
            <small>Consistency is the key</small>
          </div>
          <div className="floating-note note-one">🎯 Stay focused</div>
          <div className="floating-note note-two">✨ Keep growing</div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LEARN TOGETHER</span>
            <h2>Recent student doubts</h2>
            <p>Explore questions and learn from mentor explanations.</p>
          </div>
          <div className="carousel-controls">
            <button onClick={previousDoubts} aria-label="Previous doubts">←</button>
            <button onClick={nextDoubts} aria-label="Next doubts">→</button>
          </div>
        </div>

        <div className="card-grid three doubt-carousel" aria-live="polite">
          {visibleDoubts.map((doubt, index) => (
            <article className="content-card doubt-slide" key={`${doubt.title}-${index}`}>
              <span className="subject-tag purple">{doubt.subject}</span>
              <h3>{doubt.title}</h3>
              <div className="mentor-line">
                <span className="avatar">{doubt.initials}</span>
                <div>
                  <small>Answered by</small>
                  <strong>{doubt.mentor}</strong>
                </div>
              </div>
              <Link href="/community" className="text-link">View discussion →</Link>
            </article>
          ))}
        </div>

        <div className="carousel-dots">
          {doubts.map((doubt, index) => (
            <button
              key={doubt.title}
              aria-label={`Show doubts starting at ${index + 1}`}
              className={doubtIndex === index ? "active-dot" : ""}
              onClick={() => setDoubtIndex(index)}
            />
          ))}
        </div>
      </section>

      <section className="section mentors-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">GUIDANCE THAT MATTERS</span>
              <h2>Learn with the right mentors</h2>
              <p>Get help from experienced subject mentors.</p>
            </div>
          </div>
          <div className="card-grid three">
            {[
              ["AS", "Aarav Sharma", "Mathematics Mentor"],
              ["PM", "Priya Mehta", "Physics Mentor"],
              ["RV", "Rohan Verma", "Chemistry Mentor"],
            ].map(([initials, name, subject]) => (
              <article className="mentor-card" key={name}>
                <div className="mentor-avatar">{initials}</div>
                <h3>{name}</h3>
                <p>{subject}</p>
                <span className="online-label">● Mentor profile</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading centered">
          <div>
            <span className="eyebrow">SIMPLE PRICING</span>
            <h2>Choose your learning plan</h2>
            <p>Get access to a more structured preparation experience.</p>
          </div>
        </div>
        <div className="card-grid three">
          {plans.map((plan) => (
            <article className={`price-card ${plan.popular ? "featured" : ""}`} key={plan.name}>
              {plan.popular && <span className="popular-tag">POPULAR</span>}
              <h3>{plan.name}</h3>
              <div className="price">₹{plan.price}<small> / {plan.duration}</small></div>
              <p>Access to the IQ Aspirants learning experience.</p>
              <Link href="/signin" className="button-primary full-button">Choose Plan</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="feature-banner">
          <div>
            <span className="eyebrow">BUILD YOUR ROUTINE</span>
            <h2>Your personal Focus Room</h2>
            <p>Pomodoro timer, study tasks, ambience and a dedicated study space.</p>
            <Link href="/focus-room" className="button-primary">Enter Focus Room →</Link>
          </div>
          <div className="banner-emoji">🧑‍💻</div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TOOLS FOR YOUR JOURNEY</span>
            <h2>Explore IQ Tools</h2>
          </div>
          <Link href="/iq-tools" className="text-link">Explore all tools →</Link>
        </div>
        <div className="card-grid three">
          {[
            ["📅", "Study Planner", "Organise your syllabus and backlog."],
            ["📊", "Percentile Calculator", "Calculate percentile from rank and candidates."],
            ["🧠", "Flashcards", "Create and revise your own flashcards."],
          ].map(([icon, title, description]) => (
            <article className="content-card tool-card" key={title}>
              <span className="tool-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="feature-banner meditation-banner">
          <div>
            <span className="eyebrow">PAUSE. RESET. RETURN.</span>
            <h2>Give your mind a break.</h2>
            <p>Take a mindful break with guided meditation and calming sounds.</p>
            <Link href="/meditation" className="button-primary">Visit Meditation Room →</Link>
          </div>
          <div className="banner-emoji">🧘</div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <strong>IQ ASPIRANTS</strong>
          <span>Learn consistently. Grow confidently.</span>
          <span>© 2026 IQ Aspirants</span>
        </div>
      </footer>
    </main>
  );
}
