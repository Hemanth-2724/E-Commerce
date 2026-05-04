import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, cartCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <Link to="/products" className="navbar-brand">
        LUXE<span>FASHION</span>
      </Link>

      <div className="navbar-links">
        <Link to="/products" className={isActive("/products")}>
          <span>Collections</span>
        </Link>
        <Link to="/orders" className={isActive("/orders")}>
          <span>Orders</span>
        </Link>
        <Link to="/profile" className={isActive("/profile")}>
          <span>Profile</span>
        </Link>

        <div className="nav-divider" />

        <Link to="/cart" className={`nav-cart ${isActive("/cart")}`}>
          🛍
          {cartCount > 0 && <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ marginLeft: '0.5rem' }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}