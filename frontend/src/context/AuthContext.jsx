import { createContext, useContext, useState, useEffect } from "react";
import BASE_URL from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // On app load, verify session with backend
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }

    fetch(`${BASE_URL}/auth/check`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setUser({ userId: data.userId, fullName: data.fullName, email: data.email });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Refresh cart count
  const refreshCartCount = () => {
    if (!user) { setCartCount(0); return; }
    fetch(`${BASE_URL}/cart`, { credentials: "include" })
      .then(r => r.json())
      .then(items => {
        if (Array.isArray(items)) setCartCount(items.reduce((s, i) => s + i.quantity, 0));
      })
      .catch(() => {});
  };

  useEffect(() => { if (user) refreshCartCount(); else setCartCount(0); }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    setCartCount(0);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, cartCount, setCartCount, refreshCartCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);