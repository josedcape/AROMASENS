import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add the Remix Icon library
const remixIconLink = document.createElement("link");
remixIconLink.rel = "stylesheet";
remixIconLink.href = "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css";
document.head.appendChild(remixIconLink);

// Add the fonts
const fontsLink = document.createElement("link");
fontsLink.rel = "stylesheet";
fontsLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;600&display=swap";
document.head.appendChild(fontsLink);

// Add the page title
const titleElement = document.createElement("title");
titleElement.textContent = "AROMASENS - Perfume Boutique";
document.head.appendChild(titleElement);

createRoot(document.getElementById("root")!).render(<App />);
