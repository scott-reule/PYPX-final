import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  abyss:    "#060e1a",
  deep:     "#0a1930",
  navy:     "#0d2240",
  steel:    "#1a3550",
  steelLt:  "#1e4060",
  teal:     "#5ac4e0",
  tealDim:  "#3a8aaa",
  seafoam:  "#7fcdee",
  aqua:     "#a8dff0",
  coral:    "#ff8c50",
  coralDim: "#cc6030",
  amber:    "#d4a843",
  pale:     "#d4e5f7",
  muted:    "#6a8faa",
  dim:      "#3a5a7a",
  geo:      "Georgia, 'Times New Roman', serif",
  num:      "'Times New Roman', Times, serif",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --abyss: ${T.abyss};
    --teal: ${T.teal};
    --coral: ${T.coral};
    --pale: ${T.pale};
  }

  body { background: ${T.abyss}; color: ${T.pale}; font-family: ${T.geo}; overflow-x: hidden; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.abyss}; }
  ::-webkit-scrollbar-thumb { background: ${T.steel}; border-radius: 3px; }

  @keyframes bubbleRise {
    0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
    25%  { transform: translateY(-25vh) translateX(8px) scale(1.05); opacity: 0.5; }
    50%  { transform: translateY(-50vh) translateX(-5px) scale(0.95); opacity: 0.4; }
    75%  { transform: translateY(-75vh) translateX(6px) scale(1.02); opacity: 0.25; }
    100% { transform: translateY(-100vh) translateX(0) scale(0.8); opacity: 0; }
  }

  @keyframes causticShimmer {
    0%,100% { opacity: 0.04; transform: scale(1) rotate(0deg); }
    33%      { opacity: 0.07; transform: scale(1.05) rotate(1deg); }
    66%      { opacity: 0.05; transform: scale(0.97) rotate(-0.5deg); }
  }

  @keyframes caustic2 {
    0%,100% { opacity: 0.03; transform: scale(1.02) rotate(0deg); }
    50%      { opacity: 0.06; transform: scale(0.98) rotate(-1deg); }
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 12px rgba(90,196,224,0.2); }
    50%      { box-shadow: 0 0 28px rgba(90,196,224,0.5); }
  }

  @keyframes shimmerBadge {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes navUnderline {
    from { width: 0; }
    to   { width: 100%; }
  }

  @keyframes waveFloat {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }

  @keyframes counterUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .page-enter {
    animation: fadeSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }

  .bubble {
    position: fixed;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(90,196,224,0.35), rgba(90,196,224,0.05));
    border: 1px solid rgba(90,196,224,0.2);
    pointer-events: none;
    animation: bubbleRise linear infinite;
    z-index: 0;
  }

  .glass-panel {
    background: linear-gradient(135deg, rgba(26,53,80,0.7) 0%, rgba(10,25,48,0.85) 100%);
    border: 1px solid rgba(90,196,224,0.18);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(90,196,224,0.12);
  }

  .rivet-panel {
    background: linear-gradient(180deg, #0f2035 0%, #0a1828 100%);
    border: 2px solid ${T.steel};
    border-radius: 10px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(90,196,224,0.08);
    position: relative;
  }
  .rivet-panel::before, .rivet-panel::after {
    content: '';
    position: absolute;
    width: 8px; height: 8px;
    background: radial-gradient(circle, #2a5a7a, #0d2030);
    border: 1px solid ${T.tealDim};
    border-radius: 50%;
    top: 10px;
  }
  .rivet-panel::before { left: 10px; }
  .rivet-panel::after  { right: 10px; }

  .btn-primary {
    background: linear-gradient(180deg, #1a6a8a 0%, #0d3a54 100%);
    border: 1.5px solid ${T.teal};
    border-radius: 8px;
    color: #fff;
    font-family: ${T.geo};
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 10px 22px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 3px 14px rgba(90,196,224,0.2);
  }
  .btn-primary:hover {
    background: linear-gradient(180deg, #2280a8 0%, #104870 100%);
    box-shadow: 0 4px 20px rgba(90,196,224,0.4);
    transform: translateY(-1px);
  }

  .btn-coral {
    background: linear-gradient(180deg, #cc5020 0%, #882010 100%);
    border: 1.5px solid ${T.coral};
    border-radius: 8px;
    color: #fff;
    font-family: ${T.geo};
    font-size: 13px;
    font-weight: 600;
    padding: 10px 22px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 3px 14px rgba(255,140,80,0.2);
  }
  .btn-coral:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 22px rgba(255,140,80,0.45);
  }

  .stat-card {
    background: linear-gradient(160deg, rgba(26,53,80,0.8), rgba(10,25,48,0.9));
    border: 1px solid rgba(90,196,224,0.2);
    border-radius: 10px;
    padding: 18px 20px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(90,196,224,0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.45), 0 0 16px rgba(90,196,224,0.12);
  }

  .nav-link {
    font-family: ${T.geo};
    font-size: 13px;
    color: ${T.muted};
    cursor: pointer;
    padding: 6px 4px;
    position: relative;
    transition: color 0.2s;
    border: none;
    background: none;
    letter-spacing: 0.3px;
  }
  .nav-link:hover { color: ${T.seafoam}; }
  .nav-link.active { color: ${T.teal}; }
  .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 100%; height: 2px;
    background: ${T.teal};
    border-radius: 1px;
    box-shadow: 0 0 6px ${T.teal};
  }

  .badge-card {
    background: linear-gradient(160deg, #0f2840 0%, #08172a 100%);
    border: 1.5px solid ${T.steel};
    border-radius: 14px;
    padding: 24px 20px;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 6px 24px rgba(0,0,0,0.4);
  }
  .badge-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, ${T.teal}, transparent);
  }
  .badge-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 14px 38px rgba(0,0,0,0.5), 0 0 20px rgba(90,196,224,0.12);
    border-color: ${T.tealDim};
  }

  .avatar-ring {
    width: 80px; height: 80px;
    border-radius: 50%;
    border: 2.5px solid ${T.tealDim};
    background: linear-gradient(135deg, #1a3550, #0d2030);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
    font-size: 26px;
    box-shadow: 0 0 0 4px rgba(90,196,224,0.08), 0 4px 16px rgba(0,0,0,0.4);
    position: relative;
  }
  .avatar-ring::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 1px solid rgba(90,196,224,0.12);
  }

  .dossier-card {
    background: linear-gradient(160deg, rgba(20,45,70,0.75), rgba(8,20,38,0.9));
    border: 1px solid rgba(90,196,224,0.15);
    border-radius: 10px;
    padding: 22px;
    position: relative;
    box-shadow: 0 5px 22px rgba(0,0,0,0.4);
    transition: transform 0.2s, border-color 0.2s;
    overflow: hidden;
  }
  .dossier-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--card-accent, ${T.teal}), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .dossier-card:hover { transform: translateY(-3px); border-color: rgba(90,196,224,0.3); }
  .dossier-card:hover::after { opacity: 1; }

  .section-divider {
    width: 100%; height: 60px;
    background: linear-gradient(180deg, transparent, rgba(90,196,224,0.04), transparent);
    position: relative;
    overflow: hidden;
  }

  .loi-card {
    background: linear-gradient(160deg, rgba(18,40,62,0.8), rgba(8,18,34,0.9));
    border: 1px solid rgba(90,196,224,0.18);
    border-radius: 12px;
    padding: 24px;
    position: relative;
    overflow: hidden;
    transition: all 0.25s ease;
    box-shadow: 0 6px 24px rgba(0,0,0,0.35);
  }
  .loi-card:hover {
    border-color: rgba(90,196,224,0.4);
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.45);
  }
  .loi-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: linear-gradient(180deg, ${T.teal}, ${T.coral});
  }

  #hamburger { display: none; }

  @media (max-width: 640px) {
    #hamburger { display: flex !important; align-items: center; }
    .desktop-nav { display: none !important; }
  }

  .loi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .reduced-motion *, .reduced-motion *::before, .reduced-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
