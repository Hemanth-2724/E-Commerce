import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";

export default function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "", gender: "", address: "",
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);

    const { confirmPassword, ...payload } = form;
    const formData = new URLSearchParams(payload);

    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      if (text.includes("SUCCESS") || text.includes("Successful")) {
        addToast("Account created! Please sign in.", "success");
        navigate("/");
      } else {
        setError(text.replace("Registration Failed ❌ -> ", ""));
      }
    } catch {
      setError("Cannot reach server. Is Tomcat running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">LUXE</div>
        <p className="auth-tagline">Join the world of curated fashion</p>

        {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-grid">
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="fullName" placeholder="Jane Doe" required onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" placeholder="+91 9999999999" onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" name="email" placeholder="your@email.com" required onChange={handleChange} />
          </div>

          <div className="profile-grid">
            <div className="form-field">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" placeholder="••••••••" required onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" name="confirmPassword" placeholder="••••••••" required onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Gender</label>
            <select className="form-select" name="gender" onChange={handleChange}>
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Shipping Address</label>
            <textarea className="form-textarea" name="address" placeholder="Your full address…" required onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: '0.9rem' }}>
          Already have an account?{" "}
          <Link to="/" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}