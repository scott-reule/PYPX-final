// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  reef-watch.jsx  —  Waves Without Waste  (IB PYPX · SDG 14)              ║
// ║  Single-file React app. All components, styles, and data live here.      ║
// ║                                                                          ║
// ║  QUICK GUIDE                                                             ║
// ║  ✅ SAFE    = free to edit, won't break the app                          ║
// ║  ⚠️  CAREFUL = edit with caution, small mistakes can break layout        ║
// ║  ❌ DANGER  = don't touch unless you know what you're doing              ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ❌ DANGER — React core imports. Never remove or rename these.
//    useState/useEffect/useRef/useCallback are hooks used throughout the file.
//    React itself is needed because Vite compiles JSX to React.createElement().
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// ❌ DANGER — Charting library (recharts). Only remove an import if you also
//    remove every usage of it in the charts below. Adding new chart types
//    (e.g. PieChart) requires importing them here first.
import { LineChart, Line, AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// ✅ SAFE — This is your colour palette. Every colour used in the site
//    comes from here. Change a value here and it updates everywhere.
//    T.abyss  = darkest background  |  T.teal = primary accent (blue-green)
//    T.coral  = orange highlight    |  T.pale = main body text colour
//    T.geo    = serif font stack    |  T.num  = numbers / data font
//
// ⚠️  CAREFUL — The key names (abyss, teal, coral…) are referenced all over
//    the file. Renaming a key (e.g. "teal" → "blue") will break every place
//    that uses T.teal. Only change the hex values, not the key names.
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

// ─── GLOBAL STYLES (CSS-in-JS) ───────────────────────────────────────────────
// ✅ SAFE — The `css` string is injected as a <style> tag into the page.
//    Think of it as a regular CSS file written inside JavaScript.
//    Template literals like ${T.teal} pull live values from the T object above.
//
// ⚠️  CAREFUL — The @keyframes blocks (bubbleRise, gradientShift, etc.) drive
//    all the animations. Changing % values changes animation timing. Deleting
//    a keyframe name while the animation is still referenced will silently
//    break that animation.
//
// ❌ DANGER — The class names (.glass-panel, .rivet-panel, .btn-primary…) are
//    used directly in the JSX below as className="glass-panel" etc.
//    Renaming a class here WITHOUT updating every className= in the JSX below
//    will make those elements lose their styling.
const css = `
  /* Loads the Cinzel display font from Google Fonts (used for headings).
     ⚠️  Requires internet. Works offline only if font is already cached. */
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');

  /* ✅ SAFE — CSS reset: removes browser default margin/padding on everything */
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ✅ SAFE — CSS variables mirroring the T token object. Useful if you ever
     want to reference a colour from a plain CSS context (e.g. ::before). */
  :root {
    --abyss: ${T.abyss};
    --teal: ${T.teal};
    --coral: ${T.coral};
    --pale: ${T.pale};
  }

  /* ✅ SAFE — Background gradient animation keyframes.
     Moves the gradient's "camera" back and forth across a 400%×400% canvas,
     creating a slow shifting colour wash effect.
     Change "18s" below to make it faster (lower) or slower (higher). */
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* ✅ SAFE — Animated gradient background on the page body.
     The 4 colours (#304df0 blue, #65aaeb sky, #00ffc8 cyan, #6BEEF6 aqua)
     cycle smoothly via gradientShift above.
     To change colours: edit the hex values in the linear-gradient line.
     To change speed: edit "18s" in the animation line.
     ❌ DANGER — Don't remove background-size: 400% 400%; the animation
     only works because the gradient is bigger than the viewport. */
  body {
    background: linear-gradient(-45deg, #060e1a, #0a1930, #0d2240, #081525, #0a1930, #060e1a);
    background-size: 400% 400%;
    animation: gradientShift 18s ease infinite;
    color: ${T.pale};
    font-family: ${T.geo};
    overflow-x: hidden;
  }

  /* ✅ SAFE — Custom scrollbar styling (Chrome/Safari only, ignored by Firefox).
     width: 6px makes it slim. Change ${T.steel} to any colour for the thumb. */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.abyss}; }
  ::-webkit-scrollbar-thumb { background: ${T.steel}; border-radius: 3px; }

  /* ✅ SAFE — Bubble floating-up animation keyframes.
     Bubbles drift sideways slightly (translateX) as they rise (translateY).
     Adjust the translateX pixel values for more/less horizontal drift.
     ⚠️  CAREFUL — translateY values are in viewport-height units (vh).
     -100vh means "rise the full height of the screen". Don't change this
     or bubbles may not fully disappear off-screen. */
  @keyframes bubbleRise {
    0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
    25%  { transform: translateY(-25vh) translateX(8px) scale(1.05); opacity: 0.5; }
    50%  { transform: translateY(-50vh) translateX(-5px) scale(0.95); opacity: 0.4; }
    75%  { transform: translateY(-75vh) translateX(6px) scale(1.02); opacity: 0.25; }
    100% { transform: translateY(-100vh) translateX(0) scale(0.8); opacity: 0; }
  }

  /* ✅ SAFE — Underwater light-shimmer animation (used by CausticLight component).
     Two variants (causticShimmer / caustic2) with slightly different timing
     so the ellipses don't all pulse in sync. Safe to adjust opacity values. */
  @keyframes causticShimmer {
    0%,100% { opacity: 0.04; transform: scale(1) rotate(0deg); }
    33%      { opacity: 0.07; transform: scale(1.05) rotate(1deg); }
    66%      { opacity: 0.05; transform: scale(0.97) rotate(-0.5deg); }
  }

  @keyframes caustic2 {
    0%,100% { opacity: 0.03; transform: scale(1.02) rotate(0deg); }
    50%      { opacity: 0.06; transform: scale(0.98) rotate(-1deg); }
  }

  /* ✅ SAFE — Page-enter animation: elements slide up from 32px below while fading in.
     Used by the .page-enter class applied to every page component. */
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

  /* ✅ SAFE — Applied to every page's root div. Triggers the slide-up entrance.
     "0.55s" = duration. The cubic-bezier is a spring-like easing curve.
     Change 0.55s to make transitions faster/slower. */
  .page-enter {
    animation: fadeSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* ✅ SAFE — Floating bubble style.
     background: radial-gradient gives the glassy sphere look.
     border: semi-transparent rim. pointer-events: none means clicks pass through.
     z-index: 0 keeps bubbles behind all content (z-index > 0 in panels).
     To make bubbles bigger: edit the size values in the Bubbles component below.
     To change bubble colour: edit the rgba values here. */
  .bubble {
    position: fixed;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), rgba(255,255,255,0.05));
    border: 1px solid rgba(255,255,255,0.35);
    pointer-events: none;
    animation: bubbleRise linear infinite;
    z-index: 0;
  }

  /* ✅ SAFE — Semi-transparent frosted-glass panel used for callout boxes.
     backdrop-filter: blur(12px) is the "blur-what's-behind-it" effect.
     Safe to change border colour, radius, or shadow strength. */
  .glass-panel {
    background: linear-gradient(135deg, rgba(26,53,80,0.7) 0%, rgba(10,25,48,0.85) 100%);
    border: 1px solid rgba(90,196,224,0.18);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(90,196,224,0.12);
  }

  /* ✅ SAFE — Dark card panel with decorative corner "rivets" (the ::before/::after
     pseudo-elements that draw small circles in each top corner).
     Used for chart containers and solution cards.
     Safe to change background gradient, border colour, or border-radius. */
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

  /* ✅ SAFE — Teal "Explore" style button.
     Safe to change colours, font-size, padding, border-radius.
     ⚠️  CAREFUL — Don't remove "cursor: pointer" or the button won't look clickable. */
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

  /* ✅ SAFE — Coral/orange "Launch Simulator" style button.
     Same structure as btn-primary but uses the coral/orange accent colour. */
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

  /* ✅ SAFE — Data stat cards (the big number tiles on the Data & Evidence page).
     The :hover rule lifts the card 3px and deepens the shadow. */
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

  /* ✅ SAFE — Navigation link button style (Home / About SDG14 / etc.).
     .active adds the glowing underline to the current page's button.
     ❌ DANGER — Don't remove "position: relative" from .nav-link or the
     ::after underline indicator will be positioned wrong. */
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

  /* ✅ SAFE — Badge / highlight card with a glowing top-border stripe.
     The ::before creates that thin top gradient line. */
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

  /* ✅ SAFE — "Field Dossier" threat cards on the About page.
     Each card uses a CSS custom property --card-accent for its bottom-glow
     colour (set per card in JSX via style={{ "--card-accent": issue.accent }}).
     The ::after creates the coloured bottom-line that fades in on hover. */
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

  /* ✅ SAFE — Lines of Inquiry cards on the Home page.
     The ::before draws a teal→coral vertical bar on the left edge of each card.
     Change the gradient colours to adjust that accent bar. */
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

  /* ⚠️  CAREFUL — Mobile hamburger menu visibility.
     The hamburger (☰) button is hidden on wide screens and shown on small
     screens (≤640px). The desktop nav is toggled the opposite way.
     ❌ DANGER — Don't change the #hamburger id or .desktop-nav class name
     here without also changing the corresponding id/className in the Navbar
     component JSX below. */
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

  /* ✅ SAFE — Accessibility: respects the OS-level "Reduce Motion" setting.
     Cuts all animations to near-zero so users with motion sensitivity
     don't experience flashing/moving elements. Don't remove this. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ✅ SAFE — Same as above but triggered by the ◎ MOTION button in the navbar.
     When the user clicks it, the App adds className="reduced-motion" to the
     root wrapper div, and this rule kills all child animations. */
  .reduced-motion *, .reduced-motion *::before, .reduced-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
// ✅ SAFE — All data arrays below. Edit these to update the charts and stat cards.
//
// Each array is an object list with short property names used by the charts:
//   y  = year label (shown on X-axis)
//   t  = temperature anomaly in °C (used in temp and combined charts)
//   c  = coral coverage % of 1950 baseline (used in coral and combined charts)
//   p  = plastic entering oceans in million tonnes/year (used in bar chart)
//
// ✅ SAFE — Add a new data point by adding another {y:"YEAR", value:0} object.
// ⚠️  CAREFUL — tempData, coralData, and combinedData must all use the same
//    year values if you want the combined chart (temp+coral overlay) to line up.
//    combinedData is manually merged — if you add a year to tempData or coralData,
//    also add it to combinedData with both t and c values.
//
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

// ✅ SAFE — Team members list. Each entry: name (shown in footer), emoji, accent colour.
//    Add or remove team members here. colour must be a hex string or T.xxx token.
const TEAM = [
  { name: "Scott",   emoji: "🦈", color: T.teal },
  { name: "Cara",    emoji: "🐠", color: T.coral },
  { name: "Jiaheng", emoji: "🐙", color: T.seafoam },
  { name: "Edith",   emoji: "🐚", color: "#a0c4ff" },
  { name: "Qihao",   emoji: "🐬", color: T.amber },
];

// ✅ SAFE — The 4 "Field Dossier" threat cards shown on the About SDG14 page.
//    Each entry: icon (must match a key in ICON_MAP below), title, accent colour, text.
//    Edit text/title freely. Change accent to any T.xxx colour or hex value.
//    To add a 5th card: add an object to this array. Layout is auto-grid (2-column).
const SDG_ISSUES = [
  { icon: "__bag__",    title: "Plastic Pollution",    accent: T.coral,   text: "Over 11 million metric tonnes of plastic enter the ocean every year. In Asia — responsible for the majority of ocean plastic — rapid urbanisation and insufficient waste infrastructure have made coastal plastic pollution a defining crisis of our generation." },
  { icon: "__coral__",  title: "Coral Reef Decline",   accent: T.amber,   text: "Between 15–30% of the world's coral reefs have already been degraded or destroyed. Plastic debris smothers coral, blocks sunlight, and introduces pathogens — directly accelerating bleaching and colony death." },
  { icon: "__fish__",   title: "Marine Ecosystem Loss", accent: T.seafoam, text: "Coral reefs support over 25% of all marine species despite covering less than 1% of the ocean floor. As reefs degrade from plastic and warming, entire food webs collapse, threatening biodiversity and the billion people who depend on reef fisheries." },
  { icon: "__globe__",  title: "Asia's Plastic Crisis", accent: "#a0c4ff", text: "Asia accounts for an estimated 80% of ocean plastic entering the sea. Factors include high coastal population density, fast-growing consumer economies, and waste management gaps — making this region the critical focus for any meaningful intervention." },
];

// ✅ SAFE — The 4 solution cards on the Solutions page.
//    num = display badge ("01", "02"…), icon = ICON_MAP key, title + text = content.
//    To add a solution: add an object and bump up the nums. Layout is 2-column grid.
const SOLUTIONS = [
  { num: "01", title: "Beach Clean-Up", icon: "__beach__",   text: "On 21st April, Waves Without Waste conducted a hands-on beach clean-up. We collected, sorted, and weighed plastic waste to generate primary data on the types and volumes of plastic reaching the shoreline — directly connecting our research to action." },
  { num: "02", title: "Interview: Big Blue Ocean Cleanup",         icon: "__mic__",     text: "We conducted a primary research interview with the Big Blue Ocean Cleanup organisation to understand large-scale ocean plastic removal strategies, the challenges of micro-plastic collection, and how community-level action connects to global ocean health outcomes." },
  { num: "03", title: "Reducing Single-Use Plastic",               icon: "__recycle__", text: "Individual and community-level reduction of single-use plastics is one of the most direct levers available. Switching to reusables, refusing unnecessary plastic packaging, and supporting local plastic-free policies can measurably reduce the flow of waste into coastal waterways." },
  { num: "04", title: "Protecting Coral Reef Ecosystems",          icon: "__coral__", text: "With 15–30% of reefs already degraded, protection must combine clean-up action with systemic change — supporting marine protected areas, reducing coastal runoff, and advocating for stronger regional plastic waste policy across Asia." },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────
// ✅ SAFE — PngIcon is a tiny wrapper that renders a PNG image at a given size.
//    The named exports below (CoralImg, FishImg…) are shortcuts so you can write
//    <CoralImg size={40} /> anywhere instead of <PngIcon src="/coral.png" size={40} />.
//
//    Image files live in the /public folder (e.g. /public/coral.png).
//    To add a new icon: drop the PNG into /public, create a new line like:
//      const MyImg = ({ size = 35 }) => <PngIcon src="/my-icon.png" alt="my icon" size={size} />;
//    Then add it to ICON_MAP below with a "__mykey__" string.
//
// ⚠️  CAREFUL — The src paths ("/coral.png") are relative to the web root (/public).
//    If a file is missing, the icon silently shows as a broken image placeholder.
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

// ⚠️  CAREFUL — ICON_MAP maps the string keys used in SDG_ISSUES / SOLUTIONS
//    (e.g. "__coral__") to their React component (e.g. CoralImg).
//    If you add a new icon type, add it here AND in the data array that uses it.
//    Deleting a key here while it's still referenced in a data array will cause
//    renderIcon() to fall back to rendering the raw string (e.g. "__coral__").
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

// ❌ DANGER — Don't modify renderIcon. It safely resolves an icon key to a
//    component, or falls back to the raw string if the key isn't found.
const renderIcon = (icon, size = 35) => {
  const Comp = ICON_MAP[icon];
  return Comp ? <Comp size={size} /> : icon;
};

// ─── BUBBLE LAYER ──────────────────────────────────────────────────────────
// ✅ SAFE — Renders floating bubble decorations over the page background.
//    The bubbles are generated ONCE using useRef so they don't re-randomize
//    on every render (which would cause flickering).
//
//    count   = total number of bubbles (default: 18). Pass a different number
//              when using <Bubbles count={22} /> in page components.
//    left    = random horizontal position (0–95% of viewport width)
//    size    = random diameter in px (4–14px)
//    duration = how many seconds one rise takes (8–22s, random per bubble)
//    delay   = animation start delay so they don't all appear at once (0–12s)
//    bottom  = starting vertical position, slightly below the fold
//
// ✅ SAFE — To change bubble count on a specific page, edit the count= prop
//    in that page's JSX (e.g. <Bubbles count={30} /> for more bubbles).
// ✅ SAFE — To change bubble colours, edit the .bubble CSS class above.
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
// ✅ SAFE — Purely decorative underwater light shimmer effect.
//    Renders 5 radial-gradient ellipses + 3 vertical light beams that pulse
//    using the causticShimmer / caustic2 CSS animations.
//    position: absolute means it fills its parent container without affecting layout.
//    pointer-events: none means it doesn't block clicks.
//
// ✅ SAFE — You can remove <CausticLight /> from any page's JSX to turn it off
//    for that page. It's used inside the HomePage hero section.
// ✅ SAFE — Adjust opacity values (the "0.08", "0.04" etc.) to make it
//    stronger or more subtle.
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
// ✅ SAFE — PAGES is the list of navigation links shown in the navbar and footer.
//    The strings here MUST exactly match the case names in App's renderPage() switch
//    statement below (e.g. "About SDG14" matches case "About SDG14":).
// ⚠️  CAREFUL — If you rename a page here, you must also rename it in renderPage().
const PAGES = ["Home", "About SDG14", "Data & Evidence", "Solutions"];

// ⚠️  CAREFUL — Navbar component. Receives:
//    current       = active page name (highlights the matching nav button)
//    onNav(page)   = called when a nav link is clicked to change pages
//    reducedMotion = whether animations are disabled (drives the MOTION button label)
//    onToggleMotion= called when MOTION button is clicked
//
//    scrolled state: turns true when user scrolls >30px, making the nav
//    background fully opaque (better readability against content).
//    mobileOpen state: controls the hamburger dropdown on small screens.
//
// ✅ SAFE — Edit text labels, colours, font sizes inside the JSX.
// ✅ SAFE — Change the coral.scottreule.com URL to point to a different simulator.
// ❌ DANGER — Don't remove the onNav() calls or the active className logic —
//    that's what makes navigation work.
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
// ✅ SAFE — Hero landing page. Contains:
//    - SDG badge pill
//    - "WAVES WITHOUT WASTE" heading
//    - Central idea quote
//    - CTA buttons (Explore + Launch Simulator)
//    - Lines of Inquiry (LOI) cards
//
//    The `visible` state triggers the staggered entrance animations.
//    Each element has animationDelay: "0.Xs" so they appear one after another.
//
// ✅ SAFE — Edit the hero quote text (line ~709), button labels, or LOI cards.
// ✅ SAFE — Change the lois array to update the LOI card titles and descriptions.
// ⚠️  CAREFUL — The hero background is set directly in style={{ background: ... }}
//    on the outer div (not from body CSS). This is intentional so the hero has
//    a consistent dark backdrop even while the body gradient shifts behind it.
//    If you want the gradient to show through the hero, change that background
//    value to "transparent".
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
// ✅ SAFE — "About SDG14" page. Contains:
//    - Section header (label/title/subtitle)
//    - "What is SDG 14?" text block (rivet-panel)
//    - 4 Field Dossier threat cards (pulled from SDG_ISSUES array above)
//    - Simulator callout box (glass-panel)
//
// ✅ SAFE — Edit the descriptive text inside the rivet-panel directly.
// ✅ SAFE — Update the threat cards by editing the SDG_ISSUES array at the top.
// ✅ SAFE — Change the simulator URL in the "Launch Simulator" button.
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
              Our PYPX project investigates how human use of plastic threatens marine ecosystems — combining primary research including a beach clean-up and an interview with Big Blue Ocean Cleanup, alongside data-driven analysis of plastic pollution trends across Asia.
            </p>
          </div>
        </div>
      </div>

      {/* Issue dossier cards */}
      <div style={{ marginBottom: 16, fontFamily: T.geo, fontSize: 10, color: T.dim, letterSpacing: 3, textTransform: "uppercase" }}>
        Key Threats — Field Dossiers
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 18 }}>
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
// ✅ SAFE — CustomTooltip renders the popup that appears when you hover a chart.
//    active = whether the tooltip is currently shown
//    payload = array of data values at the hovered point
//    label   = X-axis value at hovered point (the year)
//    unit    = appended after the number (e.g. " Mt" for plastic chart)
//
// ⚠️  CAREFUL — payload[0].value gives the first data series' value.
//    The combined chart (2 series) uses a formatter prop directly on <Tooltip>
//    instead of CustomTooltip, so this component is only used by the bar chart.
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

// ✅ SAFE — "Data & Evidence" page. Contains:
//    - 4 stat cards (big numbers pulled from the stats array inside)
//    - "Temperature vs Coverage" combined chart (uses combinedData)
//    - "Plastic Ocean Entry" bar chart (uses plasticData)
//    - Data attribution note at the bottom
//
// ✅ SAFE — Edit the stats array values, labels, and colours.
// ✅ SAFE — Edit the attribution text at the bottom.
// ⚠️  CAREFUL — Chart data comes from the module-level arrays (tempData, coralData,
//    plasticData, combinedData) defined near the top of the file.
//    Edit those arrays to change chart values.
// ❌ DANGER — The chart components (ComposedChart, BarChart etc.) reference
//    specific dataKey names ("t", "c", "p"). If you rename a property in the
//    data arrays, you must also update the matching dataKey= prop in the chart JSX.
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 16, marginBottom: 44 }}>
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

    </div>
  );
}

// ─── SOLUTIONS PAGE ───────────────────────────────────────────────────────
// ✅ SAFE — "Solutions" page. Contains:
//    - 4 solution cards (pulled from SOLUTIONS array at the top)
//    - A photo placeholder box (replace the dashed box with a real <img>)
//
// ─── PHOTO CAROUSEL (iMessage-style stack) ───────────────────────────────────
function PhotoCarousel({ photos }) {
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [active, setActive] = useState(false);
  const [lightbox, setLightbox] = useState(null); // null = closed, number = open at index
  const startXRef = useRef(null);
  const total = photos.length;

  const goNext = () => { if (current < total - 1) setCurrent(c => c + 1); };
  const goPrev = () => { if (current > 0) setCurrent(c => c - 1); };

  const onStart = (x) => { startXRef.current = x; setActive(true); };
  const onMove  = (x) => { if (startXRef.current !== null) setDragX(x - startXRef.current); };
  const onEnd   = () => {
    const dist = Math.abs(dragX);
    if (dist < 6) setLightbox(current); // tap = open lightbox
    else if (dragX < -55) goNext();
    else if (dragX > 55) goPrev();
    setDragX(0); setActive(false); startXRef.current = null;
  };

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") setLightbox(i => Math.min(i + 1, total - 1));
      if (e.key === "ArrowLeft")  setLightbox(i => Math.max(i - 1, 0));
      if (e.key === "Escape")     setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, total]);

  return (
    <>
      {/* Stack */}
      <div style={{ userSelect: "none", touchAction: "pan-y" }}>
        <div style={{
          position: "relative", height: 340,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {[2, 1].map(offset => {
            const idx = current + offset;
            if (idx >= total) return null;
            const rot = offset === 1 ? 5 : -3;
            return (
              <div key={idx} style={{
                position: "absolute", width: "78%", maxWidth: 360,
                borderRadius: 18, overflow: "hidden",
                transform: `rotate(${rot}deg) scale(${1 - offset * 0.05}) translateY(${offset * 3}px)`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.55)",
                zIndex: 5 - offset, pointerEvents: "none",
              }}>
                <img src={photos[idx]} alt="" style={{ width: "100%", display: "block" }} />
              </div>
            );
          })}

          <div
            style={{
              position: "absolute", width: "78%", maxWidth: 360,
              borderRadius: 18, overflow: "hidden",
              transform: `translateX(${dragX}px) rotate(${dragX * 0.02}deg)`,
              transition: active ? "none" : "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
              boxShadow: `0 ${10 + Math.abs(dragX) * 0.08}px ${36 + Math.abs(dragX) * 0.15}px rgba(0,0,0,0.7)`,
              zIndex: 10, cursor: "pointer",
            }}
            onTouchStart={e => onStart(e.touches[0].clientX)}
            onTouchMove={e => onMove(e.touches[0].clientX)}
            onTouchEnd={onEnd}
            onMouseDown={e => { onStart(e.clientX); e.preventDefault(); }}
            onMouseMove={e => { if (startXRef.current !== null) onMove(e.clientX); }}
            onMouseUp={onEnd}
            onMouseLeave={() => { if (startXRef.current !== null) onEnd(); }}
          >
            <img src={photos[current]} alt={`Beach clean-up ${current + 1}`}
              style={{ width: "100%", display: "block", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
          {photos.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{
              height: 6, borderRadius: 3, cursor: "pointer", transition: "all 0.3s",
              width: i === current ? 22 : 6,
              background: i === current ? T.teal : T.steel,
            }} />
          ))}
        </div>
      </div>

      {/* Lightbox — portalled to document.body to escape page-enter transform */}
      {lightbox !== null && createPortal(
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Prev arrow */}
          {lightbox > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(i => i - 1); }} style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
              width: 44, height: 44, color: "#fff", fontSize: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>‹</button>
          )}

          {/* Photo */}
          <img
            src={photos[lightbox]}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "88vh",
              borderRadius: 16, boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              display: "block",
            }}
          />

          {/* Next arrow */}
          {lightbox < total - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(i => i + 1); }} style={{
              position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
              width: 44, height: 44, color: "#fff", fontSize: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>›</button>
          )}

          {/* Close */}
          <button onClick={() => setLightbox(null)} style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
            width: 36, height: 36, color: "#fff", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>

          {/* Dot counter */}
          <div style={{ position: "absolute", bottom: 20, display: "flex", gap: 6 }}>
            {photos.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setLightbox(i); }} style={{
                height: 6, borderRadius: 3, cursor: "pointer", transition: "all 0.3s",
                width: i === lightbox ? 22 : 6,
                background: i === lightbox ? "#fff" : "rgba(255,255,255,0.3)",
              }} />
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ✅ SAFE — Edit solution content via the SOLUTIONS array at the top of the file.
function SolutionsPage() {
  return (
    <div className="page-enter" style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1060, margin: "0 auto" }}>
      <SectionHeader
        label="Solutions"
        title="Charting a Course Forward"
        sub="Evidence-based interventions to protect and restore ocean health"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
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

      {/* Beach clean-up photo carousel */}
      <div style={{ marginTop: 36 }}>
        <p style={{
          fontFamily: T.geo, fontSize: 11, color: T.teal,
          letterSpacing: 2, textTransform: "uppercase", textAlign: "center",
          marginBottom: 20,
        }}>Beach Clean-Up · 21 April 2025</p>
        <PhotoCarousel photos={[
          "/cleanup/p1.JPG", "/cleanup/p2.JPG", "/cleanup/p3.JPG",
          "/cleanup/p4.JPG", "/cleanup/p5.JPG", "/cleanup/p6.JPG",
        ]} />
      </div>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────
// ✅ SAFE — Reusable centred heading block used at the top of each page.
//    label = small all-caps pill text (e.g. "About the Project")
//    title = large heading (e.g. "SDG 14: Life Below Water")
//    sub   = smaller subtitle paragraph beneath
//
// ✅ SAFE — Edit the text by changing the props passed to <SectionHeader>
//    in each page component, not here.
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
// ✅ SAFE — Site footer. Contains:
//    - Project name + coral icon
//    - "IB PYP Exhibition · SDG 14 · [year]" — year is auto-generated
//    - Navigation links (from PAGES array)
//    - Team names (hardcoded string at the bottom)
//
// ✅ SAFE — Update the team credits string (last line inside the footer div).
// ✅ SAFE — The year is live: new Date().getFullYear() — no need to update it.
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
// ❌ DANGER — Root component. Manages all navigation and global state.
//    Do not move or rename this function — it is the default export that
//    src/main.jsx imports and mounts into the page.
//
//    page          = which page is currently shown (default: "Home")
//    key           = increments on every navigation to force a full re-mount
//                    of the page component, re-triggering its enter animation
//    reducedMotion = when true, adds "reduced-motion" class to the root div,
//                    which the CSS uses to disable all animations (see CSS above)
//
//    navigate(p)   = the function passed as onNav to Navbar, Footer, and pages.
//                    Always use this to change pages — never setPage() directly —
//                    because navigate also scrolls to the top and bumps key.
//
// ⚠️  CAREFUL — The switch(page) cases must exactly match the strings in PAGES[].
//    If you add a new page, add both a case here AND an entry in PAGES above.
//
// ✅ SAFE — The wrapper <div> background is "transparent" so the animated body
//    gradient shows through. Don't change it back to a solid colour.
// ─── PIN SCREEN ───────────────────────────────────────────────────────────────
// ௹ is mapped to "x" internally so string comparison works reliably across encodings
const KEY_MAP   = { "௹": "x" };
const CORRECT_PIN = "x0809";

// 8-pointed pinwheel star clip-path (outer points offset inward asymmetrically)
const STAR = "polygon(50% 4%, 60% 35%, 82% 18%, 68% 46%, 96% 50%, 65% 60%, 83% 82%, 54% 68%, 50% 96%, 40% 65%, 17% 83%, 32% 54%, 4% 50%, 35% 40%, 18% 18%, 46% 32%)";

// Scatter 12 keys across the screen with collision avoidance.
// Works in % coordinates; uses an assumed 390×844 viewport for px-distance math.
// Unsafe zones match the actual header elements: logo, title text, subtitle, and dots row.
function generateStarPositions() {
  // "←" is the delete key — plain arrow renders as text, not as an iOS key-cap glyph
  const keys = ["1","2","3","4","5","6","7","8","9","0","←","௹"];
  const VW = 390, VH = 844;            // reference viewport for distance calc
  const MIN_SIZE = 68, MAX_SIZE = 108; // px
  const PAD = 18;                      // extra gap between stars

  // Unsafe rectangles [x1%, y1%, x2%, y2%] for logo, title, subtitle, dots.
  // Stars avoid landing with their centre inside these zones (expanded by half star size).
  const UNSAFE = [
    [32, 7,  68, 21],   // coral logo (centred, small)
    [5,  21, 95, 31],   // "WAVES WITHOUT WASTE" title
    [22, 31, 78, 38],   // "Enter PIN to continue" subtitle
    [20, 38, 80, 48],   // 5 PIN dots row
  ];

  const placed = [];

  for (const key of keys) {
    const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    // Keep star fully inside viewport edges
    const halfWp = (size / VW) * 50;
    const halfHp = (size / VH) * 50;
    const xMin = halfWp + 2, xMax = 100 - halfWp - 2;
    const yMin = halfHp + 2,  yMax = 100 - halfHp - 2;

    let best = { x: xMin + Math.random() * (xMax - xMin), y: yMin + Math.random() * (yMax - yMin) };
    let bestScore = -Infinity;

    for (let t = 0; t < 120; t++) {
      const x = xMin + Math.random() * (xMax - xMin);
      const y = yMin + Math.random() * (yMax - yMin);

      // Reject if star centre (plus half-size buffer) lands inside any unsafe zone
      const blocked = UNSAFE.some(([x1, y1, x2, y2]) =>
        x > x1 - halfWp && x < x2 + halfWp &&
        y > y1 - halfHp && y < y2 + halfHp
      );
      if (blocked) continue;

      // Score = minimum clearance to all already-placed stars
      let minClear = Infinity;
      for (const p of placed) {
        const dx = (x - p.x) / 100 * VW;
        const dy = (y - p.y) / 100 * VH;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const needed = (size + p.size) / 2 + PAD;
        minClear = Math.min(minClear, dist - needed);
      }
      if (placed.length === 0) minClear = 999;

      if (minClear > 0) { best = { x, y }; break; }   // no overlap — use it
      if (minClear > bestScore) { bestScore = minClear; best = { x, y }; }
    }

    placed.push({ key, x: best.x, y: best.y, size });
  }

  return placed;
}

function PinScreen({ onUnlock }) {
  const [input, setInput]     = useState("");
  const [shake, setShake]     = useState(false);
  const [botMsg, setBotMsg]   = useState("");
  // Track when the PIN screen first appeared (or reset after bot rejection)
  const startTimeRef = useRef(Date.now());

  // Stable random positions — generated once per mount, never on re-render
  const starsRef = useRef(null);
  if (!starsRef.current) starsRef.current = generateStarPositions();

  const press = (d) => {
    if (input.length >= 5) return;
    // Map display characters to their internal PIN values (handles ௹ → "x")
    const val  = KEY_MAP[d] ?? d;
    const next = input + val;
    setInput(next);
    if (next.length === 5) {
      if (next === CORRECT_PIN) {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed < 7_000) {
          // ⚠️ Bot protection — correct PIN entered in under 5 seconds
          setBotMsg("Too fast — please look carefully and try again.");
          setShake(true);
          setTimeout(() => {
            setInput("");
            setShake(false);
            setBotMsg("");
            startTimeRef.current = Date.now(); // restart the 5-second window
          }, 1800);
        } else {
          setTimeout(() => onUnlock(), 300);
        }
      } else {
        setShake(true);
        setTimeout(() => { setInput(""); setShake(false); }, 700);
      }
    }
  };
  const del = () => setInput(i => i.slice(0, -1));

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden", background: "#060e1a" }}>
      <style>{`
        @keyframes pinShake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-12px); }
          40% { transform: translateX(12px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        @keyframes rgbCycle {
          0%   { filter: hue-rotate(0deg)   brightness(1.1); }
          100% { filter: hue-rotate(360deg) brightness(1.1); }
        }
        @keyframes starPulse {
          0%,100% { transform: scale(0.82); }
          50%      { transform: scale(0.79); }
        }
        .pin-shake   { animation: pinShake 0.55s ease; }
        .rgb-star    { animation: rgbCycle 3s linear infinite; }
        .star-center { animation: starPulse 2s ease-in-out infinite; transform-origin: center; }
        .star-wrap:active .star-center { transform: scale(0.72) !important; animation: none; }
      `}</style>

      {/* ── Scattered star buttons ────────────────────────────────────────────── */}
      {starsRef.current.map(({ key, x, y, size }, idx) => {
        const isDel = key === "←";
        const delay = `${-idx * 0.27}s`;
        const glowSize = size * 3.2;
        return (
          <div
            key={key}
            className="star-wrap"
            onClick={() => isDel ? del() : press(key)}
            style={{
              position: "absolute",
              left: `${x}%`, top: `${y}%`,
              transform: "translate(-50%, -50%)",
              width: size, height: size,
              cursor: "pointer", userSelect: "none", zIndex: 5,
            }}
          >
            {isDel ? (
              /* Delete key — RGB-lit ⌫ glyph, no star shape */
              <>
                {/* Glow pool behind the delete key */}
                <div className="rgb-star" style={{
                  position: "absolute",
                  width: glowSize, height: glowSize,
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,60,200,0.38) 0%, rgba(80,0,255,0.18) 35%, transparent 70%)",
                  animationDelay: delay,
                  pointerEvents: "none",
                  zIndex: -1,
                }} />
                {/* ⌫ glyph itself filled with cycling rainbow — the "RGB delete strip" */}
                <div className="rgb-star" style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: size * 0.78,
                  lineHeight: 1,
                  background: "conic-gradient(#ff0000, #ff7700, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animationDelay: delay,
                  pointerEvents: "none",
                  userSelect: "none",
                }}>⌫</div>
              </>
            ) : (
              <>
                {/* Light pool spreading out from the star onto the dark screen */}
                <div className="rgb-star" style={{
                  position: "absolute",
                  width: glowSize, height: glowSize,
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,60,200,0.38) 0%, rgba(80,0,255,0.18) 35%, transparent 70%)",
                  animationDelay: delay,
                  pointerEvents: "none",
                  zIndex: -1,
                }} />
                {/* RGB conic ring — clipped to pinwheel star shape */}
                <div className="rgb-star" style={{
                  position: "absolute", inset: 0,
                  clipPath: STAR,
                  background: "conic-gradient(#ff0000, #ff7700, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                  animationDelay: delay,
                }} />
                {/* Dark centre — scaled down so only the star edge glows */}
                <div className="star-center" style={{
                  position: "absolute", inset: 0,
                  clipPath: STAR,
                  background: "radial-gradient(circle at 40% 35%, #0d1f3a, #060e1a)",
                  transformOrigin: "center",
                }} />
                {/* Number / special character label — scales with star size */}
                <div style={{
                  position: "absolute", inset: 0, zIndex: 2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#d4e5f7",
                  fontSize: size * 0.29,
                  fontFamily: "Georgia, serif", fontWeight: "bold",
                  textShadow: "0 0 10px rgba(90,196,224,0.6)",
                  pointerEvents: "none",
                }}>{key}</div>
              </>
            )}
          </div>
        );
      })}

{/* ── Header panel (sits above stars, pointer-events off so stars behind it stay tappable) ── */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: "10vh", pointerEvents: "none",
      }}>
        <img src="/coral.png" alt="" style={{ width: 56, marginBottom: 16, opacity: 0.9 }} />
        <p style={{ fontFamily: "Cinzel, Georgia, serif", fontSize: 17, color: "#7fcdee", letterSpacing: 3, marginBottom: 6 }}>WAVES WITHOUT WASTE</p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#3a5a7a", letterSpacing: 1, marginBottom: 36 }}>Enter PIN to continue</p>

        {/* PIN dots */}
        <div className={shake ? "pin-shake" : ""} style={{ display: "flex", gap: 18 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: "50%",
              border: `2px solid ${shake ? "#ff4444" : "#3a8aaa"}`,
              background: i < input.length ? (shake ? "#ff4444" : "#5ac4e0") : "transparent",
              transition: "background 0.15s, border-color 0.15s",
              boxShadow: i < input.length ? `0 0 8px ${shake ? "#ff4444" : "#5ac4e0"}` : "none",
            }} />
          ))}
        </div>

        {/* Bot-protection warning */}
        {botMsg && (
          <p style={{
            marginTop: 14,
            fontFamily: "Georgia, serif", fontSize: 12,
            color: "#ff6644", letterSpacing: 0.5,
            textShadow: "0 0 8px rgba(255,100,68,0.5)",
          }}>{botMsg}</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("Home");
  const [key, setKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("wwwUnlocked") === "1");

  const unlock = () => { sessionStorage.setItem("wwwUnlocked", "1"); setUnlocked(true); };

  // ❌ DANGER — navigate() is memoised with useCallback so it doesn't re-create
  //    on every render. Don't inline this into JSX props.
  const navigate = useCallback((p) => {
    setPage(p);
    setKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ⚠️  CAREFUL — Add a new page here AND in the PAGES array above.
  const renderPage = () => {
    switch(page) {
      case "Home":             return <HomePage onNav={navigate} />;
      case "About SDG14":     return <AboutPage />;
      case "Data & Evidence": return <DataPage />;
      case "Solutions":       return <SolutionsPage />;
      default:                return <HomePage onNav={navigate} />;
    }
  };

  if (!unlocked) return <PinScreen onUnlock={unlock} />;

  return (
    <>
      {/* ✅ SAFE — Injects the entire `css` string as a <style> tag in the <head>.
          This is how all the class names (.glass-panel etc.) become available. */}
      <style>{css}</style>

      {/* ⚠️  CAREFUL — Root wrapper div.
          background: transparent lets the animated body gradient show through.
          reducedMotion adds "reduced-motion" class which kills all CSS animations.
          Don't change position: relative — it's the positioning context for
          absolute children like CausticLight. */}
      <div className={reducedMotion ? "reduced-motion" : ""} style={{ minHeight: "100vh", background: "transparent", position: "relative" }}>

        {/* ✅ SAFE — Navbar stays fixed at the top across all pages */}
        <Navbar current={page} onNav={navigate} reducedMotion={reducedMotion} onToggleMotion={() => setReducedMotion(m => !m)} />

        {/* ✅ SAFE — key={key} forces a full re-mount on navigation, which
            re-triggers the .page-enter entrance animation on every page change */}
        <main key={key}>
          {renderPage()}
        </main>

        {/* ✅ SAFE — Footer rendered below all page content */}
        <Footer onNav={navigate} />
      </div>
    </>
  );
}
