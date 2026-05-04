import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="profile-header">
        <div className="profile-avatar">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <h2 className="profile-name">{user.fullName || "User"}</h2>
          <p className="profile-email">{user.email || "user@example.com"}</p>
        </div>
      </div>
      
      <h3>Account Details</h3>
      <div className="profile-grid" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <div className="form-field">
          <label className="form-label">User ID</label>
          <div className="form-input" style={{ background: 'var(--bg-3)', color: 'var(--text-2)' }}>#{user.userId || "N/A"}</div>
        </div>
      </div>
      
      <button className="btn btn-ghost" onClick={logout}>
        Sign Out
      </button>
    </div>
  );
}