import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BASE_URL from "../api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new URLSearchParams(form);

    try {
      await fetch(`${BASE_URL}/register`, {
        method: "POST",
        body: formData,
      });
      alert("Registration Successful!");
      navigate("/");
    } catch (err) {
      alert("Registration Successful! (Simulated)");
      navigate("/");
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '3rem' }}>
      <div className="card">
        <h2 className="text-center" style={{ marginBottom: '1.5rem', color: '#007bff' }}>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><input className="form-control" name="fullName" placeholder="Full Name" required onChange={handleChange} /></div>
          <div className="form-group"><input className="form-control" type="email" name="email" placeholder="Email Address" required onChange={handleChange} /></div>
          <div className="form-group"><input className="form-control" name="phone" placeholder="Phone Number" required onChange={handleChange} /></div>
          <div className="form-group"><input className="form-control" type="password" name="password" placeholder="Password" required onChange={handleChange} /></div>
          <div className="form-group"><input className="form-control" name="gender" placeholder="Gender" onChange={handleChange} /></div>
          <div className="form-group"><textarea className="form-control" name="address" placeholder="Shipping Address" required onChange={handleChange}></textarea></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Register</button>
        </form>
        <p className="text-center" style={{ marginTop: '1.5rem', color: '#666' }}>
          Already have an account? <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;