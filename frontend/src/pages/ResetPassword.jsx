import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://127.0.0.1:8000/api/auth/reset-password/${uid}/${token}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password1, password2 }),
    });
    if (res.ok) {
      alert("Password reset successful!");
      navigate("/login");
    } else {
      alert("Failed to reset password.");
    }
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <div className="input-field">
          <input type="password" value={password1} onChange={(e) => setPassword1(e.target.value)} required />
          <label>New Password</label>
        </div>
        <div className="input-field">
          <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
          <label>Confirm New Password</label>
        </div>
        <button type="submit">Reset Password</button>
        <div className="register">
          <p>Back to <Link to="/login">Login</Link></p>
        </div>
      </form>
    </div>
  );
}
