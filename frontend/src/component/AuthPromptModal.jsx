import { Link } from "react-router-dom";
import { useEffect } from "react";

/**
 * AuthPromptModal
 * Props:
 *   onClose   – called when backdrop or × is clicked
 *   action    – short string describing what requires auth, e.g. "add to cart" | "view cart"
 */
export default function AuthPromptModal({ onClose, action = "continue" }) {
  /* lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(5,5,7,0.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        animation: "authModalBgIn 0.25s ease",
      }}
    >
      <style>{`
        @keyframes authModalBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes authModalCardIn {
          from { opacity: 0; transform: scale(0.92) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes authIconFloat {
          0%,100% { transform: translateY(0)    rotate(-4deg); }
          50%      { transform: translateY(-7px) rotate(4deg); }
        }
        @keyframes authShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .auth-modal-sign-in:hover  { background: var(--rose) !important; color: #0a0a0b !important; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,180,160,0.45) !important; }
        .auth-modal-sign-up:hover  { background: rgba(126,205,200,0.18) !important; border-color: var(--teal) !important; color: var(--teal) !important; transform: translateY(-2px); }
        .auth-modal-close:hover    { background: rgba(255,255,255,0.08) !important; color: var(--text) !important; }
        .auth-modal-card::before {
          content: '';
          position: absolute;
          top: 0; left: 15%; right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--rose), transparent);
          opacity: 0.6;
        }
      `}</style>

      {/* Card — stop propagation so clicks inside don't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="auth-modal-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "linear-gradient(160deg, var(--surface) 0%, var(--bg-3) 100%)",
          border: "1px solid rgba(232,180,160,0.18)",
          borderRadius: "24px",
          padding: "2.6rem 2.2rem 2.2rem",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,180,160,0.06)",
          animation: "authModalCardIn 0.38s cubic-bezier(0.34,1.56,0.64,1)",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow orbs */}
        <div style={{ position:"absolute", top:-60, left:-40, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle, rgba(232,180,160,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, right:-40, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(126,205,200,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="auth-modal-close"
          style={{
            position: "absolute", top: "1rem", right: "1rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            color: "var(--text-3)",
            cursor: "pointer",
            width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
            zIndex: 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Animated bag icon */}
        <div style={{
          width: 72, height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(232,180,160,0.15) 0%, rgba(126,205,200,0.08) 100%)",
          border: "1.5px solid rgba(232,180,160,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
          animation: "authIconFloat 3s ease-in-out infinite",
          position: "relative", zIndex: 1,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.85rem",
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: "0.5rem",
          lineHeight: 1.15,
          position: "relative", zIndex: 1,
        }}>
          Sign in to {action === "view cart" ? "view your cart" : action === "add to cart" ? "add to cart" : "continue"}
        </h2>

        {/* Sub-text */}
        <p style={{
          color: "var(--text-2)",
          fontSize: "0.88rem",
          lineHeight: 1.65,
          marginBottom: "2rem",
          position: "relative", zIndex: 1,
        }}>
          Create a free account or sign in to{" "}
          {action === "view cart"
            ? "view your saved items and checkout."
            : "add items to your cart and complete your purchase."}
        </p>

        {/* Divider with shimmer */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(232,180,160,0.25), transparent)",
          marginBottom: "1.6rem",
          position: "relative", zIndex: 1,
        }} />

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative", zIndex: 1 }}>
          <Link
            to="/login"
            className="auth-modal-sign-in"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              padding: "0.9rem 1.5rem",
              borderRadius: "12px",
              background: "rgba(232,180,160,0.12)",
              border: "1.5px solid rgba(232,180,160,0.35)",
              color: "var(--rose)",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.92rem",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.03em",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Sign In
          </Link>

          <Link
            to="/register"
            className="auth-modal-sign-up"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              padding: "0.9rem 1.5rem",
              borderRadius: "12px",
              background: "rgba(126,205,200,0.06)",
              border: "1.5px solid rgba(126,205,200,0.2)",
              color: "var(--teal)",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.92rem",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.03em",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Create Account
          </Link>

          <button
            onClick={onClose}
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: "12px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "var(--text-3)",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.84rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.02em",
            }}
          >
            Continue browsing
          </button>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "1.4rem", position: "relative", zIndex: 1 }}>
          Free to join · No spam · Cancel anytime
        </p>
      </div>
    </div>
  );
}