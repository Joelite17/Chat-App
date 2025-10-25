// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserList from "./components/chats/UserList";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatRoomPage from "./pages/ChatRoomPage";
import ChatApp from "./pages/ChatApp"; // New chat page
import Profile from "./pages/Profile"; // Optional profile page
import "./styles/auth.css";
import "./styles/chat.css";
import './styles/chatroom.css'; // ← ADD THIS LINE
import "./App.css"
import { useState, useEffect } from "react";


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      const storedUser = localStorage.getItem("current_user");
      const accessToken = localStorage.getItem("access");
      
      if (storedUser && accessToken) {
        try {
          // Optional: Verify token is still valid by making an API call
          const isValid = await verifyToken(accessToken);
          
          if (isValid) {
            setCurrentUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            clearAuthStorage();
          }
        } catch (error) {
          console.error("Auth validation error:", error);
          clearAuthStorage();
        }
      } else {
        clearAuthStorage();
      }
      setLoading(false);
    };

    validateAuth();
  }, []);

  const clearAuthStorage = () => {
    localStorage.removeItem("current_user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Simple token verification function
  const verifyToken = async (token) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/verify/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} currentUser={currentUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />} />
        <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/users" element={isAuthenticated ? (<UserList currentUser={currentUser} /> ) : (<Navigate to="/login" replace />)}/>
        <Route  path="/chat" element={isAuthenticated ? (<ChatApp currentUser={currentUser} />) : (<Navigate to="/login" replace />)}/>
        <Route  path="/chat/room/:roomId" element={isAuthenticated ? <ChatRoomPage currentUser={currentUser} /> : <Navigate to="/login" replace />}/>
        <Route path="/profile" element={isAuthenticated ? (<Profile currentUser={currentUser} />) : (<Navigate to="/login" replace />)}/>
      </Routes>
    </Router>
  );
}

// Simple Home component
function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to MyAuth Chat</h1>
        <p>Connect and chat with other users in real-time</p>
      </div>
    </div>
  );
}