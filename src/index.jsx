import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import { register as registerSW, showInstallPrompt } from './registerSW';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);

// Register service worker for PWA functionality
registerSW({
  onSuccess: () => {
    console.log('Portal UNK está pronto para uso offline!');
  },
  onUpdate: () => {
    console.log('Nova versão disponível. Recarregue a página.');
  }
});

// Show install prompt for PWA
showInstallPrompt();
