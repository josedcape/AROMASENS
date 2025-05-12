
import { useState, useEffect, useRef } from "react";
import { useAISettings } from "@/context/AISettingsContext";
import { Bot, X, Volume2 } from "lucide-react";

interface PerfumeInfo {
  id: string;
  name: string;
  brand: string;
  description: string;
  notes: string[];
  occasions: string;
}

// Datos de muestra para los perfumes
const perfumesData: PerfumeInfo[] = [
  {
    id: "essence-royal",
    name: "Essence Royal",
    brand: "AROMASENS",
    description: "Una sofisticada composición que fusiona elegancia y modernidad. Contiene notas de bergamota italiana, jazmín y ámbar, creando una experiencia olfativa única y memorable.",
    notes: ["Bergamota italiana", "Jazmín", "Ámbar", "Madera de cedro"],
    occasions: "Eventos formales, cenas elegantes y ocasiones especiales"
  },
  {
    id: "amber-elixir",
    name: "Amber Elixir",
    brand: "AROMASENS",
    description: "Una fragancia cálida y envolvente con toques orientales. Su base de ámbar y vainilla se combina con notas florales para una experiencia sensorial profunda y duradera.",
    notes: ["Ámbar", "Vainilla", "Rosa", "Pachulí"],
    occasions: "Noches románticas, eventos sociales y uso diario sofisticado"
  },
  {
    id: "aqua-vitale",
    name: "Aqua Vitale",
    brand: "AROMASENS",
    description: "Frescura marina con un toque cítrico que evoca las brisas mediterráneas. Ideal para quienes buscan una fragancia revitalizante y energizante con personalidad única.",
    notes: ["Limón de Amalfi", "Menta", "Algas marinas", "Musgo blanco"],
    occasions: "Uso diario, actividades al aire libre y ambientes profesionales"
  }
];

const greetings = [
  "¡Bienvenido a AROMASENS! Soy tu asesor personal de fragancias.",
  "Saludos, estoy aquí para ayudarte a descubrir el perfume perfecto para ti.",
  "Hola, soy el experto en fragancias de AROMASENS. ¿Quieres conocer nuestros productos exclusivos?"
];

export default function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentPerfume, setCurrentPerfume] = useState<PerfumeInfo | null>(null);
  const [showPerfumeInfo, setShowPerfumeInfo] = useState(false);
  const assistantRef = useRef<HTMLDivElement>(null);
  const { ttsSettings, speakText } = useAISettings();

  // Mostrar el asistente automáticamente al cargar el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      setCurrentMessage(greeting);
      
      if (ttsSettings.enabled) {
        setIsSpeaking(true);
        speakText(greeting);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [speakText, ttsSettings.enabled]);

  // Efecto para animar la aparición de los mensajes
  useEffect(() => {
    if (assistantRef.current && isOpen) {
      assistantRef.current.classList.add("animate-bounce-in");
      
      const timer = setTimeout(() => {
        if (assistantRef.current) {
          assistantRef.current.classList.remove("animate-bounce-in");
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentMessage]);

  const handlePerfumeSelect = (perfume: PerfumeInfo) => {
    setCurrentPerfume(perfume);
    setShowPerfumeInfo(true);
    const message = `Has seleccionado ${perfume.name}. ${perfume.description}`;
    setCurrentMessage(message);
    
    if (ttsSettings.enabled) {
      setIsSpeaking(true);
      speakText(message);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSpeakDescription = () => {
    if (currentPerfume && !isSpeaking) {
      setIsSpeaking(true);
      speakText(currentPerfume.description);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={assistantRef}
      className="fixed bottom-8 right-8 z-50 max-w-sm transition-all duration-300 ease-in-out"
    >
      <div className="glass-effect fancy-border relative overflow-hidden p-4 backdrop-blur-lg shadow-xl">
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
        >
          <X className="w-4 h-4 text-accent" />
        </button>
        
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-6 h-6 text-white animate-pulse-subtle" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-accent mb-1">Asistente AROMASENS</h3>
            <p className="text-sm text-foreground">{currentMessage}</p>
            
            {!showPerfumeInfo && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                <p className="text-xs italic text-foreground/70">Te recomiendo estos perfumes exclusivos:</p>
                {perfumesData.map(perfume => (
                  <button
                    key={perfume.id}
                    onClick={() => handlePerfumeSelect(perfume)}
                    className="text-left text-sm p-2 rounded-md border border-accent/20 bg-card/50 hover:bg-accent/10 transition-colors"
                  >
                    <span className="font-medium text-accent">{perfume.name}</span>
                    <span className="text-xs block text-foreground/70">{perfume.notes.slice(0, 2).join(", ")}</span>
                  </button>
                ))}
              </div>
            )}
            
            {showPerfumeInfo && currentPerfume && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-accent">{currentPerfume.name}</h4>
                  <button 
                    onClick={handleSpeakDescription}
                    className="p-1 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors"
                    title="Escuchar descripción"
                  >
                    <Volume2 className="w-4 h-4 text-accent" />
                  </button>
                </div>
                
                <p className="text-xs"><span className="font-medium">Notas:</span> {currentPerfume.notes.join(", ")}</p>
                <p className="text-xs"><span className="font-medium">Ideal para:</span> {currentPerfume.occasions}</p>
                
                <div className="pt-2">
                  <button 
                    onClick={() => setShowPerfumeInfo(false)}
                    className="text-xs text-accent hover:underline"
                  >
                    ← Ver otros perfumes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
