import { useState } from "react";
import { 
  FaKey, FaSignOutAlt, FaUserCircle, FaTimes, 
  FaCrown, FaRocket, FaWhatsapp, FaExternalLinkAlt, FaCheckCircle 
} from "react-icons/fa";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion } from "framer-motion";

export default function Profile({ userEmail, attemptsLeft, plan, onLogout, onClose }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [hasClickedPay, setHasClickedPay] = useState(false);

  const isPro = plan === "pro" || userEmail === "your-email@gmail.com"; 

  // REPLACE 'YOUR_WHISH_LINK' with your actual Whish payment links
  const PRICING_TIES = [
    { 
        id: "1m", 
        name: "1 Month", 
        price: 5, 
        save: 0, 
        popular: false, 
        link: "https://whish.money/pay/LINK_1_MONTH" 
    },
    { 
        id: "6m", 
        name: "6 Months", 
        price: 25, 
        save: 5, 
        popular: true, 
        link: "https://whish.money/pay/LINK_6_MONTHS" 
    },
    { 
        id: "1y", 
        name: "1 Year", 
        price: 50, 
        save: 10, 
        popular: false, 
        link: "https://whish.money/pay/LINK_1_YEAR" 
    },
  ];

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setMessage("Success: Reset link sent to email.");
    } catch (err) {
      setMessage("Error: Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentLaunch = (link) => {
    window.open(link, '_blank');
    setHasClickedPay(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg flex flex-col gap-6 shadow-2xl text-white relative overflow-hidden"
    >
      {/* Glossy Top Bar Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />

      {/* Close Button */}
      <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition">
        <FaTimes size={18} />
      </button>

      {/* Header Info */}
      <div className="flex items-center gap-4 text-left border-b border-white/5 pb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${isPro ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
          <FaUserCircle size={28} />
        </div>
        <div>
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Account Registry</h2>
                {isPro && <span className="bg-blue-500 text-[7px] font-black px-2 py-0.5 rounded-md flex items-center gap-1"><FaCrown/> PRO</span>}
            </div>
            <p className="text-slate-500 text-[10px] font-mono">{userEmail}</p>
        </div>
      </div>

      {/* Engine Status / Credits */}
      <div className={`p-5 rounded-2xl flex justify-between items-center transition-all ${isPro ? 'bg-blue-600/5 border border-blue-500/20' : 'bg-white/5 border border-white/5'}`}>
        <div className="text-left">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1 italic">Scan Capability</p>
          <p className={`text-xl font-black ${isPro ? 'text-blue-400' : 'text-white'}`}>{isPro ? "UNLIMITED ENGINE" : `${attemptsLeft} SCANS LEFT`}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${isPro ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-600'}`}>
          <FaRocket />
        </div>
      </div>

      {/* Pricing Section (Shows only if not Pro) */}
      {!isPro && (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 text-left ml-1 italic">Select Plan</h3>
            <div className="grid grid-cols-3 gap-3">
                {PRICING_TIES.map((tier) => (
                    <div 
                        key={tier.id}
                        onClick={() => { setSelectedTier(tier); setHasClickedPay(false); }}
                        className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center ${selectedTier?.id === tier.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                    >
                        {tier.popular && <div className="absolute -top-2 bg-blue-500 text-[6px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Best Value</div>}
                        <span className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">{tier.name}</span>
                        <span className="text-xl font-black">${tier.price}</span>
                        {tier.save > 0 && <span className="text-[8px] font-black text-emerald-400 mt-1">Save ${tier.save}</span>}
                    </div>
                ))}
            </div>

            {/* Dynamic Two-Step Payment Button */}
            {selectedTier && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
                    {!hasClickedPay ? (
                        <button 
                            onClick={() => handlePaymentLaunch(selectedTier.link)}
                            className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all group"
                        >
                             <FaExternalLinkAlt className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> Step 1: Open Whish Link (${selectedTier.price})
                        </button>
                    ) : (
                        <button 
                            onClick={() => window.open(`https://wa.me/961XXXXXXX?text=Ace! I just paid $${selectedTier.price} for the ${selectedTier.name} plan. My email is: ${userEmail}. Check the screenshot below:`, '_blank')}
                            className="w-full py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-500 animate-pulse transition-all shadow-xl shadow-emerald-900/20"
                        >
                            <FaWhatsapp size={16}/> Step 2: Confirm on WhatsApp
                        </button>
                    )}
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest text-center">
                        {hasClickedPay ? "Activation: Send screenshot to Ace" : "Instant Secure Checkout via Whish"}
                    </p>
                </motion.div>
            )}
        </div>
      )}

      {/* System Actions */}
      <div className="space-y-3 mt-2">
        <div className="flex gap-3">
            <button disabled={loading} onClick={handleResetPassword} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition">
                <FaKey className="text-blue-500" /> Security Reset
            </button>
            <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-500 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                <FaSignOutAlt /> Sign Out
            </button>
        </div>
        
        {message && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center text-[9px] font-black uppercase tracking-widest ${message.startsWith("Error") ? "text-rose-400" : "text-emerald-400"}`}>
            {message}
          </motion.p>
        )}
      </div>

      {/* Footer Brand */}
      <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-20 text-center mt-2">
        Cedars Tech Cloud Security
      </p>
    </motion.div>
  );
}