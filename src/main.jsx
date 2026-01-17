import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";

import "./styles/tokens.css";
import "./styles/theme-contract.css";

// Load all theme CSS files automatically (bundled)
import.meta.glob("./styles/themes/theme-*.css", { eager: true });

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/widget.css";
import "./styles/inspector.css";

import App from "./App.jsx";
import { applyTheme, getInitialTheme } from "./theme.js";

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App initialTheme={initialTheme} />
  </React.StrictMode>,
);
