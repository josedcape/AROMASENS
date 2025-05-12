
import GenderSelection from "@/components/GenderSelection";

export default function Home() {
  return (
    <div className="flex-grow animated-bg min-h-screen">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Círculos decorativos animados */}
        <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-accent/5 animate-float"></div>
        <div className="absolute top-1/2 right-10 w-48 h-48 rounded-full bg-primary/5 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-secondary/5 animate-float" style={{ animationDelay: '1s' }}></div>
        
        {/* Líneas decorativas */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        <GenderSelection />
      </div>
    </div>
  );
}
