import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, reload, signOut, onAuthStateChanged } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { FaEye, FaEyeSlash, FaCheck, FaPaperPlane, FaSpinner, FaSyncAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Signup() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSent, setIsSent] = useState(location.state?.fromLogin || false);
  const [email, setEmail] = useState(location.state?.userEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const emailRef = useRef();

  useEffect(() => {
    if (!isSent) emailRef.current?.focus();
  }, [isSent]);

  // --- THE FIXED SCANNER LOGIC ---
  useEffect(() => {
    let interval;

    if (isSent) {
      // 1. Immediate Listener to ensure we have the user object
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // 2. Start Polling every 3 seconds
          interval = setInterval(async () => {
            try {
              await reload(user); // Force refresh the token from Firebase
              if (user.emailVerified) {
                clearInterval(interval);
                unsubscribe();
                navigate("/leads/home"); 
              }
            } catch (err) {
              console.error("Scanner Error:", err);
            }
          }, 3000);
        }
      });

      return () => {
        if (interval) clearInterval(interval);
        unsubscribe();
      };
    }
  }, [isSent, navigate]);

  const handleSignup = async () => {
    setError("");
    if (!accepted) return setError("Accept deployment terms first.");
    if (!email || !password) return setError("Missing credentials.");
    
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(res.user);
      
      // CREATE THE USER IN FIRESTORE WITH 5 CREDITS
      await setDoc(doc(db, "users", res.user.uid), { 
        uid: res.user.uid,
        email: email,
        plan: "free",
        attemptsLeft: 5, 
        createdAt: serverTimestamp(),
        role: "user"
      });
      
      setIsSent(true); 
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
          setError("Operator already registered.");
      } else {
          setError("Registry failure.");
      }
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setResending(true);
    try {
      if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
      }
    } catch (err) { 
        setError("Resend failed."); 
    } finally { 
        setResending(false); 
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 text-white overflow-hidden">
      <div className="absolute inset-0 h-full w-full bg-slate-950">
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md p-10 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl flex flex-col">
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase">New <span className="text-emerald-400">Registry</span></h2>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2 italic">Operator Initialization</p>
                </div>
                <input ref={emailRef} type="email" placeholder="OPERATOR EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/50 rounded-2xl border border-white/5 p-4 outline-none text-xs font-bold focus:border-emerald-500/50 transition-all uppercase" />
                <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="ACCESS KEY" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/50 rounded-2xl border border-white/5 p-4 outline-none text-xs font-bold focus:border-emerald-500/50 transition-all" />
                    <div onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 cursor-pointer">{showPassword ? <FaEyeSlash /> : <FaEye />}</div>
                </div>
                <div className="flex items-center gap-3 px-2" onClick={() => setAccepted(!accepted)}>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${accepted ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-white/20 bg-black/40'}`}>
                      {accepted && <FaCheck size={10} className="text-black" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">I accept the <button onClick={(e) => {e.stopPropagation(); setShowTerms(true);}} className="text-emerald-400 hover:underline">Terms</button></p>
                </div>
                {error && <p className="text-rose-500 text-center text-[10px] font-black uppercase bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSignup} disabled={loading} className={`w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] transition-all shadow-lg ${accepted && !loading ? 'bg-gradient-to-r from-emerald-700 to-teal-700' : 'bg-slate-800 opacity-50 cursor-not-allowed'}`}>
                    {loading ? "COMMENCING..." : "CREATE REGISTRY"}
                </motion.button>
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-4">Already registered? <Link to="/leads/login" className="text-emerald-400 hover:underline">Access Terminal</Link></p>
            </motion.div>
          ) : (
            <motion.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <FaSpinner className="text-emerald-500 text-6xl animate-spin opacity-20 absolute inset-0 m-auto" />
                <FaPaperPlane className="text-emerald-400 text-2xl absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black uppercase italic">Identity Verification</h3>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">Encryption link deployed to:<br/><span className="text-emerald-400 block mt-1">{email}</span></p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl space-y-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-normal">Confirm via email to <span className="text-white underline">automatically redirect</span>.</p>
                <button onClick={resendEmail} disabled={resending} className="text-[9px] text-slate-500 hover:text-emerald-400 font-black uppercase tracking-[0.2em] flex items-center gap-2 mx-auto">
                    <FaSyncAlt className={resending ? 'animate-spin' : ''}/> {resending ? 'Resending...' : 'Resend Email'}
                </button>
              </div>
              <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] animate-pulse">Scanning Registry Status...</p>
              <button onClick={() => { signOut(auth); setIsSent(false); }} className="text-[9px] text-rose-500 font-bold uppercase opacity-50 hover:opacity-100 transition-opacity">Wrong email? Cancel Registry</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] w-full max-w-sm text-center">
              <h3 className="text-white font-black uppercase mb-4">Terms</h3>
              <p className="text-slate-400 text-xs mb-6 uppercase leading-loose font-bold">Usage of Cedars Tech implies agreement to Lebanese digital ethical standards.</p>
              <button onClick={() => {setAccepted(true); setShowTerms(false);}} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-xs uppercase">I AGREE</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}