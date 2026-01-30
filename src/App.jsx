import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Singup"; 
import Home from "./pages/Home";
import LiquidEther from './components/LiquidEther';

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
      <div className="relative min-h-screen w-full bg-transparent">
        
        {/* GLOBAL BACKGROUND LAYER */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* We wrap it in a div with explicit dimensions to force the canvas to render */}
          
          {/* This overlay ensures the background stays dark enough for readability */}
          <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
        </div>

        {/* CONTENT LAYER */}
        <div className="relative z-10 w-full min-h-screen">
          <Routes>
            <Route path="/leads" element={<Landing />} />

            <Route 
              path="/leads/login" 
              element={user && user.emailVerified ? <Navigate to="/leads/home" /> : <Login />} 
            />
            <Route 
              path="/leads/signup" 
              element={user && user.emailVerified ? <Navigate to="/leads/home" /> : <Signup />} 
            />

            <Route 
              path="/leads/home" 
              element={
                user ? (
                  user.emailVerified ? (
                    <Home />
                  ) : (
                    <Navigate to="/leads/signup" state={{ fromLogin: true, userEmail: user.email }} />
                  )
                ) : (
                  <Navigate to="/leads/login" />
                )
              } 
            />

            <Route path="*" element={<Navigate to="/leads" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}