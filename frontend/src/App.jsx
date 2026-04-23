import React, { useState, createContext, useContext, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Send, Loader2, CheckCircle2, AlertCircle, Info, ExternalLink, Sparkles, ArrowLeft, Cpu, Database, Globe, Code2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Theme Context ──────────────────────────────────────────────
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("crag-theme") || "dark"; }
    catch { return "dark"; }
  });

  useEffect(() => {
    try { localStorage.setItem("crag-theme", theme); } catch {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

// ── Tokens ────────────────────────────────────────────────────
const tokens = {
  dark: {
    bg: "#05050a", bgCard: "#0a0a0f", bgStep: "#111118", bgInput: "#1a1530",
    bgNav: "#05050acc", border: "#ffffff15", borderAlpha: "22", borderLight: "#1f1a3a",
    text: "#f1f5f9", textMuted: "#6b7280", textDim: "#4b5563",
    accent: "#4169e1", accentGrad: "linear-gradient(90deg,#4169e1,#5a7ff0,#6b8ff5)",
    accentHover: "#5a7ff0", accentLight: "#4169e120",
    navBorder: "#ffffff0a", statVal: "#4169e1",
    btnSecBg: "transparent", btnSecColor: "#9ca3af", btnSecBorder: "#ffffff15",
    dot1: "#ff5f57", dot2: "#febc2e", dot3: "#28c840",
    termBar: "#1a1a24", termText: "#4b5563",
    cardWrap: "#111118", cardShadow: "0 40px 80px #000000cc,0 0 0 1px #ffffff08",
    toggleBg: "#1a1a24", toggleBorder: "#ffffff15", toggleIcon: "#4169e1",
    glow: "radial-gradient(ellipse,rgba(65,105,225,0.15) 0%,transparent 70%)",
    statusCorrect: "#10b981", statusIncorrect: "#ef4444", statusAmbiguous: "#f59e0b",
    badgeStyles: {
      CORRECT:   { bg: "#052e16", text: "#4ade80", border: "#166534" },
      AMBIGUOUS: { bg: "#451a03", text: "#fb923c", border: "#92400e" },
      INCORRECT: { bg: "#450a0a", text: "#f87171", border: "#991b1b" },
    },
  },
  light: {
    bg: "#fafaf7", bgCard: "#ffffff", bgStep: "#f4f4f0", bgInput: "#f5f2ed",
    bgNav: "#fafaf7ee", border: "#00000012", borderAlpha: "18", borderLight: "#e8e4dc",
    text: "#0f0f12", textMuted: "#6b7280", textDim: "#9ca3af",
    accent: "#3457d5", accentGrad: "linear-gradient(90deg,#3457d5,#4169e1,#5a7ff0)",
    accentHover: "#4169e1", accentLight: "#3457d515",
    navBorder: "#00000010", statVal: "#3457d5",
    btnSecBg: "transparent", btnSecColor: "#6b7280", btnSecBorder: "#00000018",
    dot1: "#ff5f57", dot2: "#febc2e", dot3: "#28c840",
    termBar: "#ebebeb", termText: "#9ca3af",
    cardWrap: "#e5e2da", cardShadow: "0 24px 60px #00000018,0 0 0 1px #00000010",
    toggleBg: "#f0ede6", toggleBorder: "#00000012", toggleIcon: "#3457d5",
    glow: "radial-gradient(ellipse,rgba(52,87,213,0.08) 0%,transparent 70%)",
    statusCorrect: "#059669", statusIncorrect: "#dc2626", statusAmbiguous: "#d97706",
    badgeStyles: {
      CORRECT:   { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
      AMBIGUOUS: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
      INCORRECT: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
    },
  },
};

const steps = [
  { id:"01", label:"Web Search",     desc:"Tavily fetches live URLs",        color:"#4169e1" },
  { id:"02", label:"Scrape & Chunk", desc:"spaCy sentence splitting",        color:"#10b981" },
  { id:"03", label:"Evaluate",       desc:"LLM scores each chunk",           color:"#6366f1" },
  { id:"04", label:"Action Trigger", desc:"CORRECT / AMBIGUOUS / INCORRECT", color:"#f43f5e" },
  { id:"05", label:"Refine",         desc:"Decompose → filter → recompose", color:"#4169e1" },
  { id:"06", label:"Generate",       desc:"LLaMA produces final answer",     color:"#10b981" },
];

// ── Array of Dynamic Greetings ────────────────────────────────
const greetings = [
  "Hey, what's on your mind?",
  "Hi! How can I assist you today?",
  "Hello! What would you like to explore?",
  "Ready to search? Ask me anything!"
];

const SunIcon = ({ color }) => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = ({ color }) => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = tokens[theme];
  return (
    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={toggleTheme}
      style={{ width:38, height:38, borderRadius:"10px", background:t.toggleBg,
        border:`1px solid ${t.toggleBorder}`, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"background 0.3s" }}>
      <AnimatePresence mode="wait">
        <motion.div key={theme}
          initial={{ rotate:-25, opacity:0 }} animate={{ rotate:0, opacity:1 }}
          exit={{ rotate:25, opacity:0 }} transition={{ duration:0.18 }}>
          {theme === "dark" ? <SunIcon color={t.toggleIcon}/> : <MoonIcon color={t.toggleIcon}/>}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

function PipelineCard() {
  const { theme } = useTheme();
  const t = tokens[theme];
  return (
    <div style={{ width:"100%", height:"100%", background:t.bgCard, borderRadius:"20px",
      padding:"1.5rem", fontFamily:"'DM Sans',monospace",
      display:"flex", flexDirection:"column", gap:"1rem", transition:"background 0.3s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"7px", background:t.termBar,
        borderRadius:"7px", padding:"7px 11px", transition:"background 0.3s" }}>
        {[t.dot1, t.dot2, t.dot3].map((c,i) => (
          <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:c }}/>
        ))}
        <span style={{ marginLeft:"0.65rem", fontSize:"10px", color:t.termText, letterSpacing:"0.1em" }}>
          crag_pipeline.py — running
        </span>
        <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%",
          background:"#10b981", boxShadow:"0 0 6px #10b981aa" }}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.6rem", flex:1 }}>
        {steps.map((step, i) => (
          <motion.div key={step.id}
            initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.07, duration:0.3 }}
            style={{ background:t.bgStep, border:`1px solid ${step.color}${t.borderAlpha}`,
              borderRadius:"9px", padding:"0.8rem", position:"relative",
              overflow:"hidden", transition:"background 0.3s" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0,
              height:"2px", background:step.color, opacity:0.85 }}/>
            <div style={{ fontSize:"9px", color:step.color, letterSpacing:"0.14em", marginBottom:"4px" }}>
              STEP {step.id}
            </div>
            <div style={{ fontSize:"11px", fontWeight:600, color:t.text, marginBottom:"3px" }}>{step.label}</div>
            <div style={{ fontSize:"10px", color:t.textMuted, lineHeight:1.4 }}>{step.desc}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ display:"flex", gap:"0.6rem", justifyContent:"center", flexWrap:"wrap" }}>
        {["CORRECT","AMBIGUOUS","INCORRECT"].map(b => {
          const bs = t.badgeStyles[b];
          return (
            <div key={b} style={{ padding:"4px 13px", borderRadius:"999px",
              fontSize:"9px", fontWeight:700, letterSpacing:"0.1em",
              background:bs.bg, color:bs.text, border:`1px solid ${bs.border}`,
              transition:"all 0.3s" }}>{b}</div>
          );
        })}
      </div>
    </div>
  );
}

