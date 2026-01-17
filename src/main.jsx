import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/tokens.css";
import "./styles/theme-contract.css";
import "./styles/themes/theme-classic.css";
import "./styles/themes/theme-lux.css";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/widget.css";
import "./styles/inspector.css";
import App from "./App.jsx";

const storedTheme = localStorage.getItem("theme");
const initialTheme = storedTheme === "lux" || storedTheme === "classic" ? storedTheme : "classic";
document.documentElement.dataset.theme = initialTheme;
if (storedTheme !== initialTheme) {
  localStorage.setItem("theme", initialTheme);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App initialTheme={initialTheme} />
  </React.StrictMode>
);
