"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

type Doubt = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  flair: string;
  description: string;
  status: string;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
        avatar_url: string | null;
      }
    | {
        full_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "Biology",
  "Other",
];

const categories = [
  "Conceptual",
  "Numerical",
  "Exam Strategy",
  "Homework",
  "Other",
];

export default function AskDoubtsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");

  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState("");

  // Doubt form
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [flair, setFlair] = useState("Conceptual");
  const [description, setDescription] = useState("");

  const loadProfile = useCallback(async () => {
    const response = await fetch("/api/profile", {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to load profile.");
    }

    setProfile(result.profile);
    setProfileName(result.profile.full_name || "");
  }, []);

  const loadDoubts = useCallback(async () => {
    const response = await fetch("/api/doubts", {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to load doubts.");
    }

    setDoubts(result.doubts || []);
  }, []);

  // Check login and load profile and doubts
  useEffect(() => {
    let active = true;

    async function initializePage() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/signin");
          return;
        }

        if (!active) return;

        setEmail(user.email || "");

        await loadProfile();

        if (!active) return;

        await loadDoubts();
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your account."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    initializePage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/signin");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase, loadProfile, loadDoubts]);

  // Submit a doubt
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/doubts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          subject,
          topic,
          flair,
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit doubt.");
      }

      setTitle("");
      setSubject("Mathematics");
      setTopic("");
      setFlair("Conceptual");
      setDescription("");

      setSuccess("Your doubt has been submitted!");

      await loadDoubts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Open profile settings
  function openProfileSettings() {
    setProfileName(profile?.full_name || "");
    setSelectedPicture(null);
    setPicturePreview(profile?.avatar_url || "");
    setProfileModalOpen(true);
    setError("");
    setSuccess("");
  }

  // Select profile picture
  function handlePictureChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must be smaller than 3 MB.");
      return;
    }

    setError("");
    setSelectedPicture(file);

    const previewUrl = URL.createObjectURL(file);
    setPicturePreview(previewUrl);
  }

  // Save profile changes
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (profileName.trim().length < 2) {
      setError("Your name must contain at least 2 characters.");
      return;
    }

    setSavingProfile(true);

    try {
      const formData = new FormData();

      formData.append("full_name", profileName.trim());

      if (selectedPicture) {
        formData.append("avatar", selectedPicture);
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update profile.");
      }

      setProfile(result.profile);
      setProfileName(result.profile.full_name || "");
      setPicturePreview(result.profile.avatar_url || "");
      setSelectedPicture(null);

      setSuccess("Profile updated successfully!");

      await loadDoubts();

      setProfileModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // Sign out
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/signin");
    router.refresh();
  }

  function getDoubtProfile(doubt: Doubt) {
    if (Array.isArray(doubt.profiles)) {
      return doubt.profiles[0] || null;
    }

    return doubt.profiles;
  }

  function getInitials(name: string | null | undefined) {
    if (!name) return "S";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loader" />
        <p>Loading your account...</p>
      </main>
    );
  }

  return (
    <main className="doubts-page">
      {/* HEADER */}
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-icon">IQ</span>
            <span>ASPIRANTS</span>
          </Link>

          <div className="header-actions">
            <Link href="/" className="home-link">
              ← Back to Home
            </Link>

            {/* PROFILE BUTTON */}
            <button
              type="button"
              className="profile-button"
              onClick={openProfileSettings}
              title="Profile settings"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="header-avatar"
                />
              ) : (
                <span className="avatar-initials">
                  {getInitials(profile?.full_name)}
                </span>
              )}
            </button>

            <button
              type="button"
              className="signout-button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="content-container">
        <section className="welcome-section">
          <span className="eyebrow">STUDENT COMMUNITY</span>

          <h1>
            Ask your <span>doubts.</span>
          </h1>

          <p>
            Stuck on a concept? Ask a question and get help from the
            community and mentors.
          </p>

          {profile?.full_name && (
            <p className="welcome-name">
              Welcome back, {profile.full_name}!
            </p>
          )}
        </section>

        {error && (
          <div className="message error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="message success-message">
            {success}
          </div>
        )}

        {/* ASK DOUBT FORM */}
        <section className="form-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR QUESTION</span>
              <h2>Ask a doubt</h2>
            </div>
            <span className="heading-icon">?</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Doubt title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. How does dynamic programming work?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={5}
              maxLength={150}
              required
            />

            <div className="form-grid">
              <div>
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {subjects.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="topic">Topic</label>
                <input
                  id="topic"
                  type="text"
                  placeholder="e.g. Recursion"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>
            </div>

            <label htmlFor="flair">Category</label>
            <select
              id="flair"
              value={flair}
              onChange={(e) => setFlair(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label htmlFor="description">Explain your doubt</label>
            <textarea
              id="description"
              placeholder="Explain what you are stuck on. Add relevant details so others can help you..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={5000}
              rows={6}
              required
            />

            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit doubt →"}
            </button>
          </form>
        </section>

        {/* PREVIOUS DOUBTS */}
        <section className="previous-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR ACTIVITY</span>
              <h2>Previous doubts</h2>
            </div>

            <span className="doubt-count">
              {doubts.length} {doubts.length === 1 ? "doubt" : "doubts"}
            </span>
          </div>

          {doubts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">?</div>
              <h3>No doubts yet</h3>
              <p>
                Your submitted doubts will appear here.
              </p>
            </div>
          ) : (
            <div className="doubts-list">
              {doubts.map((doubt) => {
                const doubtProfile = getDoubtProfile(doubt);

                return (
                  <article className="doubt-card" key={doubt.id}>
                    <div className="doubt-card-top">
                      <div className="student-info">
                        {doubtProfile?.avatar_url ? (
                          <img
                            src={doubtProfile.avatar_url}
                            alt="Student"
                            className="student-avatar"
                          />
                        ) : (
                          <div className="student-avatar avatar-fallback">
                            {getInitials(doubtProfile?.full_name)}
                          </div>
                        )}

                        <div>
                          <strong>
                            {doubtProfile?.full_name || "Student"}
                          </strong>
                          <span>
                            {new Date(doubt.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <span className="status-tag">
                        {doubt.status.replace("_", " ")}
                      </span>
                    </div>

                    <h3>{doubt.title}</h3>

                    <div className="doubt-tags">
                      <span>{doubt.subject}</span>
                      <span>{doubt.topic}</span>
                      <span>{doubt.flair}</span>
                    </div>

                    <p className="doubt-description">
                      {doubt.description}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* PROFILE SETTINGS MODAL */}
      {profileModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProfileModalOpen(false);
            }
          }}
        >
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">YOUR ACCOUNT</span>
                <h2 id="profile-title">Profile settings</h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() => setProfileModalOpen(false)}
                aria-label="Close profile settings"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProfile}>
              <div className="picture-section">
                <div className="large-avatar">
                  {picturePreview ? (
                    <img
                      src={picturePreview}
                      alt="Profile preview"
                    />
                  ) : (
                    <span>{getInitials(profileName)}</span>
                  )}
                </div>

                <label htmlFor="avatar-upload" className="upload-button">
                  Change picture
                </label>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePictureChange}
                  hidden
                />

                <small>JPG, PNG or WebP · Maximum 3 MB</small>
              </div>

              <label htmlFor="profile-name">Display name</label>
              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                minLength={2}
                maxLength={80}
                required
              />

              <label htmlFor="profile-email">Email address</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                disabled
              />

              {error && (
                <div className="message error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="primary-button save-button"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </form>
          </section>
        </div>
      )}

      <footer className="page-footer">
        © {new Date().getFullYear()} IQ Aspirants. Keep learning.
      </footer>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f7f8fc;
          color: #182033;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        .doubts-page {
          min-height: 100vh;
          background: #f7f8fc;
        }

        .topbar {
          background: #ffffff;
          border-bottom: 1px solid #e8eaf0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .topbar-inner {
          max-width: 1120px;
          margin: auto;
          padding: 15px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #182033;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-decoration: none;
        }

        .brand-icon {
          background: #5b55df;
          color: white;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .home-link {
          color: #5b55df;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .profile-button {
          width: 43px;
          height: 43px;
          border: 2px solid #e3e2ff;
          border-radius: 50%;
          padding: 0;
          overflow: hidden;
          background: #eeedff;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .header-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          color: #5b55df;
          font-weight: 800;
        }

        .signout-button {
          background: white;
          border: 1px solid #e1e3eb;
          color: #5b6070;
          padding: 10px 14px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13px;
        }

        .content-container {
          max-width: 850px;
          margin: auto;
          padding: 48px 22px 70px;
        }

        .welcome-section {
          margin-bottom: 30px;
        }

        .eyebrow {
          color: #7772dc;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }

        .welcome-section h1 {
          font-size: clamp(34px, 6vw, 48px);
          margin: 12px 0;
          letter-spacing: -1.5px;
        }

        .welcome-section h1 span {
          color: #5b55df;
        }

        .welcome-section > p {
          color: #73798a;
          line-height: 1.7;
          margin: 0;
        }

        .welcome-section .welcome-name {
          margin-top: 12px;
          color: #4f49c9;
          font-weight: 700;
        }

        .form-card,
        .doubt-card {
          background: white;
          border: 1px solid #e9eaf1;
          border-radius: 16px;
          padding: 27px;
          box-shadow: 0 8px 30px rgba(28, 33, 60, 0.035);
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
          gap: 12px;
        }

        .section-heading h2 {
          font-size: 23px;
          margin: 7px 0 0;
        }

        .heading-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          background: #efeeff;
          color: #5b55df;
          border-radius: 12px;
          font-size: 24px;
          font-weight: 800;
        }

        .form-card form,
        .profile-modal form {
          display: flex;
          flex-direction: column;
        }

        .form-card label,
        .profile-modal form > label {
          font-size: 13px;
          font-weight: 700;
          margin: 17px 0 8px;
          color: #33394a;
        }

        .form-card input,
        .form-card textarea,
        .form-card select,
        .profile-modal input:not([type="file"]) {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #e0e2eb;
          border-radius: 9px;
          background: #ffffff;
          color: #252b3a;
          outline: none;
          font-size: 14px;
        }

        .form-card input:focus,
        .form-card textarea:focus,
        .form-card select:focus,
        .profile-modal input:focus {
          border-color: #7772dc;
          box-shadow: 0 0 0 3px rgba(91, 85, 223, 0.09);
        }

        .form-card textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-grid > div {
          min-width: 0;
        }

        .primary-button {
          background: #5b55df;
          border: none;
          color: white;
          padding: 14px 20px;
          border-radius: 9px;
          margin-top: 22px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .primary-button:hover {
          background: #4842c4;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .previous-section {
          margin-top: 55px;
        }

        .doubt-count {
          background: #eeedff;
          color: #5b55df;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .empty-state {
          text-align: center;
          background: white;
          border: 1px dashed #dcddea;
          border-radius: 15px;
          padding: 45px 20px;
        }

        .empty-icon {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          margin: auto;
          display: grid;
          place-items: center;
          background: #efeeff;
          color: #5b55df;
          font-size: 24px;
          font-weight: 800;
        }

        .empty-state h3 {
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #818698;
          font-size: 14px;
        }

        .doubts-list {
          display: grid;
          gap: 15px;
        }

        .doubt-card {
          padding: 22px;
        }

        .doubt-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .student-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          background: #eeedff;
        }

        .avatar-fallback {
          display: grid;
          place-items: center;
          color: #5b55df;
          font-weight: 800;
        }

        .student-info strong {
          display: block;
          font-size: 13px;
        }

        .student-info span {
          display: block;
          color: #9296a4;
          font-size: 11px;
          margin-top: 4px;
        }

        .status-tag {
          background: #e9f8ef;
          color: #23834b;
          border-radius: 20px;
          padding: 6px 10px;
          text-transform: capitalize;
          font-size: 10px;
          font-weight: 700;
        }

        .doubt-card h3 {
          font-size: 18px;
          margin: 0 0 13px;
        }

        .doubt-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .doubt-tags span {
          background: #f0efff;
          color: #5c56c8;
          border-radius: 20px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .doubt-description {
          color: #697083;
          line-height: 1.7;
          font-size: 14px;
          white-space: pre-wrap;
          margin: 15px 0 0;
        }

        .message {
          padding: 12px 15px;
          border-radius: 9px;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .error-message {
          background: #fff0f0;
          color: #b52b2b;
          border: 1px solid #ffdada;
        }

        .success-message {
          background: #eaf8ef;
          color: #237b47;
          border: 1px solid #ccebd6;
        }

        /* PROFILE MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(18, 22, 42, 0.58);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .profile-modal {
          background: white;
          width: 100%;
          max-width: 440px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 18px;
          padding: 27px;
          box-shadow: 0 20px 70px rgba(0, 0, 0, 0.2);
        }

        .modal-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .modal-heading h2 {
          font-size: 23px;
          margin: 8px 0 0;
        }

        .close-button {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: #f0f0f5;
          color: #555;
          font-size: 24px;
          cursor: pointer;
        }

        .picture-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 0 12px;
        }

        .large-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          background: #eeedff;
          display: grid;
          place-items: center;
          color: #5b55df;
          font-size: 30px;
          font-weight: 800;
          margin-bottom: 13px;
        }

        .large-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-button {
          color: #5b55df;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          margin: 0 !important;
        }

        .picture-section small {
          color: #9699a7;
          font-size: 11px;
          margin-top: 7px;
        }

        .profile-modal input:disabled {
          background: #f4f5f8;
          color: #888;
          cursor: not-allowed;
        }

        .save-button {
          width: 100%;
        }

        .page-footer {
          border-top: 1px solid #e8eaf0;
          padding: 25px;
          text-align: center;
          color: #9699a7;
          font-size: 12px;
        }

        .loading-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #777;
        }

        .loader {
          width: 32px;
          height: 32px;
          border: 3px solid #e6e5ff;
          border-top-color: #5b55df;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 600px) {
          .topbar-inner {
            padding: 12px 14px;
            gap: 8px;
          }

          .brand {
            font-size: 12px;
            gap: 6px;
          }

          .brand-icon {
            width: 33px;
            height: 33px;
          }

          .header-actions {
            gap: 9px;
          }

          .home-link {
            font-size: 11px;
          }

          .profile-button {
            width: 38px;
            height: 38px;
          }

          .signout-button {
            padding: 8px;
            font-size: 11px;
          }

          .content-container {
            padding: 35px 14px 50px;
          }

          .form-card {
            padding: 19px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .doubt-card {
            padding: 17px;
          }

          .profile-modal {
            padding: 21px;
          }
        }
      `}</style>
    </main>
  );
}