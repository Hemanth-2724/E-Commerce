import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, cartCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <style>{`
        .navbar { position: sticky; top: 0; z-index: 9999; background-color: var(--bg-1); }
        .navbar-header { display: flex; align-items: center; position: relative; z-index: 1001; }
        .navbar-links { position: relative; z-index: 1001; }
        .mobile-menu-btn { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-1); padding: 0.5rem; }
        @media (max-width: 768px) {
          .navbar { padding: 1rem; border-bottom: 1px solid var(--border); background-color: var(--bg-1); }
          .navbar-header { width: 100%; justify-content: space-between; }
          .navbar-links { position: absolute; top: 100%; left: 0; right: 0; background-color: var(--bg-1); flex-direction: column; align-items: stretch; gap: 0.5rem; display: none; padding: 1.5rem; border-bottom: 1px solid var(--border); border-radius: 0 0 24px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); z-index: 1001; }
          .navbar-links.open { display: flex; animation: slideDown 0.2s ease-out forwards; }
          .navbar-links a { width: 100%; padding: 1rem; border-radius: 12px; font-weight: 500; background-color: transparent; }
          .navbar-links a:hover { background-color: var(--bg-2); }
          .mobile-menu-btn { display: block; z-index: 1002; }
          .nav-divider { display: none; }
          .btn-ghost { width: 100%; justify-content: flex-start; padding: 1rem; margin-left: 0 !important; font-weight: 500; border-radius: 12px; background-color: transparent; }
          .btn-ghost:hover { background-color: var(--bg-2); }
        }
        @keyframes letterReveal {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .letter-reveal {
          display: inline-block;
          opacity: 0;
          animation: letterReveal 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
      
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 1000, animation: 'fadeIn 0.3s ease-out' }}
        />
      )}
      
      <div className="navbar-header">
        <Link to="/products" className="navbar-brand" style={{ display: 'inline-flex' }}>
          <div style={{ display: 'flex' }}>
            {"LUXE".split("").map((char, i) => (
              <div key={`luxe-${i}`} className="letter-reveal" style={{ animationDelay: `${i * 0.06}s` }}>{char}</div>
            ))}
          </div>
          <span style={{ display: 'flex' }}>
            {"FASHION".split("").map((char, i) => (
              <div key={`fashion-${i}`} className="letter-reveal" style={{ animationDelay: `${(i + 4) * 0.06}s` }}>{char}</div>
            ))}
          </span>
        </Link>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className={`navbar-links ${isMobileMenuOpen ? "open" : ""}`}>
        <Link to="/products" className={isActive("/products")} onClick={() => setIsMobileMenuOpen(false)}>
          <span>Collections</span>
        </Link>
        <Link to="/orders" className={isActive("/orders")} onClick={() => setIsMobileMenuOpen(false)}>
          <span>Orders</span>
        </Link>
        <Link to="/profile" className={isActive("/profile")} onClick={() => setIsMobileMenuOpen(false)}>
          <span>Profile</span>
        </Link>

        <div className="nav-divider" />

        <Link to="/cart" className={`nav-cart ${isActive("/cart")}`} style={{ display: 'flex', alignItems: 'center', position: 'relative' }} onClick={() => setIsMobileMenuOpen(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
        </Link>

        <button
          onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
          className="btn btn-ghost btn-sm"
          style={{ marginLeft: '0.5rem' }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}