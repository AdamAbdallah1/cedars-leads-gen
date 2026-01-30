import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaChartLine, FaShieldAlt, FaArrowRight } from "react-icons/fa";
import LiquidEther from '../components/LiquidEther';

export default function Landing() {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-blue-500/30">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 h-screen w-screen pointer-events-none">
        <LiquidEther
          colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
          mouseForce={8}
          cursorSize={100}
          isViscous={true}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          color0="#5227FF"
          color1="#FF9FFC"
          color2="#B19EEF"
        />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"></div>
      </div>

      {/* --- PINK GLOW ACCENTS --- */}
      <div className="fixed bottom-0 left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,0.1),rgba(255,255,255,0))] pointer-events-none z-[1]"></div>
      <div className="fixed bottom-0 right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,0.1),rgba(255,255,255,0))] pointer-events-none z-[1]"></div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 w-full px-6 flex flex-col items-center justify-start pt-24 md:pt-32 pb-20">
        
        {/* HERO SECTION */}
        <div className="max-w-4xl w-full text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 inline-block backdrop-blur-md">
              Powering Lebanon's Growth
            </span>
            
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
              Stop Searching.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Start Selling.
              </span>
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              The most advanced lead engine for local businesses. Generate verified contacts in seconds and close deals over WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/leads/signup" className="group px-10 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition" />
              </Link>
              <Link to="/leads/login" className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest transition-all backdrop-blur-xl">
                Login
              </Link>
            </div>
          </motion.div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[
            {icon: <FaRocket className="text-purple-400"/>, title: "Real-time Scrape", desc: "Live data from local maps."},
            {icon: <FaChartLine className="text-emerald-400"/>, title: "Growth Ready", desc: "Export to CSV instantly."},
            {icon: <FaShieldAlt className="text-blue-400"/>, title: "Secure Data", desc: "Private lead management."}
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              whileHover={{ y: -8, backgroundColor: "rgba(255,255,255,0.05)" }}
              className="p-8 bg-white/[0.02] border border-white/[0.08] rounded-[2rem] text-left backdrop-blur-2xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center text-xl mb-6 border border-white/5">
                {item.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}