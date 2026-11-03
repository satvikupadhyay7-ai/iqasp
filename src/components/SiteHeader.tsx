import Link from "next/link";
import ProfileButton from "@/components/ProfileButton";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-container">
        <Link href="/" className="header-logo">
          <span className="logo-iq">IQ</span>
          <span className="logo-name">Aspirants</span>
        </Link>

        <nav className="header-nav">
          <Link href="/">Home</Link>
          <Link href="/ask-doubts">Ask Doubts</Link>
          <Link href="/meditation">Meditation</Link>
          <Link href="/iq-tools">IQ Tools</Link>
          <Link href="/focus-room">Focus Room</Link>
        </nav>

        <div className="header-profile">
          <ProfileButton />
        </div>
      </div>

      <style jsx>{`
        .site-header {
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1400px;
          min-height: 72px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .logo-iq {
          background: #4f46e5;
          color: white;
          font-size: 20px;
          font-weight: 800;
          padding: 7px 9px;
          border-radius: 9px;
        }

        .logo-name {
          color: #111827;
          font-size: 21px;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .header-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
        }

        .header-nav a {
          color: #4b5563;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .header-nav a:hover {
          color: #4f46e5;
        }

        .header-profile {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .header-container {
            flex-wrap: wrap;
            padding: 12px 18px;
          }

          .header-nav {
            order: 3;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 18px;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 10px 12px;
            gap: 12px;
          }

          .logo-name {
            font-size: 18px;
          }

          .header-nav {
            gap: 14px;
          }

          .header-nav a {
            font-size: 12px;
          }
        }
      `}</style>
    </header>
  );
}