import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:8000/api/auth/forgot-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    alert("If that email exists, a reset link was sent.");
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <div className="input-field">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Enter your email</label>
        </div>
        <button type="submit">Send Reset Link</button>
        <div className="register">
          <p>Remember your password? <Link to="/login">Log In</Link></p>
        </div>
      </form>
    </div>
  );
}
