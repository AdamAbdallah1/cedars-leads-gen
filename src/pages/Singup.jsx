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

  useEffect(() => {
    let interval;
    let unsubscribe;
    if (isSent) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          if (interval) clearInterval(interval);
          interval = setInterval(async () => {
            try {
              await reload(user); 
              if (user.emailVerified) {
                clearInterval(interval);
                if (unsubscribe) unsubscribe();
                navigate("/leads/home"); 
              }
            } catch (err) {
              console.error("Scanner Error:", err);
            }
          }, 3000);
        }
      });
    }
    return () => {
      if (interval) clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, [isSent, navigate]);

  const handleSignup = async () => {
    setError("");
    if (!accepted) return setError("Accept terms to continue.");
    if (!email || !password) return setError("Details required.");
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(res.user);
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
      setError(err.code === "auth/email-already-in-use" ? "Email already exists." : "Signup failed.");
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setResending(true);
    try { if (auth.currentUser) await sendEmailVerification(auth.currentUser); } 
    catch (err) { setError("Resend failed."); } 
    finally { setResending(false); }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 font-sans selection:bg-pink-500/30 overflow-hidden">
      
      {/* YOUR SPECIFIC BACKGROUND - APPLIED */}
      <div className="absolute inset-0 h-full w-full bg-slate-950 pointer-events-none">
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[380px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Top Accent Line - Pink theme */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />

        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="text-center">
                    <motion.div 
                      whileHover={{ rotate: 45, scale: 1.1 }}
                      className="w-12 h-12 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
                    >
                        <div className="w-5 h-5 border-[2.5px] border-slate-950 rounded-sm rotate-45"></div>
                    </motion.div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Cedars Tech</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Create operator account</p>
                </div>

                <div className="space-y-3">
                    <motion.input 
                      whileFocus={{ scale: 1.01 }}
                      ref={emailRef} type="email" placeholder="Email Address" value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3.5 outline-none text-sm transition-all focus:border-pink-500/50 focus:bg-white/[0.08] placeholder:text-slate-600" 
                    />
                    <div className="relative group">
                        <motion.input 
                          whileFocus={{ scale: 1.01 }}
                          type={showPassword ? "text" : "password"} placeholder="Password" value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3.5 outline-none text-sm transition-all focus:border-pink-500/50 focus:bg-white/[0.08] placeholder:text-slate-600" 
                        />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1">
                          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-1 cursor-pointer group" onClick={() => setAccepted(!accepted)}>
                    <motion.div 
                      animate={accepted ? { scale: [1, 1.2, 1] } : {}}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${accepted ? 'bg-pink-600 border-pink-600 shadow-[0_0_10px_rgba(219,39,119,0.5)]' : 'border-white/20 bg-white/5 group-hover:border-white/40'}`}
                    >
                      {accepted && <FaCheck size={10} className="text-white" />}
                    </motion.div>
                    <p className="text-xs text-slate-400 font-medium select-none">
                      I accept the <button onClick={(e) => {e.stopPropagation(); setShowTerms(true);}} className="text-pink-400 hover:text-pink-300 transition-colors">Terms of Service</button>
                    </p>
                </div>

                {error && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-rose-400 text-center text-xs font-semibold">{error}</motion.p>}

                <motion.button 
                  whileHover={accepted && !loading ? { scale: 1.02, backgroundColor: "#f8fafc" } : {}} 
                  whileTap={accepted && !loading ? { scale: 0.98 } : {}}
                  onClick={handleSignup} disabled={loading || !accepted} 
                  className={`relative w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden ${accepted && !loading ? 'bg-white text-slate-950 shadow-xl' : 'bg-white/10 text-slate-600 cursor-not-allowed'}`}
                >
                    {/* Shimmer Effect */}
                    {accepted && !loading && (
                      <motion.div 
                        initial={{ x: "-100%" }} animate={{ x: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-200/20 to-transparent"
                      />
                    )}
                    {loading ? <FaSpinner className="animate-spin text-lg" /> : "Get Started"}
                </motion.button>

                <p className="text-center text-xs font-medium text-slate-500 pt-2">
                  Member already? <Link to="/leads/login" className="text-white hover:text-pink-400 underline-offset-4 hover:underline transition-all">Log in</Link>
                </p>
            </motion.div>
          ) : (
            <motion.div key="waiting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-2">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-pink-500/20 rounded-full animate-ping"></div>
                <div className="relative w-20 h-20 bg-gradient-to-b from-pink-500/10 to-transparent border border-white/10 rounded-full flex items-center justify-center">
                    <FaPaperPlane className="text-white text-2xl" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Check Your Inbox</h3>
                <p className="text-slate-400 text-sm leading-relaxed px-4">
                  Sent to <span className="text-white font-semibold">{email}</span>. Click the link to verify.
                </p>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium italic">
                  <FaSpinner className="animate-spin text-pink-500" />
                  Auto-syncing...
                </div>
                <button onClick={resendEmail} disabled={resending} className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-2 mx-auto active:scale-95 transition-transform">
                    <FaSyncAlt className={resending ? 'animate-spin' : ''} /> {resending ? 'Sending...' : 'Resend link'}
                </button>
              </div>
              <button onClick={() => { signOut(auth); setIsSent(false); }} className="text-[10px] text-slate-600 hover:text-rose-400 font-bold uppercase tracking-widest pt-2 transition-colors">Switch Email</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] w-full max-w-[340px] shadow-2xl text-center"
            >
              <h3 className="text-lg font-bold text-white mb-4">Terms of Use</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">Cedars Tech maintains high digital ethics. By proceeding, you agree to our data protection protocols.</p>
              <button onClick={() => {setAccepted(true); setShowTerms(false);}} className="w-full bg-white text-slate-950 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-transform">I Agree</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}