// SST anomaly vs 1961–1990 baseline — HadSST4 (observed) + IPCC AR6 SSP2-4.5 (projected *)
const tempData = [
  {y:"1980",t:0.14},{y:"1985",t:0.05},{y:"1990",t:0.30},{y:"1995",t:0.31},
  {y:"2000",t:0.28},{y:"2005",t:0.45},{y:"2010",t:0.49},{y:"2015",t:0.71},
  {y:"2020",t:0.70},{y:"2025",t:0.85},{y:"2030",t:1.00},{y:"2035",t:1.10},{y:"2040",t:1.20},
];
// Coral coverage % of 1950 baseline — GCRMN 2020 (observed) + Logan et al. 2025 / IPCC SR1.5 (projected *)
const coralData = [
  {y:"1980",c:90},{y:"1985",c:88},{y:"1990",c:87},{y:"1995",c:84},
  {y:"2000",c:79},{y:"2005",c:82},{y:"2010",c:84},{y:"2015",c:78},
  {y:"2020",c:74},{y:"2025",c:70},{y:"2030",c:66},{y:"2035",c:61},{y:"2040",c:56},
];
const plasticData = [
  {y:"2000",p:8},{y:"2005",p:11},{y:"2010",p:15},{y:"2015",p:20},
  {y:"2020",p:27},{y:"2024",p:33},
];
// Merged — identical years every 5 yrs 1980–2040, both datasets aligned
const combinedData = [
  {y:"1980", t:0.14, c:90},
  {y:"1985", t:0.05, c:88},
  {y:"1990", t:0.30, c:87},
  {y:"1995", t:0.31, c:84},
  {y:"2000", t:0.28, c:79},
  {y:"2005", t:0.45, c:82},
  {y:"2010", t:0.49, c:84},
  {y:"2015", t:0.71, c:78},
  {y:"2020", t:0.70, c:74},
  {y:"2025", t:0.85, c:70},
  {y:"2030", t:1.00, c:66},
  {y:"2035", t:1.10, c:61},
  {y:"2040", t:1.20, c:56},
];

