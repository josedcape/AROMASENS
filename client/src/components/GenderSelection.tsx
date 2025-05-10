import { useCallback } from "react";
import { useLocation } from "wouter";
import { useChatContext } from "@/context/ChatContext";

export default function GenderSelection() {
  const [, setLocation] = useLocation();
  const { dispatch } = useChatContext();
  
  const handleSelectGender = useCallback((gender: string) => {
    dispatch({ type: "SET_GENDER", payload: gender });
    setLocation("/chat");
  }, [dispatch, setLocation]);
  
  return (
    <div className="container mx-auto px-4 flex flex-col h-full">
      <div className="text-center mb-12 mt-8 md:mt-16">
        <h2 className="font-display text-4xl md:text-5xl mb-6 text-primary">AROMASENS</h2>
        <h3 className="font-display text-2xl md:text-3xl mb-4 text-secondary">Descubre tu fragancia ideal</h3>
        <p className="text-neutral-dark font-sans text-lg max-w-2xl mx-auto">
          Nuestro asistente te ayudará a encontrar el perfume perfecto según tu personalidad y preferencias.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Feminine Option */}
        <div 
          className="gender-option bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer" 
          onClick={() => handleSelectGender("femenino")}
        >
          <div 
            className="h-64 md:h-80 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595535873420-a599195b3f4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600')" }}
          />
          <div className="p-6 bg-white">
            <h3 className="font-display text-2xl mb-2">Femenino</h3>
            <p className="text-neutral-dark">Fragancias elegantes y sofisticadas para la mujer contemporánea.</p>
            <div className="mt-4 text-secondary flex items-center">
              <span>Descubrir</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </div>
          </div>
        </div>
        
        {/* Masculine Option */}
        <div 
          className="gender-option bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer" 
          onClick={() => handleSelectGender("masculino")}
        >
          <div 
            className="h-64 md:h-80 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://pixabay.com/get/gad708913af2e3c68c9c4f85c89f9b8d2a84f342530ae6041ef06551706387ed74eee86fe1762c195e4948b17f2ed140a6f5a47f6ef3b27477ad4c1ee41fb652b_1280.jpg')" }}
          />
          <div className="p-6 bg-white">
            <h3 className="font-display text-2xl mb-2">Masculino</h3>
            <p className="text-neutral-dark">Fragancias audaces y distintivas para el hombre moderno.</p>
            <div className="mt-4 text-secondary flex items-center">
              <span>Descubrir</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-neutral-dark italic">"El perfume es la forma más intensa del recuerdo."</p>
        <p className="text-accent text-sm mt-1">- Jean-Paul Guerlain</p>
      </div>
    </div>
  );
}