function ScrollCard({ rotate, scale, children }) {
  const { theme } = useTheme();
  const t = tokens[theme];
  return (
    <motion.div style={{ rotateX:rotate, scale,
      maxWidth:"900px", margin:"-2rem auto 0", height:"400px",
      border:`1px solid ${t.border}`, padding:"5px",
      background:t.cardWrap, borderRadius:"22px",
      boxShadow:t.cardShadow, transition:"background 0.3s,box-shadow 0.3s" }}>
      <div style={{ height:"100%", borderRadius:"17px", overflow:"hidden" }}>
        {children}
      </div>
    </motion.div>
  );
}

// ── Hero Page ─────────────────────────────────────────────────
function HeroPage({ onEnter }) {
  const { theme } = useTheme();
  const t = tokens[theme];
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const rotate      = useTransform(scrollYProgress, [0,1], [18, 0]);
  const scale       = useTransform(scrollYProgress, [0,1], isMobile ? [0.75,0.95] : [1.04,1]);
  const translateY  = useTransform(scrollYProgress, [0,1], [0, -55]);
  const headOpacity = useTransform(scrollYProgress, [0,0.5], [1, 0.5]);

  return (
    <div style={{ minHeight:"100vh", background:t.bg,
      fontFamily:"'DM Sans','Inter',system-ui,sans-serif", color:t.text,
      overflowX:"hidden", transition:"background 0.35s,color 0.35s" }}>
      <div style={{ position:"fixed", top:"15%", left:"50%", transform:"translateX(-50%)",
        width:"700px", height:"340px", background:t.glow,
        pointerEvents:"none", zIndex:0, transition:"background 0.35s" }}/>
      
      {/* Enhanced Navbar */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"1rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:`1px solid ${t.navBorder}`, background:t.bgNav,
        backdropFilter:"blur(14px)", transition:"background 0.35s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:28, height:28, borderRadius:"6px",
            background:"linear-gradient(135deg,#4169e1,#3457d5)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"13px", fontWeight:800, color:"#fff" }}>C</div>
          <span style={{ fontSize:"14px", fontWeight:600, letterSpacing:"0.05em" }}>CRAG</span>
          <span style={{ fontSize:"9px", padding:"2px 7px", borderRadius:"999px",
            background:`${t.accent}18`, color:t.accent,
            border:`1px solid ${t.accent}33`, letterSpacing:"0.1em" }}>BETA</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"1.75rem" }}>
          <a href="https://arxiv.org/abs/2401.15884" target="_blank" rel="noreferrer"
            style={{ fontSize:"13px", color:t.textMuted, cursor:"pointer", textDecoration:"none",
              letterSpacing:"0.05em", transition:"color 0.2s", fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = t.text}
            onMouseLeave={e => e.target.style.color = t.textMuted}>
            Research Paper
          </a>
          <a href="https://github.com/rakshit-133/crag-chatbot" target="_blank" rel="noreferrer"
            style={{ fontSize:"13px", color:t.textMuted, cursor:"pointer", textDecoration:"none",
              letterSpacing:"0.05em", transition:"color 0.2s", fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = t.text}
            onMouseLeave={e => e.target.style.color = t.textMuted}>
            GitHub Repo
          </a>
          <ThemeToggle />
        </div>
      </nav>

      <div ref={containerRef} style={{ display:"flex", flexDirection: "column",
        alignItems:"center", justifyContent:"flex-start", paddingTop:"120px", paddingBottom: "100px" }}>
        
        {/* Scroll Animation Section */}
        <div style={{ width:"100%", height: "140vh",
          maxWidth:"960px", padding:"0 1.5rem", perspective:"1200px" }}>
          <motion.div style={{ translateY, opacity:headOpacity, textAlign:"center", marginBottom:"2.5rem" }}>
            <motion.div initial={{ opacity:0, y:26 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.6, ease:"easeOut" }}>
              <div style={{ fontSize:"10px", letterSpacing:"0.3em", color:t.accent,
                marginBottom:"1.2rem", textTransform:"uppercase", fontWeight: 600 }}>
                Corrective Retrieval Augmented Generation
              </div>
              <h1 style={{ fontSize:"clamp(2.4rem,6vw,4.6rem)", fontWeight:800,
                lineHeight:1.06, letterSpacing:"-0.02em", marginBottom:"1.2rem", margin:"0 0 1.2rem" }}>
                <span style={{ color:t.text }}>Search smarter.</span><br/>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Answer better.
                </span>
              </h1>
              <p style={{ fontSize:"clamp(13px,2vw,15px)", color:t.textMuted,
                maxWidth:"490px", margin:"0 auto 2rem", lineHeight:1.75, letterSpacing:"0.02em" }}>
                A self-correcting RAG pipeline that evaluates retrieval quality,
                triggers intelligent actions, and refines knowledge before generating answers.
              </p>
              <div style={{ display:"flex", gap:"0.8rem", justifyContent:"center", flexWrap:"wrap" }}>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={onEnter}
                  style={{ padding:"11px 24px", background:t.accent, color:"#fff",
                    border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:700,
                    cursor:"pointer", letterSpacing:"0.05em", fontFamily:"inherit" }}>
                  Try it now →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
          
          <ScrollCard rotate={rotate} scale={scale}>
            <PipelineCard />
          </ScrollCard>
        </div>

        {/* Tech Stack Explanation Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: "1000px", width: "100%", padding: "0 2rem", marginTop: "-10vh" }}
        >
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>Powered by Next-Gen AI</h2>
            <p style={{ color: t.textMuted, maxWidth: "600px", margin: "0 auto" }}>
              This architecture replaces static databases with real-time web intelligence and lightning-fast inference models.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: Cpu, title: "Groq LPU Engine", desc: "Utilizing the Groq API for ultra-low latency inference, enabling real-time document evaluation and query rewriting." },
              { icon: Globe, title: "LLaMA 3.1 8B", desc: "Serves as the core cognitive engine, performing zero-shot evaluation, semantic routing, and context-constrained generation." },
              { icon: Database, title: "Tavily Search API", desc: "Bypasses standard Google search limitations by deploying an LLM-optimized search engine to fetch high-quality, relevant URLs." },
              { icon: Code2, title: "spaCy & FAISS", desc: "Leverages spaCy for precise sentence-level decomposition and FAISS for rapid in-memory vector similarity searching." }
            ].map((stack, i) => (
              <div key={i} style={{ 
                background: t.bgCard, border: `1px solid ${t.borderLight}`, 
                borderRadius: "16px", padding: "1.5rem",
                display: "flex", flexDirection: "column", gap: "1rem",
                transition: "transform 0.2s"
              }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stack.icon size={20} color={t.accent} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{stack.title}</h3>
                <p style={{ fontSize: "0.9rem", color: t.textMuted, lineHeight: 1.6 }}>{stack.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Search Utils ──────────────────────────────────────────────
function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);
  const adjustHeight = useCallback((reset) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (reset) {
      textarea.style.height = `${minHeight}px`;
      return;
    }
    textarea.style.height = `${minHeight}px`;
    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? 9999));
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);
  return { textareaRef, adjustHeight };
}

function TypingDots({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          style={{ width: 6, height: 6, borderRadius: "50%", background: color }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ── Search Page ───────────────────────────────────────────────
function SearchPage({ onBack }) {
  const { theme } = useTheme();
  const t = tokens[theme];
  
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState(null);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [currentGreeting, setCurrentGreeting] = useState("");
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 56, maxHeight: 160 });

  // Pick a random greeting when the page loads
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * greetings.length);
    setCurrentGreeting(greetings[randomIdx]);
  }, []);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setAction(null);
    setAnswer("");
    setSources([]);

    try {
      // Dynamically select the API URL based on the environment
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const apiUrl = `${baseUrl}/api/chat`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") {
              setIsLoading(false);
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.action) setAction(parsed.action);
              if (parsed.sources) setSources(parsed.sources);
              if (parsed.answer) setAnswer(prev => prev + parsed.answer);
              if (parsed.type === "error") {
                setAction("INCORRECT");
                setAnswer(`**Error:** ${parsed.message}`);
              }
            } catch (e) {
              // Ignore incomplete JSON chunks during parsing
            }
          }
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setAction("INCORRECT");
      setAnswer("**Connection Failed:** Cannot reach the FastAPI server. Please ensure it is running on port 8000.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const actionConfig = {
    CORRECT:   { icon: CheckCircle2, color: t.statusCorrect,   label: "High relevance - using extracted knowledge" },
    INCORRECT: { icon: AlertCircle,  color: t.statusIncorrect, label: "Low relevance - rewrote query & executed new search" },
    AMBIGUOUS: { icon: Info,         color: t.statusAmbiguous, label: "Mixed relevance - combined internal and external sources" },
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg,
      fontFamily: "'Inter', system-ui, sans-serif", // Clean font stack for reading
      color: t.text, transition: "background 0.35s, color 0.35s",
      position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "400px", background: t.glow,
        pointerEvents: "none", zIndex: 0, transition: "background 0.35s" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "820px", margin: "0 auto", padding: "0 1.5rem" }}>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
          <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={onBack}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent",
              border: `1px solid ${t.borderLight}`, borderRadius: "10px", padding: "8px 16px",
              fontSize: "13px", color: t.textMuted, cursor: "pointer", fontFamily: "inherit",
              marginBottom: "2rem", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.borderLight; e.currentTarget.style.color = t.textMuted; }}>
            <ArrowLeft size={16} /><span>Back to Dashboard</span>
          </motion.button>
          <div style={{ textAlign: "center" }}>
            {/* Dynamic Greeting Title */}
            <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight mb-3 bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
              {currentGreeting}
            </h1>
            <p style={{ fontSize: "15px", color: t.textMuted, letterSpacing: "0.02em" }}>
              Powered by your Corrective Retrieval Augmented Generation Pipeline
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ background: t.bgCard, border: `1px solid ${t.borderLight}`, borderRadius: "16px", padding: "1rem",
            boxShadow: theme === "dark" ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.06)", transition: "all 0.35s" }}>
          <textarea ref={textareaRef} value={query} onChange={(e) => { setQuery(e.target.value); adjustHeight(); }}
            onKeyDown={handleKeyDown} placeholder="Ask me anything..."
            style={{ width: "100%", background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "12px",
              padding: "1rem", fontSize: "16px", color: t.text, resize: "none", outline: "none", fontFamily: "inherit",
              transition: "all 0.2s", lineHeight: 1.6 }}
            onFocus={(e) => e.target.style.borderColor = t.accent} onBlur={(e) => e.target.style.borderColor = t.border} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={!query.trim() || isLoading}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px",
                background: query.trim() && !isLoading ? t.accent : t.borderLight,
                color: query.trim() && !isLoading ? "#ffffff" : t.textDim, border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600, cursor: query.trim() && !isLoading ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "all 0.2s" }}>
              {isLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={18} />}
              <span>{isLoading ? "Analyzing..." : "Search"}</span>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {action && actionConfig[action] && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ marginTop: "1.5rem", padding: "1rem", background: t.bgCard, border: `1px solid ${t.borderLight}`,
                borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.35s" }}>
              {React.createElement(actionConfig[action].icon, { size: 22, style: { color: actionConfig[action].color, flexShrink: 0 } })}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: t.text }}>Action Triggered: {action}</div>
                <div style={{ fontSize: "13px", color: t.textMuted, marginTop: "2px" }}>{actionConfig[action].label}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {answer && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ marginTop: "2rem" }}>
              <div style={{ background: t.bgCard, border: `1px solid ${t.borderLight}`, borderRadius: "16px", padding: "2rem", transition: "all 0.35s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1px solid ${t.borderLight}` }}>
                  <Sparkles size={20} style={{ color: t.accent }} />
                  <span style={{ fontSize: "16px", fontWeight: 600, color: t.text }}>Generated Answer</span>
                </div>
                
                {/* Markdown Renderer with Custom Typography Styles */}
                <div style={{ fontSize: "16px", color: t.text }} className="markdown-body">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold mt-6 mb-4 leading-tight text-blue-500" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 leading-snug" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-5 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-[15px] opacity-90" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="text-[15px] opacity-90" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-blue-400 dark:text-blue-300" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic opacity-80 my-4" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline 
                          ? <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-500" {...props} />
                          : <pre className="bg-zinc-200 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono"><code {...props} /></pre>
                    }}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sources.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ marginTop: "2rem", marginBottom: "4rem" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: t.textMuted, marginBottom: "1rem" }}>Knowledge Sources Used</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {sources.map((src, i) => (
                  <motion.a key={i} href={src.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ x: 4 }}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "1rem 1.25rem", background: t.bgCard, border: `1px solid ${t.borderLight}`, borderRadius: "12px", fontSize: "14px", color: t.text, textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.background = t.accentLight; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.borderLight; e.currentTarget.style.background = t.bgCard; }}>
                    <ExternalLink size={16} style={{ color: t.accent, flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{src.title}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLoading && !action && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ marginTop: "2rem", padding: "1.5rem", background: t.bgCard, border: `1px solid ${t.borderLight}`, borderRadius: "12px", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.35s" }}>
              <TypingDots color={t.accent} />
              <span style={{ fontSize: "15px", color: t.textMuted, fontWeight: 500 }}>Running retrieval, evaluation, and LLaMA 3.1 generation...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main App Root ─────────────────────────────────────────────
export default function App() {
  const [currentPage, setCurrentPage] = useState("hero");

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {currentPage === "hero" && (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <HeroPage onEnter={() => setCurrentPage("search")} />
          </motion.div>
        )}
        {currentPage === "search" && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <SearchPage onBack={() => setCurrentPage("hero")} />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}