import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { FaEye, FaEyeSlash, FaSignInAlt, FaSyncAlt, FaTimes, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState({ text: "", isError: false });
  const [resetLoading, setResetLoading] = useState(false);
  
  const emailRef = useRef();
  const navigate = useNavigate();

  useEffect(() => emailRef.current?.focus(), []);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) return setError("Required fields missing");
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        navigate("/leads/signup", { state: { fromLogin: true, userEmail: user.email } }); 
        return;
      }
      navigate("/leads/home");
    } catch (err) {
      setError("Invalid credentials or unauthorized.");
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return setResetMessage({ text: "Enter your email", isError: true });
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ text: "Recovery link sent!", isError: false });
      setTimeout(() => {
        setShowResetModal(false);
        setResetMessage({ text: "", isError: false });
        setResetLoading(false);
      }, 3000);
    } catch (err) {
      setResetMessage({ text: "Registry not found.", isError: true });
      setResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 font-sans selection:bg-pink-500/30 overflow-hidden">
      
      {/* YOUR SPECIFIC BACKGROUND - FIXED */}
      <div className="absolute inset-0 h-full w-full bg-slate-950 pointer-events-none">
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[380px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Top Accent Line - Matches pink theme */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />

        <div className="space-y-6">
          <div className="text-center">
              <motion.div 
                whileHover={{ rotate: 45, scale: 1.1 }}
                className="w-12 h-12 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
              >
                  <div className="w-5 h-5 border-[2.5px] border-slate-950 rounded-sm rotate-45"></div>
              </motion.div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Cedars Tech</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Operator Authentication</p>
          </div>

          <div className="space-y-3">
              <motion.input 
                whileFocus={{ scale: 1.01 }}
                ref={emailRef} type="email" placeholder="Email Address" value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3.5 outline-none text-sm transition-all focus:border-pink-500/50 focus:bg-white/[0.08] placeholder:text-slate-600" 
              />
              <div className="relative">
                  <motion.input 
                    whileFocus={{ scale: 1.01 }}
                    type={showPassword ? "text" : "password"} placeholder="Access Key" value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3.5 outline-none text-sm transition-all focus:border-pink-500/50 focus:bg-white/[0.08] placeholder:text-slate-600" 
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1">
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
              </div>
          </div>

          <button onClick={() => setShowResetModal(true)} className="text-xs font-semibold text-pink-400/80 hover:text-pink-300 block mx-auto transition-colors">
            Forgot access key?
          </button>

          {error && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-rose-400 text-center text-xs font-semibold">{error}</motion.p>}

          <motion.button 
            whileHover={!loading ? { scale: 1.02, backgroundColor: "#f8fafc" } : {}} 
            whileTap={!loading ? { scale: 0.98 } : {}}
            onClick={handleLogin} disabled={loading} 
            className="relative w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden bg-white text-slate-950 shadow-xl disabled:bg-white/10 disabled:text-slate-600"
          >
              {!loading && (
                <motion.div 
                  initial={{ x: "-100%" }} animate={{ x: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-200/20 to-transparent"
                />
              )}
              {loading ? <FaSpinner className="animate-spin text-lg" /> : <>Authorize Access <FaSignInAlt size={14}/></>}
          </motion.button>

          <p className="text-center text-xs font-medium text-slate-500 pt-2">
            New operator? <Link to="/leads/signup" className="text-white hover:text-pink-400 underline-offset-4 hover:underline transition-all">Create Registry</Link>
          </p>
        </div>
      </motion.div>

      {/* Recovery Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-[340px] shadow-2xl relative"
            >
              <button onClick={() => setShowResetModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                <FaTimes size={18}/>
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/20">
                  <FaSyncAlt className="text-pink-500" size={18}/>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Recover Access</h3>
              </div>

              <input 
                type="email" placeholder="Operator Email" value={resetEmail} 
                onChange={e => setResetEmail(e.target.value)} 
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white mb-4 outline-none focus:border-pink-500" 
              />
              
              {resetMessage.text && (
                <p className={`text-xs font-bold text-center mb-4 ${resetMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {resetMessage.text}
                </p>
              )}

              <button 
                onClick={handleResetPassword} 
                disabled={resetLoading}
                className="w-full bg-white text-slate-950 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {resetLoading ? <FaSpinner className="animate-spin"/> : "Send Recovery Link"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}