
import botidinamixLogo from "@/assets/botidinamix-logo.png";

interface BotidinamixLogoProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function BotidinamixLogo({
  position = "bottom-right",
  size = "medium",
  className = "",
}: BotidinamixLogoProps) {
  // Definir clases de posición
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-24 right-4", // Más abajo del header
    "top-left": "top-24 left-4",   // Más abajo del header
  };

  // Definir clases de tamaño
  const sizeClasses = {
    small: "w-12 h-12 md:w-14 md:h-14",
    medium: "w-16 h-16 md:w-20 md:h-20",
    large: "w-20 h-20 md:w-24 md:h-24",
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-[#00a2ff] shadow-lg shadow-[#00a2ff]/20 hover:scale-110 transition-transform duration-300 ${className}`}
      style={{ boxShadow: '0 0 15px 2px rgba(0, 162, 255, 0.4)' }}
    >
      <img 
        src={botidinamixLogo} 
        alt="BOTIDINAMIX Logo" 
        className="w-full h-full object-cover"
      />
      
      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#00a2ff]/10 to-transparent"></div>
    </div>
  );
}
