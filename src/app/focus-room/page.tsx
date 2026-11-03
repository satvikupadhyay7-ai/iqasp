
"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";

const scenes = [
  { name: "Rainy Window", emoji: "🌧️", className: "rain-scene" },
  { name: "Library", emoji: "📚", className: "library-scene" },
  { name: "Night City", emoji: "🌃", className: "night-scene" },
  { name: "Cafe", emoji: "☕", className: "cafe-scene" },
];

const soundOptions = [
  { name: "Rain", emoji: "🌧️", frequency: 900 },
  { name: "Ocean", emoji: "🌊", frequency: 280 },
  { name: "Forest", emoji: "🌲", frequency: 1700 },
  { name: "Cafe", emoji: "☕", frequency: 500 },
];

export default function FocusRoomPage() {
  const [scene, setScene] = useState(scenes[0]);
  const [mode, setMode] = useState("Focus");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [soundName, setSoundName] = useState("Rain");
  const [soundActive, setSoundActive] = useState(false);
  const [volume, setVolume] = useState(35);
  const [editingTime, setEditingTime] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("25");

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((old) => {
        if (old <= 1) {
          setRunning(false);
          return 0;
        }
        return old - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    return () => {
      sourceRef.current?.stop();
      void audioContextRef.current?.close();
    };
  }, []);

  function changeMode(nextMode: string) {
    setMode(nextMode);
    setRunning(false);
    setEditingTime(false);

    const preset =
      nextMode === "Focus" ? 25 :
      nextMode === "Short Break" ? 5 : 50;

    setSeconds(preset * 60);
    setCustomMinutes(String(preset));
  }

  function applyCustomTime() {
    const value = Number(customMinutes);

    if (!Number.isInteger(value) || value < 1 || value > 180) {
      alert("Enter a whole number between 1 and 180 minutes.");
      return;
    }

    setRunning(false);
    setSeconds(value * 60);
    setMode("Custom");
    setEditingTime(false);
  }

  function addTask() {
    if (!task.trim()) return;
    setTasks((old) => [...old, task.trim()]);
    setTask("");
  }

  async function startSound() {
    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;

      if (context.state === "suspended") await context.resume();

      sourceRef.current?.stop();

      const buffer = context.createBuffer(
        1,
        context.sampleRate * 3,
        context.sampleRate
      );

      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value =
        soundOptions.find((item) => item.name === soundName)?.frequency ?? 900;

      const gain = context.createGain();
      gain.gain.value = volume / 100;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      source.start();

      sourceRef.current = source;
      gainRef.current = gain;
      setSoundActive(true);
    } catch {
      alert("Could not start audio. Please try again.");
    }
  }

  function stopSound() {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setSoundActive(false);
  }

  function chooseSound(name: string) {
    if (soundActive) stopSound();
    setSoundName(name);
  }

  function changeVolume(value: number) {
    setVolume(value);
    if (gainRef.current) gainRef.current.gain.value = value / 100;
  }

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return (
    <main>
      <SiteHeader />

      <div className="container page-content">
        <div className="page-heading">
          <span className="eyebrow">YOUR PERSONAL STUDY SPACE</span>
          <h1>Focus Room</h1>
          <p>Make time for deep work. One session at a time.</p>
        </div>

        <section className={`scene-panel ${scene.className}`}>
          <span className="scene-label">YOUR STUDY ENVIRONMENT</span>
          <div className="scene-center">
            <div className="scene-emoji">🧑‍💻</div>
            <h2>Find your focus.</h2>
            <p>Small steps every day lead to big results.</p>
          </div>
          <div className="scene-options">
            {scenes.map((item) => (
              <button
                key={item.name}
                className={scene.name === item.name ? "scene-active" : ""}
                onClick={() => setScene(item)}
              >
                {item.emoji} {item.name}
              </button>
            ))}
          </div>
        </section>

        <section className="focus-main-grid">
          <article className="panel timer-panel">
            <span className="eyebrow">POMODORO TIMER</span>
            <h2>Stay in the zone</h2>

            <div className="timer-modes">
              {["Focus", "Short Break", "Deep Work"].map((item) => (
                <button
                  key={item}
                  className={mode === item ? "mode-active" : ""}
                  onClick={() => changeMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {!editingTime ? (
              <button
                type="button"
                className="timer-display timer-edit-button"
                onClick={() => {
                  setCustomMinutes(String(Math.max(1, Math.ceil(seconds / 60))));
                  setEditingTime(true);
                }}
                title="Click to set a custom timer"
              >
                {minutes}:{remainingSeconds}
              </button>
            ) : (
              <div className="custom-timer-editor">
                <label htmlFor="custom-minutes">Custom time in minutes</label>
                <div className="custom-timer-controls">
                  <input
                    id="custom-minutes"
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(event) => setCustomMinutes(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && applyCustomTime()}
                    autoFocus
                  />
                  <button className="button-primary" onClick={applyCustomTime}>Apply</button>
                  <button className="button-secondary" onClick={() => setEditingTime(false)}>Cancel</button>
                </div>
                <small>Choose between 1 and 180 minutes.</small>
              </div>
            )}

            <p className="timer-hint">
              {seconds === 0 ? "Session complete. Well done!" : "Click the timer to customise its duration."}
            </p>

            <div className="timer-buttons">
              <button
                className="button-primary"
                onClick={() => setRunning(!running)}
                disabled={seconds === 0 || editingTime}
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                className="button-secondary"
                onClick={() => {
                  setRunning(false);
                  setSeconds(
                    mode === "Focus" ? 25 * 60 :
                    mode === "Short Break" ? 5 * 60 :
                    mode === "Deep Work" ? 50 * 60 :
                    Number(customMinutes) * 60
                  );
                }}
              >
                Reset
              </button>
            </div>
          </article>

          <article className="panel task-panel">
            <span className="eyebrow">YOUR CHECKLIST</span>
            <h2>Study tasks</h2>

            <div className="task-input">
              <input
                value={task}
                onChange={(event) => setTask(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addTask()}
                placeholder="Add a study task..."
              />
              <button className="button-primary" onClick={addTask}>Add</button>
            </div>

            {tasks.length === 0 && <p className="empty-state">Your tasks will appear here.</p>}

            <div className="task-list">
              {tasks.map((item, index) => (
                <label className="task-row" key={`${item}-${index}`}>
                  <input
                    type="checkbox"
                    checked={completed.includes(`${item}-${index}`)}
                    onChange={() => {
                      const id = `${item}-${index}`;
                      setCompleted((old) =>
                        old.includes(id) ? old.filter((x) => x !== id) : [...old, id]
                      );
                    }}
                  />
                  <span className={completed.includes(`${item}-${index}`) ? "task-done" : ""}>
                    {item}
                  </span>
                </label>
              ))}
            </div>

            <p className="task-count">{completed.length} of {tasks.length} completed</p>
          </article>
        </section>

        <section className="panel ambience-panel">
          <span className="eyebrow">AMBIENT SOUNDS</span>
          <h2>Set the mood for studying</h2>
          <p>Choose a background sound and adjust its volume.</p>

          <div className="ambience-options">
            {soundOptions.map((sound) => (
              <button
                key={sound.name}
                className={soundName === sound.name ? "mode-active" : ""}
                onClick={() => chooseSound(sound.name)}
              >
                {sound.emoji} {sound.name}
              </button>
            ))}
          </div>

          <div className="sound-player">
            <button className="button-primary" onClick={soundActive ? stopSound : startSound}>
              {soundActive ? "Pause sound" : "▶ Play sound"}
            </button>

            <label className="volume-control">
              Volume: {volume}%
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => changeVolume(Number(event.target.value))}
              />
            </label>
          </div>

          <p className="muted-note">
            Sounds are generated ambient textures, not recordings of actual rain,
            ocean or forest audio.
          </p>
        </section>
      </div>
    </main>
  );
}
