import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, FaWhatsapp, FaSearch, FaMagic, FaSun, FaMoon, FaTrashAlt,
  FaMapMarkedAlt, FaRocket, FaBolt, FaCheckSquare, FaSquare, 
  FaLayerGroup, FaCommentDots, FaCheckCircle, FaCrown, FaDatabase, FaTerminal, FaCode
} from "react-icons/fa";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { 
  doc, onSnapshot, updateDoc, increment, deleteDoc,
  collection, query, orderBy, serverTimestamp, writeBatch 
} from "firebase/firestore";
import Profile from "./Profile";

const CATEGORIES = ["Medical & Clinics", "Law & Consulting", "Real Estate & Construction", "Finance & Accounting", "Education & Training", "Marketing & Media", "Beauty & Wellness", "IT & Software", "Logistics & Transport", "Hospitality & Food", "Retail & Showrooms", "Automotive"];

const STATUS_COLORS = {
  "New": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Contacted": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Interested": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Closed": "text-rose-400 bg-rose-400/10 border-rose-400/20"
};

export default function Home() {
  const [view, setView] = useState("scan"); 
  const [darkMode, setDarkMode] = useState(true);
  const [category, setCategory] = useState("Medical & Clinics");
  const [city, setCity] = useState("");
  const [globalMessage, setGlobalMessage] = useState("Hello, this is Adam from Cedars Tech. I came across your business on Google Maps and wanted to ask: do you currently have a website for your business?");
  const [leads, setLeads] = useState([]);
  const [historyLeads, setHistoryLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(0);
  const [plan, setPlan] = useState("free");
  const [selectedLeads, setSelectedLeads] = useState([]);

  // FOUNDER BYPASS - Change this to your actual email for unlimited credits
  const isFounder = userEmail === "abdallahadam130@gmail.com"; 

  const currentLeads = view === "scan" ? leads : historyLeads;
  
  const filteredLeads = useMemo(() => {
    return currentLeads
      .filter(l => (l.Name || "").toLowerCase().includes(searchTerm.toLowerCase()))
      .map((l, index) => ({
        ...l,
        displayId: view === "scan" ? index : l.id,
        isHighPriority: !l.Website || l.Website.toLowerCase().includes("none") || l.Website.length < 5,
      }));
  }, [currentLeads, searchTerm, view]);

  const stats = useMemo(() => ({
    total: historyLeads.length,
    contacted: historyLeads.filter(l => l.status === "Contacted").length,
    gold: historyLeads.filter(l => !l.Website || l.Website.length < 5).length,
    remaining: (plan === "pro" || isFounder) ? "∞" : attemptsLeft
  }), [historyLeads, plan, attemptsLeft, isFounder]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    setUserEmail(auth.currentUser.email);
    
    // Listening to User Data for Credits
    const unsubUser = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) { 
        setAttemptsLeft(snap.data().attemptsLeft ?? 0); 
        setPlan(snap.data().plan ?? "free"); 
      }
    });

    const q = query(collection(db, "users", uid, "history"), orderBy("timestamp", "desc"));
    const unsubHistory = onSnapshot(q, (snap) => setHistoryLeads(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    setSelectedLeads([]);
    return () => { unsubUser(); unsubHistory(); };
  }, [view]);

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) setSelectedLeads([]);
    else setSelectedLeads(filteredLeads.map(l => l.displayId));
  };

  const toggleSelection = (id) => setSelectedLeads(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleBulkAction = async (type = "selected") => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const batch = writeBatch(db);
    if (view === "scan") {
      let leadsToProcess = selectedLeads.map(index => leads[index]);
      leadsToProcess.forEach(lead => {
        const ref = doc(collection(db, "users", uid, "history"));
        batch.set(ref, { ...lead, status: "New", timestamp: serverTimestamp() });
      });
    } else {
      if (!window.confirm(`Wipe ${selectedLeads.length} leads?`)) return;
      selectedLeads.forEach(id => batch.delete(doc(db, "users", uid, "history", id)));
    }
    await batch.commit();
    setSelectedLeads([]);
  };

  const deleteSingle = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "history", id));
  };

  const openWhatsApp = async (lead) => {
    window.open(`https://wa.me/${lead.Phone.replace(/\D/g, '')}?text=${encodeURIComponent(globalMessage)}`, '_blank');
    if (view === "history" && lead.id) await updateDoc(doc(db, "users", auth.currentUser.uid, "history", lead.id), { status: "Contacted" });
  };

  const generateLeads = async (e) => {
    e.preventDefault();
    const hasAccess = plan === "pro" || attemptsLeft > 0 || isFounder;
    if (loading || !city.trim() || !hasAccess) {
        if(!hasAccess) setShowUpgradeModal(true);
        return;
    }
    setView("scan"); setLeads([]); setLoading(true); setProgress(0);
    try {
      const res = await fetch("/api/generate-stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ category, city })
});

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (let line of lines) {
          if (!line.trim()) continue;
          const parsed = JSON.parse(line);
          if (parsed.type === "lead") setLeads(p => [...p, { ...parsed.data, status: "New" }]);
          if (parsed.type === "progress") setProgress(parsed.data);
        }
      }
      // Subtract credit if not Pro/Founder
      if (plan !== "pro" && !isFounder) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { attemptsLeft: increment(-1) });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className={`relative min-h-screen w-full pb-20 transition-all duration-500 overflow-hidden ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {darkMode && (
        <>
          <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))] pointer-events-none"></div>
          <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))] pointer-events-none"></div>
        </>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence>
          {showProfile && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl">
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowProfile(false)} className="absolute inset-0 bg-black/60" />
              <Profile 
                userEmail={userEmail} 
                attemptsLeft={attemptsLeft} 
                plan={plan}
                onLogout={() => signOut(auth)} 
                onClose={()=>setShowProfile(false)} 
                onUpgrade={() => { setShowProfile(false); setShowUpgradeModal(true); }}
              />
            </div>
          )}

          {showUpgradeModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-2xl">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center overflow-hidden"
                >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-amber-400 to-cyan-500" />
                <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">✕</button>
                <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30"><FaCrown className="text-white text-3xl" /></div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-white">Unlock Pro Engine</h2>
                <p className="text-slate-400 text-xs mb-8 px-4">Unlimited leads, Gold Mine filters, and direct founder support.</p>
                <div className="space-y-4 mb-8 text-left">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:border-amber-500/50 transition-all cursor-pointer" onClick={() => window.open('https://whish.money/pay/YOUR_LINK', '_blank')}>
                    <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black uppercase text-amber-500">Whish Checkout</span><span className="text-white font-black">$15.00</span></div>
                    <p className="text-[11px] text-slate-400 mb-3">Instant activation via Whish Link.</p>
                    <div className="w-full py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl text-center">Open Whish Link</div>
                  </div>
                </div>
                <button onClick={() => window.open(`https://wa.me/961XXXXXXX?text=I paid for Pro! My email: ${userEmail}`, '_blank')} className="w-full py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                  <FaWhatsapp size={16}/> Confirm on WhatsApp
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]"><FaTerminal className="text-white" size={20}/></div>
            <div className="text-left">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">Cedars Leads <span className="text-blue-500">Gen</span></h1>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Founder: Adam Abdallah</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
             <button onClick={()=>setView(view === "scan" ? "history" : "scan")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'history' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`}>
               {view === "scan" ? <><FaDatabase/> Database</> : <><FaRocket/> Engine</>}
             </button>
             <button onClick={()=>setDarkMode(!darkMode)} className="p-3 hover:bg-white/10 rounded-xl transition-colors">{darkMode ? <FaSun className="text-amber-400"/> : <FaMoon className="text-indigo-600"/>}</button>
             <button onClick={()=>setShowProfile(true)} className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><FaUser size={14}/></button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left">
            {[
                { label: "Stored Leads", val: stats.total, icon: <FaLayerGroup/>, color: "text-blue-500" },
                { label: "Contacted", val: stats.contacted, icon: <FaCheckCircle/>, color: "text-emerald-500" },
                { label: "Gold Mine", val: stats.gold, icon: <FaCrown/>, color: "text-amber-500" },
                { label: "Remaining", val: stats.remaining, icon: <FaBolt/>, color: "text-purple-500" }
            ].map((s, i) => (
                <div key={i} className={`p-4 rounded-3xl border transition-all ${darkMode ? 'bg-white/[0.03] border-white/10 backdrop-blur-sm' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className={`${s.color} mb-3 opacity-80`}>{s.icon}</div>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">{s.label}</p>
                    <p className="text-xl font-black italic">{s.val}</p>
                </div>
            ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6">
            <div className={`border rounded-[2rem] p-6 backdrop-blur-md ${darkMode ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/5'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-40 text-left">Targeting</h3>
              <form onSubmit={generateLeads} className="space-y-4">
                <select value={category} onChange={e=>setCategory(e.target.value)} className={`w-full rounded-2xl px-5 py-4 text-xs font-bold outline-none border transition ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-slate-50'}`}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City (Beirut, Tripoli...)" className={`w-full rounded-2xl px-5 py-4 text-xs font-bold outline-none border transition ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-slate-50'}`} />
                <button disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all">
                    {loading ? `Scanning...` : (plan === "pro" || isFounder) ? "Deploy Engine (Pro)" : "Deploy Engine"}
                </button>
              </form>
            </div>

            <div className={`border rounded-[2rem] p-6 backdrop-blur-md ${darkMode ? 'bg-white/[0.02] border-white/10' : 'bg-white shadow-xl'}`}>
               <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 opacity-40 text-left"><FaCommentDots className="text-blue-500"/> WhatsApp Hook</h2>
               <textarea value={globalMessage} onChange={(e)=>setGlobalMessage(e.target.value)} className={`w-full h-32 rounded-2xl px-5 py-4 text-[11px] font-medium outline-none border transition resize-none ${darkMode ? 'bg-black border-white/10 text-slate-300' : 'bg-slate-50'}`} />
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search leads..." className={`w-full border rounded-2xl pl-14 pr-6 py-4 text-xs font-bold outline-none transition backdrop-blur-sm ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5'}`} />
                </div>
                {selectedLeads.length > 0 && (
                    <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={() => handleBulkAction("selected")} className={`w-full sm:w-auto px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${view === 'scan' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white ring-4 ring-rose-600/20'}`}>
                        {view === 'scan' ? `Save ${selectedLeads.length}` : `Wipe ${selectedLeads.length} Leads`}
                    </motion.button>
                )}
            </div>

            <div className="flex items-center justify-between px-6 py-2">
                <button onClick={toggleSelectAll} className="flex items-center gap-3 group">
                    <div className={`transition-all ${selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? 'text-blue-500' : 'text-slate-500'}`}>
                        {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? <FaCheckSquare size={18}/> : <FaSquare size={18}/>}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                        {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? "Deselect All" : "Select All Visible"}
                    </span>
                </button>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{filteredLeads.length} items</p>
            </div>

            <div className="space-y-4">
              {filteredLeads.map((lead) => {
                const isSelected = selectedLeads.includes(lead.displayId);
                return (
                  <motion.div key={lead.displayId} layout className={`group border rounded-3xl p-6 transition-all duration-300 backdrop-blur-sm ${darkMode ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]' : 'bg-white shadow-sm'} ${isSelected ? 'ring-2 ring-blue-500 border-transparent bg-blue-500/5' : ''}`}>
                    <div className="flex gap-6">
                      <button onClick={() => toggleSelection(lead.displayId)} className={`mt-1 transition-all ${isSelected ? 'text-blue-500 scale-110' : 'text-slate-700 hover:text-blue-400'}`}>
                        {isSelected ? <FaCheckSquare size={22}/> : <FaSquare size={22}/>}
                      </button>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-[8px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">{lead.Category}</span>
                          {lead.isHighPriority && <span className="text-[8px] font-black uppercase bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1"><FaCrown size={8}/> Gold Mine</span>}
                          <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${STATUS_COLORS[lead.status] || 'bg-slate-500/10'}`}>{lead.status}</span>
                        </div>
                        <h3 className="text-lg font-black italic tracking-tighter uppercase mb-1 truncate">{lead.Name}</h3>
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2 mb-4"><FaMapMarkedAlt className="text-blue-500"/> {lead.Address}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => openWhatsApp(lead)} className="px-5 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"><FaMagic/> WhatsApp</button>
                          {view === "history" && (
                            <button onClick={() => deleteSingle(lead.id)} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all ml-auto opacity-0 group-hover:opacity-100"><FaTrashAlt size={14}/></button>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col items-end justify-between text-right">
                        <p className="text-base font-black font-mono tracking-tighter text-blue-500">{lead.Phone}</p>
                        <div className={`w-12 h-12 border rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white shadow-blue-500/30 shadow-lg' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'}`}><FaWhatsapp size={24}/></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 w-full z-[50] py-4 px-6 border-t border-white/10 backdrop-blur-md bg-black/20 text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                <FaCode className="text-blue-500"/> Developed by <span className="text-white">Adam Abdallah</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500/80">
                Cedars Tech <span className="opacity-40 text-slate-500">© 2026 Beirut, Lebanon</span>
            </div>
        </div>
      </footer>
    </div>
  );
}