const TEAM = [
  { name: "Scott",   emoji: "🦈", color: T.teal },
  { name: "Cara",    emoji: "🐠", color: T.coral },
  { name: "Jiaheng", emoji: "🐙", color: T.seafoam },
  { name: "Edith",   emoji: "🐚", color: "#a0c4ff" },
  { name: "Qihao",   emoji: "🐬", color: T.amber },
];

const SDG_ISSUES = [
  { icon: "__bag__",    title: "Plastic Pollution",    accent: T.coral,   text: "Over 11 million metric tonnes of plastic enter the ocean every year. In Asia — responsible for the majority of ocean plastic — rapid urbanisation and insufficient waste infrastructure have made coastal plastic pollution a defining crisis of our generation." },
  { icon: "__coral__",  title: "Coral Reef Decline",   accent: T.amber,   text: "Between 15–30% of the world's coral reefs have already been degraded or destroyed. Plastic debris smothers coral, blocks sunlight, and introduces pathogens — directly accelerating bleaching and colony death." },
  { icon: "__fish__",   title: "Marine Ecosystem Loss", accent: T.seafoam, text: "Coral reefs support over 25% of all marine species despite covering less than 1% of the ocean floor. As reefs degrade from plastic and warming, entire food webs collapse, threatening biodiversity and the billion people who depend on reef fisheries." },
  { icon: "__globe__",  title: "Asia's Plastic Crisis", accent: "#a0c4ff", text: "Asia accounts for an estimated 80% of ocean plastic entering the sea. Factors include high coastal population density, fast-growing consumer economies, and waste management gaps — making this region the critical focus for any meaningful intervention." },
];

const SOLUTIONS = [
  { num: "01", title: "Beach Clean-Up with SY Junior Seakeepers", icon: "__beach__",   text: "On 21st April, Waves Without Waste joined SY Junior Seakeepers for a hands-on beach clean-up. We collected, sorted, and weighed plastic waste to generate primary data on the types and volumes of plastic reaching the shoreline — directly connecting our research to action." },
  { num: "02", title: "Interview: Big Blue Ocean Cleanup",         icon: "__mic__",     text: "We conducted a primary research interview with the Big Blue Ocean Cleanup organisation to understand large-scale ocean plastic removal strategies, the challenges of micro-plastic collection, and how community-level action connects to global ocean health outcomes." },
  { num: "03", title: "Reducing Single-Use Plastic",               icon: "__recycle__", text: "Individual and community-level reduction of single-use plastics is one of the most direct levers available. Switching to reusables, refusing unnecessary plastic packaging, and supporting local plastic-free policies can measurably reduce the flow of waste into coastal waterways." },
  { num: "04", title: "Protecting Coral Reef Ecosystems",          icon: "__coral__", text: "With 15–30% of reefs already degraded, protection must combine clean-up action with systemic change — supporting marine protected areas, reducing coastal runoff, and advocating for stronger regional plastic waste policy across Asia." },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────
const PngIcon = ({ src, alt, size = 35 }) => (
  <img src={src} alt={alt} style={{ width: size, height: size, objectFit: "contain", display: "inline-block", verticalAlign: "middle" }} />
);
const CoralImg      = ({ size = 35 }) => <PngIcon src="/coral.png"        alt="coral"      size={size} />;
const PlasticBagImg = ({ size = 35 }) => <PngIcon src="/plastic-bag.png"  alt="plastic bag" size={size} />;
const FishImg       = ({ size = 35 }) => <PngIcon src="/fish.png"         alt="fish"       size={size} />;
const GlobeImg      = ({ size = 35 }) => <PngIcon src="/globe.png"        alt="globe"      size={size} />;
const MicImg        = ({ size = 35 }) => <PngIcon src="/microphone.png"   alt="microphone" size={size} />;
const LeafImg       = ({ size = 35 }) => <PngIcon src="/leaf.png"         alt="leaf"       size={size} />;
const CameraImg     = ({ size = 35 }) => <PngIcon src="/camera.png"       alt="camera"     size={size} />;
const WaveImg       = ({ size = 35 }) => <PngIcon src="/wave.png"         alt="wave"       size={size} />;
const BeachImg      = ({ size = 35 }) => <PngIcon src="/beach.png"        alt="beach"      size={size} />;
const RecycleImg    = ({ size = 35 }) => <PngIcon src="/recycle.png"      alt="recycle"    size={size} />;

const ICON_MAP = {
  "__coral__": CoralImg,
  "__bag__":   PlasticBagImg,
  "__fish__":  FishImg,
  "__globe__": GlobeImg,
  "__mic__":   MicImg,
  "__leaf__":  LeafImg,
  "__wave__":  WaveImg,
  "__beach__": BeachImg,
  "__recycle__": RecycleImg,
};
const renderIcon = (icon, size = 35) => {
  const Comp = ICON_MAP[icon];
  return Comp ? <Comp size={size} /> : icon;
};

// ─── BUBBLE LAYER ──────────────────────────────────────────────────────────
function Bubbles({ count = 18 }) {
  const bubbles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 95}%`,
      size: 4 + Math.random() * 10,
      duration: 8 + Math.random() * 14,
      delay: Math.random() * 12,
      bottom: `${-5 + Math.random() * 10}%`,
    }))
  ).current;

  return (
    <>
      {bubbles.map(b => (
        <div key={b.id} className="bubble" style={{
          left: b.left, bottom: b.bottom,
          width: b.size, height: b.size,
          animationDuration: `${b.duration}s`,
          animationDelay: `${b.delay}s`,
        }} />
      ))}
    </>
  );
}

// ─── CAUSTIC LIGHT ────────────────────────────────────────────────────────
function CausticLight() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          position: "absolute",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(90,196,224,${0.08 + i*0.01}) 0%, transparent 70%)`,
          width: `${200 + i*120}px`, height: `${120 + i*80}px`,
          top: `${10 + i*8}%`, left: `${5 + i*15}%`,
          animation: `${i%2===0 ? "causticShimmer" : "caustic2"} ${5 + i*1.5}s ease-in-out infinite`,
          animationDelay: `${i*0.7}s`,
          filter: "blur(2px)",
        }} />
      ))}
      {/* Horizontal light beams */}
      {[0,1,2].map(i => (
        <div key={`beam-${i}`} style={{
          position: "absolute",
          width: "2px",
          height: "100%",
          background: `linear-gradient(180deg, rgba(90,196,224,0.12) 0%, transparent 60%)`,
          left: `${20 + i*25}%`,
          top: 0,
          animation: `causticShimmer ${7 + i*2}s ease-in-out infinite`,
          animationDelay: `${i*1.1}s`,
          transform: `rotate(${-3 + i*3}deg)`,
          transformOrigin: "top center",
          filter: "blur(1px)",
        }} />
      ))}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────
