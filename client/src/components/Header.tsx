import { Link } from "wouter";
import { useChatContext } from "@/context/ChatContext";
import { useEffect, useState } from "react";
import logoImg from "@/assets/aromasens-logo.png";
import { ChevronLeft } from "lucide-react";

export default function Header() {
  const { state, dispatch } = useChatContext();
  const [scrolled, setScrolled] = useState(false);
  
  // Efecto para detectar el scroll y cambiar la apariencia del header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  const handleBack = () => {
    if (window.location.pathname === "/chat") {
      window.history.back();
    }
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "py-2 backdrop-blur-md bg-primary/80 shadow-lg" 
          : "py-4 bg-primary"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="flex items-center group">
              <div className="logo-container w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-full hover-glow">
                <img 
                  src={logoImg} 
                  alt="AROMASENS Logo" 
                  className="w-full h-full object-cover animate-pulse-subtle"
                />
              </div>
              <div className="ml-3">
                <h1 className="font-serif text-xl md:text-2xl font-bold tracking-wide text-accent group-hover:text-gradient transition-all duration-300">
                  AROMASENS
                </h1>
                <p className="text-xs text-accent/80 font-sans tracking-widest hidden sm:block">
                  PERFUME EXPERIENCE
                </p>
              </div>
            </div>
          </Link>
        </div>
        
        <nav className="flex items-center">
          {window.location.pathname !== "/" && (
            <button
              onClick={handleBack}
              className="btn-animated p-2 rounded-full hover:bg-accent/10 text-accent hover:text-accent-foreground transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </nav>
      </div>
      
      {/* Decorative line with gradient and animation */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 animate-pulse-subtle"></div>
    </header>
  );
}
