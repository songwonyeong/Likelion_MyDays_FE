// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ A안: Tailwind + 전역 베이스는 index.css 하나로 통일
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
