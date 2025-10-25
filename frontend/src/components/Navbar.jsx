// components/Navbar.jsx
import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar({ isAuthenticated, currentUser }) {
  return (
    <header className="navbar">
      <div className="logo">
        <Link to="/">MyAuth Chat</Link>
      </div>
      <input type="checkbox" id="menu-toggle" />
      <label htmlFor="menu-toggle" className="menu-icon">&#9776;</label>
      <ul className="nav-links" style={{paddingRight: 100}}>
        <li><Link to="/">Home</Link></li> 
        
        {isAuthenticated ? (
          <>
            <li><Link to="/chat">Chat</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            {currentUser && (
              <li className="user-welcome">
                Welcome, {currentUser.username}!
              </li>
            )}
            <li><Link to="/logout">Logout</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}
      </ul>
    </header>
  );
}