const PAGES = ["Home", "About SDG14", "Data & Evidence", "Solutions"];

function Navbar({ current, onNav, reducedMotion, onToggleMotion }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled
        ? "linear-gradient(180deg, rgba(6,14,26,0.97) 0%, rgba(10,25,48,0.95) 100%)"
        : "linear-gradient(180deg, rgba(6,14,26,0.85) 0%, rgba(10,25,48,0.6) 100%)",
      borderBottom: `1px solid ${scrolled ? "rgba(90,196,224,0.2)" : "rgba(90,196,224,0.08)"}`,
      backdropFilter: "blur(16px)",
      transition: "all 0.3s ease",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "none",
    }}>
      {/* Main bar */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 62, gap: 12 }}>
        {/* Logo icon */}
        <div onClick={() => { onNav("Home"); setMobileOpen(false); }} style={{ cursor: "pointer", flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #0d3a54, #1a6a8a)",
            border: `1.5px solid ${T.tealDim}`,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
            boxShadow: "0 2px 10px rgba(90,196,224,0.2)",
          }}><CoralImg size={35} /></div>
        </div>

        {/* Desktop nav — hidden on small via .desktop-nav media query */}
        <div style={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          gap: 4, flexWrap: "nowrap", overflow: "hidden",
        }}>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {PAGES.map(p => (
              <button key={p} className={`nav-link${current === p ? " active" : ""}`}
                onClick={() => onNav(p)}
                style={{ whiteSpace: "nowrap", padding: "6px 10px", fontSize: 12 }}>
                {p}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: T.steel, margin: "0 4px", flexShrink: 0 }} />
            <a href="https://coral.scottreule.com" target="_blank" rel="noreferrer"
              style={{
                background: "linear-gradient(180deg, rgba(90,196,224,0.15), rgba(90,196,224,0.05))",
                border: `1px solid ${T.tealDim}`,
                borderRadius: 7, padding: "6px 10px",
                color: T.teal, fontSize: 11, fontFamily: T.geo,
                fontWeight: 600, cursor: "pointer", textDecoration: "none",
                letterSpacing: 0.3, flexShrink: 0,
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            ><FishImg size={16} /> Sim ↗</a>
          </div>

          {/* Motion toggle */}
          <button
            onClick={onToggleMotion}
            title={reducedMotion ? "Enable animations" : "Reduce motion"}
            style={{
              background: reducedMotion ? "rgba(90,196,224,0.1)" : "none",
              border: `1px solid ${reducedMotion ? T.tealDim : T.steel}`,
              borderRadius: 6, padding: "5px 8px",
              color: reducedMotion ? T.teal : T.dim,
              fontSize: 10, cursor: "pointer", flexShrink: 0,
              fontFamily: T.geo, letterSpacing: 0.5,
            }}
          >{reducedMotion ? "⏸ STILL" : "◎ MOTION"}</button>

          {/* Hamburger for narrow viewports */}
          <button onClick={() => setMobileOpen(o => !o)} style={{
            background: "none", border: `1px solid ${T.steel}`,
            borderRadius: 6, padding: "5px 8px",
            color: T.teal, fontSize: 14, cursor: "pointer", flexShrink: 0,
          }} id="hamburger">☰</button>
        </div>
      </div>

      {/* Dropdown menu for mobile */}
      {mobileOpen && (
        <div style={{
          background: "rgba(6,14,26,0.98)",
          borderTop: `1px solid ${T.steel}`,
          padding: "12px 20px 16px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {PAGES.map(p => (
            <button key={p} className={`nav-link${current === p ? " active" : ""}`}
              onClick={() => { onNav(p); setMobileOpen(false); }}
              style={{ textAlign: "left", padding: "10px 4px", fontSize: 14, borderBottom: `1px solid rgba(90,196,224,0.06)` }}>
              {p}
            </button>
          ))}
          <a href="https://coral.scottreule.com" target="_blank" rel="noreferrer"
            style={{
              marginTop: 8,
              background: "rgba(90,196,224,0.08)",
              border: `1px solid ${T.tealDim}`,
              borderRadius: 7, padding: "10px 14px",
              color: T.teal, fontSize: 13, fontFamily: T.geo,
              fontWeight: 600, textDecoration: "none", textAlign: "center",
            }}><FishImg size={18} /> Launch Simulator ↗</a>
          <button
            onClick={onToggleMotion}
            style={{
              marginTop: 4,
              background: reducedMotion ? "rgba(90,196,224,0.1)" : "none",
              border: `1px solid ${reducedMotion ? T.tealDim : T.steel}`,
              borderRadius: 7, padding: "10px 14px",
              color: reducedMotion ? T.teal : T.dim,
              fontSize: 12, fontFamily: T.geo, cursor: "pointer", textAlign: "center",
            }}
          >{reducedMotion ? "⏸ Animations off" : "◎ Reduce Motion"}</button>
        </div>
      )}
    </nav>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────
function HomePage({ onNav }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const lois = [
    { num: "I", title: "Marine Ecosystems", sub: "The nature and characteristics of marine ecosystems.", icon: "__wave__" },
    { num: "II", title: "Plastic Pollution in Asia", sub: "Factors influencing the growth of plastic pollution in Asia.", icon: "__bag__" },
    { num: "III", title: "Our Responsibility", sub: "Our responsibility in preserving marine sustainability.", icon: "__leaf__" },
  ];

  return (
    <div className="page-enter" style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Hero */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #060e1a 0%, #0a1930 50%, #0d2240 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "100px 24px 60px",
        position: "relative",
        textAlign: "center",
      }}>
        <CausticLight />
        <Bubbles count={22} />

        {/* SDG Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(90,196,224,0.08)",
          border: "1px solid rgba(90,196,224,0.2)",
          borderRadius: 20, padding: "6px 16px",
          marginBottom: 28,
          animation: visible ? "fadeSlideUp 0.5s ease both" : "none",
          animationDelay: "0.1s",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.teal, boxShadow: `0 0 6px ${T.teal}` }} />
          <span style={{ fontFamily: T.geo, fontSize: 11, color: T.teal, letterSpacing: 2, textTransform: "uppercase" }}>
            IB PYPX · SDG 14 · Life Below Water
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "clamp(38px, 6vw, 72px)",
          fontWeight: 700,
          color: T.seafoam,
          textShadow: "0 4px 30px rgba(90,196,224,0.35), 0 0 60px rgba(90,196,224,0.1)",
          letterSpacing: 3,
          lineHeight: 1.15,
          marginBottom: 20,
          animation: visible ? "fadeSlideUp 0.6s ease both" : "none",
          animationDelay: "0.2s",
        }}>
          WAVES WITHOUT WASTE
        </h1>

        <div style={{
          width: 120, height: 2,
          background: `linear-gradient(90deg, transparent, ${T.teal}, transparent)`,
          margin: "0 auto 28px",
          animation: visible ? "fadeSlideUp 0.5s ease both" : "none",
          animationDelay: "0.3s",
        }} />

        {/* Central idea */}
        <p style={{
          fontFamily: T.geo,
          fontSize: "clamp(15px, 2vw, 18px)",
          color: T.pale,
          maxWidth: 680,
          lineHeight: 1.75,
          marginBottom: 40,
          fontStyle: "italic",
          opacity: 0.9,
          animation: visible ? "fadeSlideUp 0.6s ease both" : "none",
          animationDelay: "0.4s",
        }}>
          "Human use of plastic affects marine ecosystems and ocean sustainability."
        </p>

        {/* CTA buttons */}
        <div style={{
          display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
          marginBottom: 64,
          animation: visible ? "fadeSlideUp 0.6s ease both" : "none",
          animationDelay: "0.5s",
        }}>
          <button className="btn-primary" onClick={() => onNav("About SDG14")}>Explore the Project</button>
          <a href="https://coral.scottreule.com" target="_blank" rel="noreferrer" className="btn-coral"
            style={{ textDecoration: "none", display: "inline-block", animation: "pulseGlow 2.5s ease-in-out infinite" }}>
            <FishImg size={20} /> Launch Coral Simulator
          </a>
        </div>

        {/* LOI Cards */}
        <div style={{
          width: "100%", maxWidth: 900,
          animation: visible ? "fadeSlideUp 0.7s ease both" : "none",
          animationDelay: "0.65s",
        }}>
          <div style={{ fontFamily: T.geo, fontSize: 10, color: T.dim, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
            Lines of Inquiry
          </div>
          <div className="loi-grid">
            {lois.map((l, i) => (
              <div key={i} className="loi-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, flexShrink: 0,
                    background: "rgba(90,196,224,0.08)",
                    border: "1px solid rgba(90,196,224,0.2)",
                    borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>{renderIcon(l.icon, 35)}</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: T.geo, fontSize: 10, color: T.dim, letterSpacing: 2, marginBottom: 4 }}>LOI {l.num}</div>
                    <div style={{ fontFamily: T.geo, fontSize: 13, color: T.seafoam, fontWeight: 600, marginBottom: 6 }}>{l.title}</div>
                    <div style={{ fontFamily: T.geo, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{l.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div className="page-enter" style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1060, margin: "0 auto" }}>
      <SectionHeader
        label="About the Project"
        title="SDG 14: Life Below Water"
        sub="Understanding the crisis beneath the surface"
      />

      {/* What is SDG 14 */}
      <div className="rivet-panel" style={{ padding: "28px 32px", marginBottom: 36 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            background: "linear-gradient(135deg, #0d3a54, #1a6a8a)",
            border: `2px solid ${T.tealDim}`,
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <img src="/coral.png" alt="coral" style={{ width: 38, height: 38, objectFit: "contain" }} />
          </div>
          <div>
            <h2 style={{ fontFamily: T.geo, fontSize: 20, color: T.seafoam, marginBottom: 10, fontWeight: 700 }}>What is SDG 14?</h2>
            <p style={{ fontFamily: T.geo, fontSize: 14, color: T.pale, lineHeight: 1.8, maxWidth: 700 }}>
              Sustainable Development Goal 14 — <em>Life Below Water</em> — calls for conservation and sustainable use of the world's oceans, seas, and marine resources. Coral reefs, covering less than 1% of the ocean floor, support more than 25% of all marine species and provide food and livelihoods for over a billion people globally. Yet 15–30% of reefs have already been degraded.
            </p>
            <p style={{ fontFamily: T.geo, fontSize: 14, color: T.muted, lineHeight: 1.8, marginTop: 12, maxWidth: 700 }}>
              Our PYPX project investigates how human use of plastic threatens marine ecosystems — combining primary research including a beach clean-up with SY Junior Seakeepers and an interview with Big Blue Ocean Cleanup, alongside data-driven analysis of plastic pollution trends across Asia.
            </p>
          </div>
        </div>
      </div>

      {/* Issue dossier cards */}
      <div style={{ marginBottom: 16, fontFamily: T.geo, fontSize: 10, color: T.dim, letterSpacing: 3, textTransform: "uppercase" }}>
        Key Threats — Field Dossiers
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
        {SDG_ISSUES.map((issue, i) => (
          <div key={i} className="dossier-card" style={{ "--card-accent": issue.accent }}>
            {/* Stamp-like accent top */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40,
                background: `linear-gradient(135deg, ${issue.accent}22, ${issue.accent}11)`,
                border: `1.5px solid ${issue.accent}55`,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>{renderIcon(issue.icon, 37)}</div>
              <div>
                <div style={{ fontFamily: T.geo, fontSize: 9, color: issue.accent, letterSpacing: 2, textTransform: "uppercase", opacity: 0.8 }}>Threat</div>
                <div style={{ fontFamily: T.geo, fontSize: 14, color: T.pale, fontWeight: 700 }}>{issue.title}</div>
              </div>
            </div>
            <p style={{ fontFamily: T.geo, fontSize: 12, color: T.muted, lineHeight: 1.7 }}>{issue.text}</p>
            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: `1px solid rgba(90,196,224,0.1)`,
              fontFamily: T.geo, fontSize: 10, color: T.dim, letterSpacing: 1,
              fontStyle: "italic",
            }}>
              Classification: PYPX Research · SDG 14
            </div>
          </div>
        ))}
      </div>

      {/* Simulator callout */}
      <div className="glass-panel" style={{
        marginTop: 40,
        padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: T.geo, fontSize: 14, color: T.seafoam, fontWeight: 700, marginBottom: 6 }}>
            <FishImg size={18} /> Interactive Coral Reef Simulator
          </div>
          <div style={{ fontFamily: T.geo, fontSize: 12, color: T.muted, maxWidth: 480 }}>
            Explore IPCC SSP2-4.5 climate scenarios in real time. Watch how ocean temperature changes affect coral bleaching, fish populations, and reef health over a 100-year timeline.
          </div>
        </div>
        <a href="https://coral.scottreule.com" target="_blank" rel="noreferrer" className="btn-coral"
          style={{ textDecoration: "none", flexShrink: 0 }}>
          Launch Simulator ↗
        </a>
      </div>
    </div>
  );
}

// ─── DATA PAGE ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,25,48,0.95)", border: `1px solid ${T.steel}`,
      borderRadius: 8, padding: "10px 14px",
      fontFamily: T.geo, fontSize: 12,
    }}>
      <div style={{ color: T.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ color: T.teal, fontFamily: T.num, fontWeight: 700 }}>
        {payload[0].value}{unit}
      </div>
    </div>
  );
};

function DataPage() {
  const stats = [
    { value: "15–30%", label: "Of coral reefs already degraded or destroyed", color: T.coral, icon: "__coral__" },
    { value: "11M",    label: "Tonnes of plastic entering oceans each year", color: T.amber, icon: "__bag__", unit: "t/yr" },
    { value: "80%",    label: "Of ocean plastic originates from Asia", color: T.seafoam, icon: "__globe__" },
    { value: "25%",    label: "Of all marine species depend on coral reefs", color: "#a0c4ff", icon: "__fish__" },
  ];

  return (
    <div className="page-enter" style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1060, margin: "0 auto" }}>
      <SectionHeader
        label="Data & Evidence"
        title="The Numbers Don't Lie"
        sub="Real data illustrating the scale of the ocean health crisis"
      />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 44 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>{renderIcon(s.icon, 43)}</div>
            <div style={{
              fontFamily: T.num,
              fontSize: 34, fontWeight: 700,
              color: s.color,
              textShadow: `0 0 20px ${s.color}55`,
              lineHeight: 1.1,
              marginBottom: 8,
            }}>{s.value}</div>
            <div style={{ fontFamily: T.geo, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 24 }}>

        {/* Combined overlay: temp rising, coral declining */}
        <div className="rivet-panel" style={{ padding: "22px 20px", gridColumn: "span 1" }}>
          <div style={{ fontFamily: T.geo, fontSize: 10, color: T.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Temperature vs Coverage</div>
          <div style={{ fontFamily: T.geo, fontSize: 16, color: T.pale, fontWeight: 700, marginBottom: 10 }}>As Oceans Warm, Reefs Decline</div>
          <div style={{ display: "flex", gap: 18, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: T.geo, fontSize: 10, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 18, height: 2, background: T.coral, display: "inline-block", borderRadius: 2 }} /> SST Anomaly (°C vs 1961–90)
            </span>
            <span style={{ fontFamily: T.geo, fontSize: 10, color: T.teal, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 18, height: 2, background: T.teal, display: "inline-block", borderRadius: 2 }} /> Coral Coverage (% of 1950)
            </span>
            <span style={{ fontFamily: T.geo, fontSize: 9, color: T.dim, display: "flex", alignItems: "center", gap: 4, fontStyle: "italic" }}>
              ··· 2025–2040 projected
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={combinedData} margin={{ right: 16 }}>
              <defs>
                <linearGradient id="tempGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.coral} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={T.coral} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="coralGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.teal} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={T.teal} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,196,224,0.08)" />
              <XAxis dataKey="y" tick={{ fill: T.dim, fontFamily: T.num, fontSize: 10 }} axisLine={{ stroke: T.steel }} />
              <YAxis yAxisId="coral" domain={[50, 95]} orientation="left"
                tick={{ fill: T.teal, fontFamily: T.num, fontSize: 9 }} axisLine={{ stroke: T.steel }}
                tickFormatter={v => `${v}%`} width={36} />
              <YAxis yAxisId="temp" domain={[0, 1.4]} orientation="right"
                tick={{ fill: T.coral, fontFamily: T.num, fontSize: 9 }} axisLine={{ stroke: T.steel }}
                tickFormatter={v => `+${v.toFixed(1)}°`} width={36} />
              <Tooltip formatter={(val, name) => name === "c" ? [`${val}%`, "Coral Coverage"] : [`${val}°C`, "Sea Temp"]} labelStyle={{ color: T.pale, fontFamily: T.geo }} contentStyle={{ background: "#0a1930", border: `1px solid ${T.steel}`, borderRadius: 8, fontSize: 11 }} />
              <Area yAxisId="coral" type="monotone" dataKey="c" stroke={T.teal} strokeWidth={2} fill="url(#coralGrad2)" dot={{ fill: T.teal, r: 3 }} connectNulls />
              <Area yAxisId="temp" type="monotone" dataKey="t" stroke={T.coral} strokeWidth={2} fill="url(#tempGrad2)" dot={{ fill: T.coral, r: 3 }} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Plastic */}
        <div className="rivet-panel" style={{ padding: "22px 20px" }}>
          <div style={{ fontFamily: T.geo, fontSize: 10, color: T.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Plastic Pollution</div>
          <div style={{ fontFamily: T.geo, fontSize: 16, color: T.pale, fontWeight: 700, marginBottom: 18 }}>Plastic Ocean Entry (Mt/yr)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={plasticData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,196,224,0.08)" />
              <XAxis dataKey="y" tick={{ fill: T.dim, fontFamily: T.num, fontSize: 10 }} axisLine={{ stroke: T.steel }} />
              <YAxis tick={{ fill: T.dim, fontFamily: T.num, fontSize: 10 }} axisLine={{ stroke: T.steel }} />
              <Tooltip content={<CustomTooltip unit=" Mt" />} />
              <Bar dataKey="p" fill={T.amber} radius={[4,4,0,0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{
        background: "rgba(90,196,224,0.04)",
        border: "1px solid rgba(90,196,224,0.1)",
        borderRadius: 8, padding: "14px 18px",
        fontFamily: T.geo, fontSize: 11, color: T.dim,
        fontStyle: "italic", lineHeight: 1.6,
      }}>
        * Data sourced from IPCC AR6, NOAA Coral Reef Watch, IUCN, and Our World in Data. Primary research data collected from the Waves Without Waste beach clean-up (21 April 2025, with SY Junior Seakeepers) and Big Blue Ocean Cleanup interview.
      </div>
    </div>
  );
}

// ─── SOLUTIONS PAGE ───────────────────────────────────────────────────────
function SolutionsPage() {
  return (
    <div className="page-enter" style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1060, margin: "0 auto" }}>
      <SectionHeader
        label="Solutions"
        title="Charting a Course Forward"
        sub="Evidence-based interventions to protect and restore ocean health"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
        {SOLUTIONS.map((s, i) => (
          <div key={i} className="rivet-panel" style={{ padding: "26px 24px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
            }}>
              <div style={{
                fontFamily: T.num, fontSize: 11, color: T.dim,
                letterSpacing: 1, border: `1px solid ${T.steel}`,
                borderRadius: 4, padding: "2px 7px",
              }}>
                {s.num}
              </div>
              <div style={{ fontSize: 22 }}>{renderIcon(s.icon, 39)}</div>
            </div>
            <h3 style={{ fontFamily: T.geo, fontSize: 15, color: T.seafoam, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
            <p style={{ fontFamily: T.geo, fontSize: 12, color: T.muted, lineHeight: 1.7 }}>{s.text}</p>
            <div style={{
              marginTop: 18,
              height: 3, borderRadius: 2,
              background: `linear-gradient(90deg, ${T.teal}44, transparent)`,
            }} />
          </div>
        ))}
      </div>

      {/* Photo placeholder */}
      <div style={{
        marginTop: 36,
        background: "linear-gradient(135deg, rgba(255,140,80,0.06), rgba(10,25,48,0.8))",
        border: `1px solid ${T.coralDim}44`,
        borderRadius: 12, padding: "26px 28px",
      }}>
        <div style={{
          width: "100%",
          aspectRatio: "16/9",
          background: "linear-gradient(135deg, rgba(90,196,224,0.06), rgba(10,25,48,0.8))",
          border: `2px dashed ${T.steel}`,
          borderRadius: 10,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 8, color: T.dim,
        }}>
          <CameraImg size={42} />
          <span style={{ fontFamily: T.geo, fontSize: 11, letterSpacing: 1 }}>Beach clean-up photo</span>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────
function SectionHeader({ label, title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 44 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "rgba(90,196,224,0.07)",
        border: "1px solid rgba(90,196,224,0.18)",
        borderRadius: 16, padding: "5px 14px", marginBottom: 18,
      }}>
        <span style={{ fontFamily: T.geo, fontSize: 10, color: T.teal, letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
      </div>
      <h2 style={{
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "clamp(26px, 4vw, 42px)",
        color: T.seafoam,
        fontWeight: 700,
        letterSpacing: 2,
        marginBottom: 12,
        textShadow: "0 2px 20px rgba(90,196,224,0.2)",
      }}>{title}</h2>
      <p style={{ fontFamily: T.geo, fontSize: 14, color: T.muted, maxWidth: 520, margin: "0 auto" }}>{sub}</p>
      <div style={{
        width: 60, height: 2,
        background: `linear-gradient(90deg, transparent, ${T.teal}, transparent)`,
        margin: "18px auto 0",
      }} />
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer({ onNav }) {
  return (
    <footer style={{
      background: "linear-gradient(180deg, #060e1a, #040a12)",
      borderTop: `1px solid ${T.steel}`,
      padding: "32px 24px",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontFamily: "Cinzel, Georgia, serif", fontSize: 16, color: T.tealDim, letterSpacing: 2, marginBottom: 8 }}>
          <CoralImg size={33} /> WAVES WITHOUT WASTE
        </div>
        <div style={{ fontFamily: T.geo, fontSize: 11, color: T.dim, marginBottom: 16 }}>
          IB PYP Exhibition · SDG 14 · {new Date().getFullYear()}
        </div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          {PAGES.map(p => (
            <button key={p} onClick={() => onNav(p)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: T.geo, fontSize: 11, color: T.dim,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.target.style.color = T.teal}
            onMouseLeave={e => e.target.style.color = T.dim}
            >{p}</button>
          ))}
        </div>
        <div style={{ fontFamily: T.geo, fontSize: 10, color: "#2a4a6a", lineHeight: 1.6 }}>
        Waves Without Waste — Scott · Cara · Jiaheng · Qihao · Edith
        </div>
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("Home");
  const [key, setKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const navigate = useCallback((p) => {
    setPage(p);
    setKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const renderPage = () => {
    switch(page) {
      case "Home":             return <HomePage onNav={navigate} />;
      case "About SDG14":     return <AboutPage />;
      case "Data & Evidence": return <DataPage />;
      case "Solutions":       return <SolutionsPage />;
      default:                return <HomePage onNav={navigate} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className={reducedMotion ? "reduced-motion" : ""} style={{ minHeight: "100vh", background: T.abyss, position: "relative" }}>
        <Navbar current={page} onNav={navigate} reducedMotion={reducedMotion} onToggleMotion={() => setReducedMotion(m => !m)} />
        <main key={key}>
          {renderPage()}
        </main>
        <Footer onNav={navigate} />
      </div>
    </>
  );
}
