
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { PerfumeRecommendation } from "@/lib/types";
import { useChatContext } from "@/context/ChatContext";
import TextToSpeechControls from "@/components/TextToSpeechControls";
import { Store, ArrowLeft, Sparkles, Droplets, Clock, Heart } from "lucide-react";
import logoImg from "@/assets/aromasens-logo.png";
import { useAISettings } from "@/context/AISettingsContext";
import { getMessages } from "@/lib/aiService";

export default function Recommendation() {
  const [, setLocation] = useLocation();
  const location = useLocation();
  const { state: chatState } = useChatContext();
  const { settings, ttsSettings, speakText } = useAISettings();
  const messages = getMessages(settings.language);
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

    // Leer la recomendación al cargar la página
    useEffect(() => {
      if (ttsSettings.enabled && recommendation) {
        // Extraer solo el texto importante para la voz
        const description = recommendation.description || '';

        // Combinar y limpiar el texto para la síntesis de voz
        const textToRead = description.replace(/\*/g, '');

        // Pequeño retraso para asegurar que la página se ha cargado
        setTimeout(() => {
          speakText(textToRead);
        }, 500);
      }
    }, [recommendation, ttsSettings.enabled, speakText]);

  // If no recommendation, show loading
  if (!recommendation) {
    return (
      <div className="flex-grow animated-bg min-h-screen pt-20 pb-10 flex items-center justify-center">
        <div className="text-center glass-effect p-10 rounded-xl backdrop-blur-md">
          <div className="logo-container w-20 h-20 mx-auto mb-6 overflow-hidden animate-pulse-subtle">
            <img 
              src={logoImg} 
              alt="AROMASENS Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-2xl font-serif text-foreground mb-4">Analizando tu perfil sensorial</p>
          <div className="flex justify-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow animated-bg min-h-screen pt-20 pb-10">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-70">
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

      <div className="container mx-auto px-4 h-full relative z-10">
        {/* Header Section */}

        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="logo-container w-16 h-16 overflow-hidden animate-float">
              <img 
                src={logoImg} 
                alt="AROMASENS Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl text-gradient font-bold mb-2">
            TU PERFUME IDEAL
          </h2>
          
          {/* Mensaje de notificación si viene desde webhook */}
          {location.state?.dataSent && (
            <div className="glass-effect py-2 px-4 rounded-full inline-flex items-center space-x-2 mb-4">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-foreground text-sm">
                Información enviada correctamente. Gracias por tu participación.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <div className="glass-effect py-2 px-4 rounded-full inline-flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="text-foreground text-sm">
                Recomendación Personalizada
              </p>
            </div>

            {/* Controles de síntesis de voz */}
            <TextToSpeechControls gender={chatState.selectedGender} />
          </div>
        </div>

        {/* Main Recommendation Card */}
        <div className="max-w-5xl mx-auto">
          <div className="futuristic-card fancy-border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Perfume Image Section */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 animate-gradient-bg"></div>
                <div className="h-full flex items-center justify-center p-8 md:p-12 relative z-10">
                  <div className="relative p-2 rounded-xl bg-gradient-to-tr from-primary/30 to-accent/30 hover-glow transition-all duration-500 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 animate-pulse-subtle opacity-50 rounded-xl"></div>
                    <img 
                      src={recommendation.imageUrl} 
                      alt={recommendation.name} 
                      className="w-full h-auto rounded-lg z-10 relative"
                    />
                    <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-card flex items-center justify-center border border-accent/50 backdrop-blur-md shadow-lg animate-float" style={{ animationDelay: '0.3s' }}>
                      <Heart className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Perfume Details Section */}
              <div className="p-8 md:p-12 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="glass-effect py-1 px-4 rounded-full text-xs uppercase tracking-wider text-accent font-medium border border-accent/20">
                    {recommendation.brand}
                  </div>
                </div>

                <h2 className="font-serif text-3xl md:text-4xl font-bold text-gradient mb-4 leading-tight">
                  {recommendation.name}
                </h2>

                <p className="text-foreground leading-relaxed mb-6 flex-grow">
                  {recommendation.description}
                </p>

                {/* Perfume Notes */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <Droplets className="w-4 h-4 text-accent mr-2" />
                    <h3 className="font-serif text-xl text-primary">Notas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.notes?.map((note, index) => (
                      <span 
                        key={index} 
                        className="px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm border border-accent/20 hover-glow transition-all duration-300" 
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Occasions */}
                <div className="mb-8">
                  <div className="flex items-center mb-3">
                    <Clock className="w-4 h-4 text-accent mr-2" />
                    <h3 className="font-serif text-xl text-primary">Ideal para</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {recommendation.occasions}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="btn-animated py-3 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg hover:shadow-accent/20 transition-all duration-300 flex items-center justify-center">
                    <Store className="w-5 h-5 mr-2" />
                    <span>Ver en tienda</span>
                  </button>

                  <Link href="/">
                    <button className="btn-animated py-3 px-6 glass-effect border border-accent/20 text-accent rounded-full transition-all duration-300 flex items-center justify-center hover:bg-accent/10">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      <span>Volver al inicio</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Recommendations */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl text-primary">También te pueden gustar</h3>
            <div className="h-px bg-accent/30 flex-grow ml-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Additional Perfume 1 */}
            <div className="futuristic-card overflow-hidden hover:shadow-accent/20 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transform hover:scale-110 transition-transform duration-700" 
                  style={{backgroundImage: "url('https://pixabay.com/get/g61d4c27ac8f6d782356cdf37ec0fd86b415b43d3c7d4c86229a92a653550f1b248810cae8ae58bde543c1865bfe0dda6a2713ac8d8736c71d100e9a975510ee0_1280.jpg')"}}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>

                <div className="absolute top-4 left-4 glass-effect py-1 px-3 rounded-full text-xs uppercase tracking-wider text-accent font-medium border border-accent/20">
                  Lumine
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-serif text-xl font-bold mb-2">Velvet Dream</h4>
                <p className="text-foreground text-sm mb-4">Fragancia dulce con notas florales y toques de vainilla para una experiencia suave y memorable.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-3 h-3 text-accent" />
                    <span className="text-xs text-foreground/70">Vainilla, Flores blancas</span>
                  </div>
                  <div className="text-accent">→</div>
                </div>
              </div>
            </div>

            {/* Additional Perfume 2 */}
            <div className="futuristic-card overflow-hidden hover:shadow-accent/20 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transform hover:scale-110 transition-transform duration-700" 
                  style={{backgroundImage: "url('https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400')"}}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>

                <div className="absolute top-4 left-4 glass-effect py-1 px-3 rounded-full text-xs uppercase tracking-wider text-accent font-medium border border-accent/20">
                  Noir Collection
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-serif text-xl font-bold mb-2">Midnight Essence</h4>
                <p className="text-foreground text-sm mb-4">Aroma intenso con notas amaderadas y especiadas para personalidades misteriosas y atrayentes.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-3 h-3 text-accent" />
                    <span className="text-xs text-foreground/70">Cardamomo, Oud, Sándalo</span>
                  </div>
                  <div className="text-accent">→</div>
                </div>
              </div>
            </div>

            {/* Additional Perfume 3 */}
            <div className="futuristic-card overflow-hidden hover:shadow-accent/20 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transform hover:scale-110 transition-transform duration-700" 
                  style={{backgroundImage: "url('https://images.unsplash.com/photo-1617897903246-719242758050?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400')"}}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>

                <div className="absolute top-4 left-4 glass-effect py-1 px-3 rounded-full text-xs uppercase tracking-wider text-accent font-medium border border-accent/20">
                  Floralie
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-serif text-xl font-bold mb-2">Spring Bouquet</h4>
                <p className="text-foreground text-sm mb-4">Fragancia fresca con notas cítricas y florales ligeras para espíritus libres y naturales.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-3 h-3 text-accent" />
                    <span className="text-xs text-foreground/70">Bergamota, Azahar, Lirio</span>
                  </div>
                  <div className="text-accent">→</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
