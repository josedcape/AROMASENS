import { useEffect } from "react";
import { useLocation } from "wouter";
import ChatInterface from "@/components/ChatInterface";
import { useChatContext } from "@/context/ChatContext";
import BotidinamixLogo from "@/components/BotidinamixLogo";

export default function Chat() {
  const [, setLocation] = useLocation();
  const { state } = useChatContext();

  // Redirect to home if no gender is selected
  useEffect(() => {
    if (!state.selectedGender) {
      setLocation("/");
    }
  }, [state.selectedGender, setLocation]);

  return (
    <div className="flex-grow animated-bg min-h-screen pt-16 pb-6 overflow-x-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
        {/* Efectos de luz y ambiente */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-accent/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-3xl"></div>

        {/* Partículas o elementos decorativos */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-accent/40 rounded-full animate-pulse-subtle"></div>
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-primary/30 rounded-full animate-pulse-subtle" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-accent/40 rounded-full animate-pulse-subtle" style={{ animationDelay: '0.7s' }}></div>

        {/* Líneas decorativas */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10">
        <ChatInterface />
      </div>
      <BotidinamixLogo position="bottom-left" size="medium" />
    </div>
  );
}