import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function Logout({setIsAuthenticated, setCurrentUser}) {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      const refresh = localStorage.getItem("refresh");
      const access = localStorage.getItem("access");
      console.log(refresh)
      console.log(access)
      if (refresh && access) {
        try {
          const response = await fetch("http://127.0.0.1:8000/api/auth/logout/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access}`, // ✅ Must include Bearer
            },
            body: JSON.stringify({ refresh }),
          });

          console.log("Response:", response.status);
          const data = await response.json().catch(() => null);
          setIsAuthenticated(false)
          setCurrentUser(null)
        } catch (err) {
          console.error("Logout failed:", err);
        }
      }

      // Remove tokens after logout regardless of success
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("current_user");
      navigate("/login");
    };

    logoutUser();
  }, [navigate]);

  return <p>Logging out...</p>;
}
