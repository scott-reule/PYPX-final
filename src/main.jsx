// ❌ DANGER — Entry point. This file bootstraps React into the page.
//    You should almost never need to edit this file.
//
//    createRoot() attaches React to the <div id="root"> in index.html.
//    StrictMode wraps the app in development-only checks (double-renders
//    components to catch side-effect bugs). It has no effect in production.
//    App is the root component — everything in reef-watch.jsx.
//
//    React must be imported here because Vite compiles JSX to
//    React.createElement() calls (classic JSX transform).

// ❌ DANGER — React is required for JSX compilation. Do not remove.
import React, { StrictMode } from "react";

// ❌ DANGER — createRoot is the React 18 render API. Do not change.
import { createRoot } from "react-dom/client";

// ⚠️  CAREFUL — Path is relative to this file (src/main.jsx → ../reef-watch.jsx).
//    If you move reef-watch.jsx, update this path.
import App from "../reef-watch.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
