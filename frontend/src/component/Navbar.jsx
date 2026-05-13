import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, cartCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      if (typeof logout === "function") await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/products", { replace: true });
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link to="/products" className="navbar-brand" style={{ display: "inline-flex" }}>
          <div style={{ display: "flex" }}>
            {"LUXE".split("").map((char, i) => (
              <div key={`luxe-${i}`} className="letter-reveal" style={{ animationDelay: `${i * 0.06}s` }}>
                {char}
              </div>
            ))}
          </div>
          <span style={{ display: "flex" }}>
            {"FASHION".split("").map((char, i) => (
              <div key={`fashion-${i}`} className="letter-reveal" style={{ animationDelay: `${(i + 4) * 0.06}s` }}>
                {char}
              </div>
            ))}
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link to="/products" className={isActive("/products")}>
            <span>Collections</span>
          </Link>

          {/* Categories — visible to everyone */}
          <Link to="/categories" className={isActive("/categories")}>
            <span>Categories</span>
          </Link>

          {user && (
            <>
              <Link to="/orders" className={isActive("/orders")}>
                <span>Orders</span>
              </Link>
              <Link to="/profile" className={isActive("/profile")}>
                <span>Profile</span>
              </Link>
            </>
          )}

          <div className="nav-divider" />

          {user ? (
            <>
              <Link
                to="/cart"
                className={`nav-cart ${location.pathname === "/cart" ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", position: "relative" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount > 9 ? "9+" : cartCount}</span>
                )}
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ marginLeft: "0.5rem" }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ marginLeft: "0.5rem" }}>
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-sm"
                style={{ marginLeft: "0.5rem", background: "var(--rose)", color: "#0a0a0b", padding: "0.4rem 1rem", borderRadius: "8px", fontWeight: "600", textDecoration: "none" }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div className={`mobile-overlay${isMobileMenuOpen ? " open" : ""}`} onClick={closeMenu} />

      <div
        style={{
          position: "fixed", top: 0, right: isMobileMenuOpen ? 0 : "-100%",
          height: "100vh", width: "min(320px, 85vw)",
          background: "rgba(10, 10, 14, 0.98)", backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)", borderLeft: "1px solid rgba(255,255,255,0.06)",
          zIndex: 1200, transition: "right 0.35s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto", display: "flex", flexDirection: "column",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 700, color: "#e8b4a0", letterSpacing: "0.1em" }}>
            LUXE
          </span>
          <button
            onClick={closeMenu}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#8a879a", cursor: "pointer", padding: "0.35rem 0.55rem", display: "flex", alignItems: "center", transition: "all 0.2s" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* User info (logged in only) */}
        {user && (
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(232,180,160,0.04)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(232,180,160,0.2), rgba(126,205,200,0.1))", border: "1.5px solid rgba(232,180,160,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#e8b4a0", fontWeight: 600, marginBottom: "0.6rem" }}>
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f0eef8" }}>{user.fullName}</div>
            <div style={{ fontSize: "0.75rem", color: "#8a879a", marginTop: "0.1rem", wordBreak: "break-all" }}>{user.email}</div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ padding: "1rem", flex: 1 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#4a4758", padding: "0.3rem 0.6rem 0.6rem", marginBottom: "0.2rem" }}>
            Menu
          </div>

          {[
            {
              to: "/products",
              label: "Collections",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            },
            {
              to: "/categories",
              label: "Categories",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            },
            ...(user ? [
              { to: "/orders",  label: "My Orders", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { to: "/profile", label: "Profile",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ] : [])
          ].map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "0.85rem 0.9rem", borderRadius: "12px", textDecoration: "none", color: active ? "#e8b4a0" : "#8a879a", background: active ? "rgba(232,180,160,0.08)" : "transparent", border: `1px solid ${active ? "rgba(232,180,160,0.2)" : "transparent"}`, fontWeight: active ? 600 : 500, fontSize: "0.92rem", marginBottom: "0.25rem", transition: "all 0.2s" }}>
                <span style={{ color: active ? "#e8b4a0" : "#4a4758" }}>{icon}</span>
                {label}
                {active && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#e8b4a0" }} />}
              </Link>
            );
          })}

          {/* Cart (logged in only) */}
          {user && (
            <Link to="/cart" onClick={closeMenu} style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "0.85rem 0.9rem", borderRadius: "12px", textDecoration: "none", color: location.pathname === "/cart" ? "#e8b4a0" : "#8a879a", background: location.pathname === "/cart" ? "rgba(232,180,160,0.08)" : "transparent", border: `1px solid ${location.pathname === "/cart" ? "rgba(232,180,160,0.2)" : "transparent"}`, fontWeight: location.pathname === "/cart" ? 600 : 500, fontSize: "0.92rem", marginBottom: "0.25rem", transition: "all 0.2s" }}>
              <span style={{ color: location.pathname === "/cart" ? "#e8b4a0" : "#4a4758" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </span>
              Cart
              {cartCount > 0 && (
                <span style={{ marginLeft: "auto", background: "#e8b4a0", color: "#0a0a0b", fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "20px", minWidth: "22px", textAlign: "center" }}>
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Bottom actions */}
        {user ? (
          <div style={{ padding: "1rem 1.5rem 2rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={handleLogout}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.85rem", padding: "0.85rem 0.9rem", borderRadius: "12px", background: "rgba(224,112,112,0.06)", border: "1px solid rgba(224,112,112,0.18)", color: "#e07070", cursor: "pointer", fontSize: "0.92rem", fontWeight: 600, fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ padding: "1rem 1.5rem 2rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "0.5rem" }}>
            <Link to="/login" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeMenu}>
              Sign In
            </Link>
            <Link to="/register" className="btn" style={{ flex: 1, justifyContent: "center", background: "var(--rose)", color: "#0a0a0b", border: "none" }} onClick={closeMenu}>
              Sign Up
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .navbar-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
      `}</style>
    </>
  );
}