"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  avatar_url: string | null;
  role?: string;
};

export default function ProfileButton() {
  const router = useRouter();

  // Keep one Supabase client instance
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the logged-in user and profile
  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load profile.");
      }

      // Supports either { profile: {...} } or a direct profile response
      const profileData = result.profile ?? result;

      setProfile(profileData);
      setName(profileData.full_name || "");
      setPreview(profileData.avatar_url || "");
    } catch (err: any) {
      setError(err.message || "Could not load profile.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Select a new profile picture
  function handleAvatarChange(file: File | undefined) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must be less than 3 MB.");
      return;
    }

    setError("");
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  }

  // Save profile changes
  async function saveProfile() {
    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("full_name", name.trim());

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update profile.");
      }

      const updatedProfile = result.profile ?? result;

      setProfile(updatedProfile);
      setName(updatedProfile.full_name || name.trim());
      setPreview(updatedProfile.avatar_url || preview);
      setAvatar(null);

      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }

    setSaving(false);
  }

  // Sign out
  async function handleSignOut() {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setMenuOpen(false);
    setModalOpen(false);

    router.push("/signin");
    router.refresh();
  }

  const initials = (profile?.full_name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="profile-button-container">
      {/* Round profile button */}
      <button
        type="button"
        className="global-profile-button"
        onClick={() => {
          setError("");
          setMenuOpen(!menuOpen);
        }}
        aria-label="Open profile menu"
      >
        {loading ? (
          <span>...</span>
        ) : preview || profile?.avatar_url ? (
          <img
            src={preview || profile?.avatar_url || ""}
            alt="Profile"
          />
        ) : (
          <span>{user ? initials : "👤"}</span>
        )}
      </button>

      {/* Menu for logged-in and logged-out users */}
      {menuOpen && (
        <div className="global-profile-menu">
          {user ? (
            <>
              <div className="profile-menu-user">
                <strong>{profile?.full_name || "Student"}</strong>
                <small>{user.email}</small>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setError("");
                  setModalOpen(true);
                }}
              >
                Profile settings
              </button>

              <button type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <p>Welcome to IQ Aspirants!</p>

              <button
                type="button"
                onClick={() => router.push("/signin")}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => router.push("/signup")}
              >
                Create account
              </button>
            </>
          )}
        </div>
      )}

      {/* Profile settings modal */}
      {modalOpen && user && (
        <div
          className="profile-modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="profile-modal-close"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>

            <h2>Profile Settings</h2>
            <p>Manage your IQ Aspirants profile.</p>

            <div className="profile-avatar-section">
              {preview ? (
                <img src={preview} alt="Profile preview" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {initials}
                </div>
              )}

              <label htmlFor="global-avatar-upload">
                Change picture
              </label>

              <input
                id="global-avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  handleAvatarChange(e.target.files?.[0])
                }
              />
            </div>

            <label className="profile-field-label">
              Display name
            </label>

            <input
              className="profile-field"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={80}
            />

            <label className="profile-field-label">
              Email
            </label>

            <input
              className="profile-field"
              type="email"
              value={user.email || ""}
              disabled
            />

            {error && <p className="profile-error">{error}</p>}

            <button
              type="button"
              className="profile-save-button"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              className="profile-signout-button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-button-container {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .global-profile-button {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #d1d5db;
          background: #f3f4f6;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          font-size: 20px;
          font-weight: 600;
        }

        .global-profile-button img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .global-profile-menu {
          position: absolute;
          top: 52px;
          right: 0;
          width: 220px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          z-index: 100;
          color: #111827;
        }

        .global-profile-menu button {
          width: 100%;
          padding: 10px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          border-radius: 7px;
          color: #374151;
        }

        .global-profile-menu button:hover {
          background: #f3f4f6;
        }

        .global-profile-menu p {
          padding: 5px 8px;
          font-size: 14px;
        }

        .profile-menu-user {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 9px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 5px;
          overflow-wrap: anywhere;
        }

        .profile-menu-user small {
          color: #6b7280;
          font-size: 12px;
        }

        .profile-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 1000;
        }

        .profile-modal {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: white;
          color: #111827;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
        }

        .profile-modal h2 {
          font-size: 23px;
          margin-bottom: 5px;
        }

        .profile-modal > p {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 22px;
        }

        .profile-modal-close {
          position: absolute;
          top: 12px;
          right: 16px;
          border: none;
          background: transparent;
          font-size: 27px;
          cursor: pointer;
          color: #6b7280;
        }

        .profile-avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
        }

        .profile-avatar-section img,
        .profile-avatar-placeholder {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-avatar-placeholder {
          background: #e0e7ff;
          color: #3730a3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: 700;
        }

        .profile-avatar-section label {
          color: #4f46e5;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
        }

        .profile-avatar-section input {
          display: none;
        }

        .profile-field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin: 14px 0 6px;
        }

        .profile-field {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
          color: #111827;
          background: white;
        }

        .profile-field:focus {
          border-color: #6366f1;
        }

        .profile-field:disabled {
          background: #f3f4f6;
          color: #6b7280;
        }

        .profile-save-button,
        .profile-signout-button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          margin-top: 16px;
          cursor: pointer;
          font-weight: 600;
        }

        .profile-save-button {
          background: #4f46e5;
          color: white;
        }

        .profile-save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-signout-button {
          margin-top: 9px;
          background: #f3f4f6;
          color: #374151;
        }

        .profile-error {
          color: #dc2626;
          font-size: 13px;
          margin-top: 12px;
        }

        @media (max-width: 480px) {
          .profile-modal {
            padding: 22px;
          }
        }
      `}</style>
    </div>
  );
}