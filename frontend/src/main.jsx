/**
 * main.jsx
 * --------
 * React entry point.
 * Renders the App component into the DOM.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Import global styles (dark theme, animations, AntD overrides)
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
