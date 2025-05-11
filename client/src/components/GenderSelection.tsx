import { useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useChatContext } from "@/context/ChatContext";
import { ArrowRight } from "lucide-react";
import logoImg from "@/assets/aromasens-logo.png";

export default function GenderSelection() {
  const [, setLocation] = useLocation();
  const { dispatch } = useChatContext();
  const femaleCardRef = useRef<HTMLDivElement>(null);
  const maleCardRef = useRef<HTMLDivElement>(null);
  
  // Efecto para animaciones al cargar
  useEffect(() => {
    const femaleCard = femaleCardRef.current;
    const maleCard = maleCardRef.current;
    
    if (femaleCard && maleCard) {
      setTimeout(() => {
        femaleCard.classList.add('translate-x-0', 'opacity-100');
        femaleCard.classList.remove('-translate-x-full', 'opacity-0');
      }, 200);
      
      setTimeout(() => {
        maleCard.classList.add('translate-x-0', 'opacity-100');
        maleCard.classList.remove('translate-x-full', 'opacity-0');
      }, 400);
    }
  }, []);
  
  const handleSelectGender = useCallback((gender: string) => {
    dispatch({ type: "SET_GENDER", payload: gender });
    setLocation("/chat");
  }, [dispatch, setLocation]);
  
  return (
    <div className="container mx-auto px-4 flex flex-col min-h-screen pt-24 md:pt-32">
      {/* Hero Section */}
      <div className="text-center mb-16 md:mb-24">
        <div className="flex justify-center mb-8">
          <div className="logo-container w-32 h-32 overflow-hidden animate-float">
            <img 
              src={logoImg} 
              alt="AROMASENS Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <h2 className="font-serif text-5xl md:text-6xl mb-6 text-gradient font-bold">
          AROMASENS
        </h2>
        
        <h3 className="font-serif text-2xl md:text-3xl mb-6 text-primary animate-pulse-subtle">
          Descubre tu Esencia Personal
        </h3>
        
        <div className="max-w-2xl mx-auto glass-effect p-6 backdrop-blur-sm rounded-xl">
          <p className="font-sans text-lg text-foreground leading-relaxed">
            Nuestro asistente con <span className="text-accent font-medium">inteligencia artificial</span> te ayudará a encontrar 
            el perfume perfecto según tu personalidad, preferencias y estilo de vida.
          </p>
        </div>
      </div>
      
      {/* Gender Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
        {/* Feminine Option */}
        <div 
          ref={femaleCardRef}
          className="futuristic-card fancy-border transition-all duration-700 ease-out -translate-x-full opacity-0 cursor-pointer" 
          onClick={() => handleSelectGender("femenino")}
        >
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              style={{ objectFit: "cover", objectPosition: "center" }}
            >
              <source src="./women.mp4" type="video/mp4" />
              Tu navegador no soporta videos HTML5.
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
          </div>
          
          <div className="p-6 relative z-10">
            <h3 className="font-serif text-3xl mb-4 text-accent">Femenino</h3>
            <p className="text-foreground mb-6">
              Fragancias elegantes y sofisticadas que realzan la feminidad con notas florales, frutales y orientales.
            </p>
            
            <div className="btn-animated flex items-center justify-between mt-4 text-accent group">
              <span className="font-medium">Descubrir</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/10 group-hover:bg-accent/20 transition-all duration-300">
                <ArrowRight className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Masculine Option */}
        <div 
          ref={maleCardRef}
          className="futuristic-card fancy-border transition-all duration-700 ease-out translate-x-full opacity-0 cursor-pointer" 
          onClick={() => handleSelectGender("masculino")}
        >
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
            <div 
              className="absolute inset-0 bg-cover bg-center transform hover:scale-110 transition-transform duration-700" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
          </div>
          
          <div className="p-6 relative z-10">
            <h3 className="font-serif text-3xl mb-4 text-accent">Masculino</h3>
            <p className="text-foreground mb-6">
              Fragancias audaces y distintivas con notas amaderadas, especiadas y cítricas que proyectan carácter.
            </p>
            
            <div className="btn-animated flex items-center justify-between mt-4 text-accent group">
              <span className="font-medium">Descubrir</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/10 group-hover:bg-accent/20 transition-all duration-300">
                <ArrowRight className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quote Section */}
      <div className="mt-16 md:mt-24 text-center mb-10">
        <div className="max-w-xl mx-auto relative py-6 px-4">
          <div className="absolute left-0 top-0 text-6xl text-accent/20">"</div>
          <p className="text-foreground italic text-lg md:text-xl font-serif my-4">
            El perfume es la forma más intensa del recuerdo. Un aroma puede cambiar nuestro estado de ánimo, evocar el pasado o soñar el futuro.
          </p>
          <div className="absolute right-0 bottom-0 text-6xl text-accent/20">"</div>
          <p className="text-accent text-sm mt-4 font-medium tracking-wider">- JEAN-PAUL GUERLAIN</p>
        </div>
      </div>
    </div>
  );
}
