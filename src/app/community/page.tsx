
"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";

type Post = {
  id: number;
  author: string;
  subject: string;
  content: string;
};

const initialPosts: Post[] = [
  {
    id: 1,
    author: "Aarav",
    subject: "Mathematics",
    content: "What is the best way to practise difficult integration problems?",
  },
  {
    id: 2,
    author: "Priya",
    subject: "Physics",
    content: "Can someone explain the difference between work and power?",
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [author, setAuthor] = useState("Student");

  function addPost() {
    if (!content.trim()) return;
    setPosts((old) => [
      { id: Date.now(), author, subject, content: content.trim() },
      ...old,
    ]);
    setContent("");
  }

  return (
    <main>
      <SiteHeader />
      <div className="container page-content">
        <div className="page-heading">
          <span className="eyebrow">LEARN TOGETHER</span>
          <h1>Student Community</h1>
          <p>Ask questions, share ideas and learn from one another.</p>
        </div>

        <section className="community-layout">
          <div>
            <article className="panel create-post">
              <h2>Ask the community</h2>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Your display name"
              />
              <select value={subject} onChange={(event) => setSubject(event.target.value)}>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
                <option>General</option>
              </select>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="What would you like to ask?"
                rows={4}
              />
              <button className="button-primary" onClick={addPost}>Publish question</button>
              <p className="muted-note">Demo mode: posts are stored only in this page's current session.</p>
            </article>

            <div className="community-feed">
              <div className="section-heading">
                <h2>Recent discussions</h2>
                <span className="subject-tag purple">{posts.length} posts</span>
              </div>
              {posts.map((post) => (
                <article className="content-card post-card" key={post.id}>
                  <div className="post-top">
                    <span className="avatar">{post.author.slice(0, 2).toUpperCase()}</span>
                    <div><strong>{post.author}</strong><small>Student discussion</small></div>
                    <span className="subject-tag blue">{post.subject}</span>
                  </div>
                  <p>{post.content}</p>
                  <div className="post-actions">
                    <button onClick={() => alert("Replies will be enabled when the database is connected.")}>💬 Reply</button>
                    <button onClick={() => alert("Like feature will be connected to the database.")}>♡ Like</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="panel community-sidebar">
            <span className="eyebrow">COMMUNITY</span>
            <h3>Trending topics</h3>
            {["#JEEPreparation", "#StudyRoutine", "#Mathematics", "#ExamStrategy"].map((tag) => (
              <p className="trending-item" key={tag}>{tag}</p>
            ))}
            <hr />
            <h3>Community guidelines</h3>
            <p>Be respectful, stay on topic and help others learn.</p>
          </aside>
        </section>
      </div>
    </main>
  );
}

