import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Singup"; // Note: Check if your filename is 'Singup' or 'Signup'
import Home from "./pages/Home";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; 

  return (
    <Router>
      <Routes>
        <Route path="/leads" element={<Landing />} />

        {/* Redirect verified users away from Auth pages */}
        <Route 
          path="/leads/login" 
          element={user && user.emailVerified ? <Navigate to="/leads/home" /> : <Login />} 
        />
        <Route 
          path="/leads/signup" 
          element={user && user.emailVerified ? <Navigate to="/leads/home" /> : <Signup />} 
        />

        {/* Protected Route Logic */}
        <Route 
          path="/leads/home" 
          element={
            user ? (
              user.emailVerified ? (
                <Home />
              ) : (
                // User exists but not verified -> Send to Scanner
                <Navigate to="/leads/signup" state={{ fromLogin: true, userEmail: user.email }} />
              )
            ) : (
              // No user at all -> Send to Login
              <Navigate to="/leads/login" />
            )
          } 
        />

        <Route path="*" element={<Navigate to="/leads" />} />
      </Routes>
    </Router>
  );
}