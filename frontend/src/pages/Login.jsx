import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login({setIsAuthenticated, setCurrentUser}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      // FIX: Properly stringify the user object
      localStorage.setItem("current_user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      setCurrentUser(data.user);
      navigate("/chat");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className="input-field">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Enter your email</label>
        </div>
        <div className="input-field">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <label>Enter your password</label>
        </div>
        <div className="forget">
          <label><input type="checkbox" /> Remember me</label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button type="submit">Log In</button>
        <div className="register">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </form>
    </div>
  );
}
