import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaChartLine, FaShieldAlt, FaArrowRight } from "react-icons/fa";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden px-4">
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.12),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.12),rgba(255,255,255,0))] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}}>
          <span className="px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6 inline-block">
            Powering Lebanon's Growth
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Stop Searching.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Start Selling.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The most advanced lead engine for local businesses. Generate verified contacts in seconds and close deals over WhatsApp.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/leads/signup" className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-900/20">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition" />
          </Link>
          <Link to="/leads/login" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all">
            Login to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            {icon: <FaRocket className="text-purple-500"/>, title: "Real-time Scrape", desc: "Live data from local maps."},
            {icon: <FaChartLine className="text-green-500"/>, title: "Growth Ready", desc: "Export to CSV instantly."},
            {icon: <FaShieldAlt className="text-blue-500"/>, title: "Secure Data", desc: "Private lead management."}
          ].map((item, idx) => (
            <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-white/20 transition">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="text-white font-bold mb-1">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}