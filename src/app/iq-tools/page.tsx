
"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";

type StudyTask = {
  id: number;
  title: string;
  done: boolean;
};

type Flashcard = {
  id: number;
  question: string;
  answer: string;
};

export default function IQToolsPage() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [rank, setRank] = useState("");
  const [candidates, setCandidates] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");

  function addTask() {
    if (!newTask.trim()) return;
    setTasks((old) => [
      ...old,
      { id: Date.now(), title: newTask.trim(), done: false },
    ]);
    setNewTask("");
  }

  function toggleTask(id: number) {
    setTasks((old) =>
      old.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function deleteTask(id: number) {
    setTasks((old) => old.filter((task) => task.id !== id));
  }

  const validRank =
    rank !== "" &&
    candidates !== "" &&
    Number(rank) >= 1 &&
    Number(candidates) >= 1 &&
    Number(rank) <= Number(candidates);

  const percentile = validRank
    ? ((Number(candidates) - Number(rank)) / Number(candidates)) * 100
    : null;

  function addFlashcard() {
    if (!question.trim() || !answer.trim()) return;
    setCards((old) => [
      ...old,
      { id: Date.now(), question: question.trim(), answer: answer.trim() },
    ]);
    setQuestion("");
    setAnswer("");
  }

  function askAssistant() {
    const value = topic.trim().toLowerCase();
    if (!value) return;

    if (value.includes("backlog") || value.includes("schedule")) {
      setAssistantAnswer(
        "List all pending chapters first. Divide them into small daily targets, complete the hardest topic when your energy is highest, and reserve time every week for revision."
      );
    } else if (value.includes("revision") || value.includes("remember")) {
      setAssistantAnswer(
        "Try active recall: close your book, write everything you remember, check what you missed, and repeat after one day, three days and one week."
      );
    } else if (value.includes("focus") || value.includes("distraction")) {
      setAssistantAnswer(
        "Put your phone away, choose one specific task, and work for 25 minutes without switching subjects. Take a five-minute break afterwards."
      );
    } else if (value.includes("math") || value.includes("problem")) {
      setAssistantAnswer(
        "Understand the concept before memorising formulas. Solve one worked example, then attempt similar questions without looking at the solution."
      );
    } else {
      setAssistantAnswer(
        `For ${topic}, start by defining one clear learning goal. Study the concept, practise it without notes, review your mistakes and schedule a short revision session tomorrow.`
      );
    }
  }

  const completedCount = tasks.filter((task) => task.done).length;

  return (
    <main>
      <SiteHeader />
      <div className="container page-content">
        <div className="page-heading">
          <span className="eyebrow">STUDY SMARTER</span>
          <h1>IQ Tools</h1>
          <p>Practical tools to plan, calculate, revise and improve.</p>
        </div>

        <section className="tools-demo-grid">
          <article className="panel">
            <span className="eyebrow">01 · PLANNING</span>
            <h2>Study & Backlog Planner</h2>
            <p className="tool-description">Add chapters, subjects or tasks you need to finish.</p>

            <div className="task-input">
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addTask()}
                placeholder="e.g. Complete DBMS joins"
              />
              <button className="button-primary" onClick={addTask}>Add</button>
            </div>

            <div className="planner-progress">
              <div className="planner-progress-top">
                <strong>{completedCount} / {tasks.length} completed</strong>
                <span>
                  {tasks.length
                    ? Math.round((completedCount / tasks.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="planner-track">
                <span style={{
                  width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`,
                }} />
              </div>
            </div>

            <div className="planner-list">
              {tasks.length === 0 && (
                <p className="empty-state">Your study tasks will appear here.</p>
              )}
              {tasks.map((task) => (
                <div className="planner-task" key={task.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className={task.done ? "task-done" : ""}>{task.title}</span>
                  </label>
                  <button onClick={() => deleteTask(task.id)} aria-label="Delete task">✕</button>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <span className="eyebrow">02 · EXAM CALCULATOR</span>
            <h2>Percentile Calculator</h2>
            <p className="tool-description">
              Enter your rank and the total number of candidates.
            </p>

            <label className="field-label">Your rank</label>
            <input
              type="number"
              min="1"
              value={rank}
              onChange={(event) => setRank(event.target.value)}
              placeholder="e.g. 1200"
            />

            <label className="field-label">Total candidates</label>
            <input
              type="number"
              min="1"
              value={candidates}
              onChange={(event) => setCandidates(event.target.value)}
              placeholder="e.g. 100000"
            />

            {percentile !== null && (
              <div className="result-box">
                <strong>{percentile.toFixed(4)}</strong>
                <span>Estimated percentile based on your rank and candidate count.</span>
              </div>
            )}

            {rank !== "" && candidates !== "" && !validRank && (
              <p className="input-error">Rank must be between 1 and the total number of candidates.</p>
            )}

            <p className="muted-note">
              Formula: ((Total candidates − Rank) ÷ Total candidates) × 100.
              This is a rank-based calculation, not an exam-specific marks predictor.
            </p>
          </article>

          <article className="panel">
            <span className="eyebrow">03 · REVISION</span>
            <h2>AI Flashcard Creator</h2>
            <p className="tool-description">
              Create your own question-and-answer revision cards.
            </p>

            <label className="field-label">Question / Front</label>
            <textarea
              rows={2}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What is normalisation in DBMS?"
            />

            <label className="field-label">Answer / Back</label>
            <textarea
              rows={2}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Organising database tables to reduce redundancy..."
            />

            <button className="button-primary flash-add" onClick={addFlashcard}>
              Add flashcard
            </button>

            <div className="flashcard-list">
              {cards.map((card) => (
                <button
                  className="flashcard"
                  key={card.id}
                  onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
                >
                  <span>{activeCard === card.id ? "ANSWER" : "QUESTION"} · Click to flip</span>
                  <strong>{activeCard === card.id ? card.answer : card.question}</strong>
                </button>
              ))}
              {cards.length === 0 && (
                <p className="empty-state">Your flashcards will appear here.</p>
              )}
            </div>
          </article>

          <article className="panel">
            <span className="eyebrow">04 · STUDY GUIDANCE</span>
            <h2>Study Assistant</h2>
            <p className="tool-description">
              Get a practical study suggestion for the topic you are struggling with.
            </p>

            <label className="field-label">What do you need help with?</label>
            <textarea
              rows={3}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. I have a huge backlog and cannot focus..."
            />
            <button className="button-primary flash-add" onClick={askAssistant}>
              Get study suggestion
            </button>

            {assistantAnswer && (
              <div className="result-box assistant-result">
                <strong>Your study suggestion</strong>
                <span>{assistantAnswer}</span>
              </div>
            )}
            <p className="muted-note">
              This is a built-in rule-based helper, not a connected AI model yet.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}

