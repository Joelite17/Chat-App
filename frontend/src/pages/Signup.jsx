import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log([username, email, password1, password2])
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password: password1, password2 }),
      });

      const data = await res.json();
      console.log("📩 Server Response:", data);

      if (res.ok) {
        navigate("/login");
      } else {
        console.error("❌ Signup failed:", data);
        alert(`Signup failed: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error("🔥 Network or Server Error:", err);
      alert("An unexpected error occurred. Check the console for details.");
    }
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleSignup}>
        <h2>Sign up</h2>
        <div className="input-field">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label>Username</label>
        </div>
        <div className="input-field">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Email</label>
        </div>
        <div className="input-field">
          <input
            type="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
          />
          <label>Password 1</label>
        </div>
        <div className="input-field">
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          <label>Password 2</label>
        </div>
        <div className="forget">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button type="submit">Sign up</button>
        <div className="register">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
