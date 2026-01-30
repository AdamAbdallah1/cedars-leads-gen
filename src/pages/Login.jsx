import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { FaUserAlt, FaLock, FaSignInAlt, FaKey, FaTimes, FaEnvelope, FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState({ text: "", isError: false });
  
  const emailRef = useRef();
  const navigate = useNavigate();

  useEffect(() => emailRef.current?.focus(), []);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) return setError("Required fields missing");
    
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
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return setResetMessage({ text: "Enter your email", isError: true });
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ text: "Recovery link sent!", isError: false });
      setTimeout(() => {
        setShowResetModal(false);
        setResetMessage({ text: "", isError: false });
      }, 3000);
    } catch (err) {
      setResetMessage({ text: "Registry not found.", isError: true });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 h-full w-full bg-slate-950 pointer-events-none">
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 w-full max-w-md p-10 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl flex flex-col"
      >
        <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              Cedars <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent text-3xl">Tech</span>
            </h2>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2 italic">Authentication Terminal</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center bg-black/50 rounded-2xl border border-white/5 p-4">
            <FaUserAlt size={12} className="text-slate-500 mr-3"/>
            <input ref={emailRef} type="email" placeholder="OPERATOR EMAIL" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent text-white outline-none text-xs font-bold uppercase" />
          </div>

          <div className="flex items-center bg-black/50 rounded-2xl border border-white/5 p-4">
            <FaLock size={12} className="text-slate-500 mr-3"/>
            <input type="password" placeholder="ACCESS KEY" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent text-white outline-none text-xs font-bold" />
          </div>

          <button type="button" onClick={() => setShowResetModal(true)} className="text-[10px] font-black text-blue-400/60 hover:text-blue-400 uppercase tracking-widest block mx-auto py-2">
            [ Recover Lost Access Key ]
          </button>

          {error && (
            <div className="flex items-center gap-2 justify-center bg-rose-500/10 border border-rose-500/20 py-3 rounded-xl">
                <FaExclamationTriangle className="text-rose-500" size={12}/>
                <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] shadow-lg">
            AUTHORIZE ACCESS <FaSignInAlt className="inline ml-2"/>
          </motion.button>

          <p className="text-center text-slate-500 mt-6 text-xs font-bold uppercase">
            New Operator? <Link to="/leads/signup" className="text-blue-400 hover:text-blue-300 underline ml-1">Create Registry</Link>
          </p>
        </div>
      </motion.div>

      {/* MODAL REMAINING THE SAME */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-10 relative">
              <button onClick={() => setShowResetModal(false)} className="absolute top-8 right-8 text-slate-500"><FaTimes/></button>
              <h3 className="text-2xl font-black text-white uppercase italic text-center mb-6">Key Recovery</h3>
              <input type="email" placeholder="OPERATOR EMAIL" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-black/50 rounded-2xl border border-white/5 p-4 text-white text-xs mb-4" />
              {resetMessage.text && <p className={`text-[9px] font-black uppercase text-center mb-4 ${resetMessage.isError ? 'text-rose-500' : 'text-emerald-500'}`}>{resetMessage.text}</p>}
              <button onClick={handleResetPassword} className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] tracking-widest">SEND RECOVERY LINK</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}