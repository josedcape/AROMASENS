import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { PerfumeRecommendation } from "@/lib/types";
import { useChatContext } from "@/context/ChatContext";

export default function Recommendation() {
  const [location, setLocation] = useLocation();
  const { state: chatState } = useChatContext();
  const [recommendation, setRecommendation] = useState<PerfumeRecommendation | null>(null);

  // Get recommendation from location state or redirect to home
  useEffect(() => {
    const locationState = window.history.state?.state;
    
    if (locationState?.recommendation) {
      setRecommendation(locationState.recommendation);
    } else if (!chatState.selectedGender) {
      setLocation("/");
    }
  }, [location, chatState.selectedGender, setLocation]);

  // If no recommendation, show loading
  if (!recommendation) {
    return (
      <div className="flex-grow pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl">Cargando recomendación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow pt-20 pb-10">
      <div className="container mx-auto px-4 h-full">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl text-primary">AROMASENS</h2>
          <h3 className="font-display text-2xl md:text-3xl text-secondary mt-2">Tu Perfume Recomendado</h3>
          <p className="text-neutral-dark mt-2">Basado en tus preferencias y personalidad</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-pattern">
              <div className="h-72 md:h-full flex items-center justify-center p-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <img 
                    src={recommendation.imageUrl} 
                    alt={recommendation.name} 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <div className="uppercase tracking-wide text-sm text-secondary font-semibold">
                {recommendation.brand}
              </div>
              <h2 className="font-display text-2xl mt-2 font-bold">
                {recommendation.name}
              </h2>
              <p className="mt-4 text-neutral-dark">
                {recommendation.description}
              </p>
              
              <div className="mt-6">
                <h3 className="font-semibold text-primary">Notas</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recommendation.notes?.map((note, index) => (
                    <span key={index} className="px-3 py-1 bg-neutral-light rounded-full text-sm">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-primary">Ideal para</h3>
                <p className="mt-1 text-neutral-dark">
                  {recommendation.occasions}
                </p>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="bg-primary hover:bg-primary-light text-white py-3 px-6 rounded-lg transition-colors flex-grow flex items-center justify-center">
                  <i className="ri-store-line mr-2"></i> Ver en tienda
                </button>
                <Link href="/chat">
                  <button className="border border-secondary text-secondary hover:bg-secondary hover:text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
                    <i className="ri-chat-1-line mr-2"></i> Volver al chat
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto mt-8">
          <h3 className="font-display text-2xl mb-4">Otras recomendaciones</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Additional Perfume 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-cover bg-center" style={{backgroundImage: "url('https://pixabay.com/get/g61d4c27ac8f6d782356cdf37ec0fd86b415b43d3c7d4c86229a92a653550f1b248810cae8ae58bde543c1865bfe0dda6a2713ac8d8736c71d100e9a975510ee0_1280.jpg')"}}></div>
              <div className="p-4">
                <div className="text-xs text-secondary uppercase tracking-wide font-semibold">Lumine</div>
                <h4 className="font-display font-bold mt-1">Velvet Dream</h4>
                <p className="text-neutral-dark text-sm mt-2">Fragancia dulce con notas florales y toques de vainilla.</p>
              </div>
            </div>
            
            {/* Additional Perfume 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400')"}}></div>
              <div className="p-4">
                <div className="text-xs text-secondary uppercase tracking-wide font-semibold">Noir Collection</div>
                <h4 className="font-display font-bold mt-1">Midnight Essence</h4>
                <p className="text-neutral-dark text-sm mt-2">Aroma intenso con notas amaderadas y especiadas.</p>
              </div>
            </div>
            
            {/* Additional Perfume 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1617897903246-719242758050?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400')"}}></div>
              <div className="p-4">
                <div className="text-xs text-secondary uppercase tracking-wide font-semibold">Floralie</div>
                <h4 className="font-display font-bold mt-1">Spring Bouquet</h4>
                <p className="text-neutral-dark text-sm mt-2">Fragancia fresca con notas cítricas y florales ligeras.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
