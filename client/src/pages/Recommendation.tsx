
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { PerfumeRecommendation } from "@/lib/types";
import { useChatContext } from "@/context/ChatContext";
import TextToSpeechControls from "@/components/TextToSpeechControls";
import { Store, ArrowLeft, Sparkles, Droplets, Clock, Heart, ChevronRight, ChevronLeft } from "lucide-react";
import logoImg from "@/assets/aromasens-logo.png";
import { useAISettings } from "@/context/AISettingsContext";
import { getMessages } from "@/lib/aiService";
import VirtualAssistant from "@/components/VirtualAssistant";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";

export default function Recommendation() {
  const [, setLocation] = useLocation();
  const location = useLocation();
  const { state: chatState } = useChatContext();
  const { settings, ttsSettings, speakText } = useAISettings();
  const messages = getMessages(settings.language);
  const [recommendation, setRecommendation] = useState<PerfumeRecommendation | null>(null);
  const [showMainImage, setShowMainImage] = useState(true);

  // Carrusel de productos adicionales
  const additionalProducts = [
    {
      id: "essence-royal",
      name: "Essence Royal",
      brand: "AROMASENS",
      imageUrl: "https://i.ibb.co/NYDvMqZ/file-0000000003c461f8951efb39076dbc3e.png",
      description: "Una sofisticada composición que fusiona elegancia y modernidad con notas de bergamota italiana.",
      notes: ["Bergamota italiana", "Jazmín", "Ámbar"],
      occasions: "Eventos formales, cenas elegantes"
    },
    {
      id: "amber-elixir",
      name: "Amber Elixir",
      brand: "AROMASENS",
      imageUrl: "https://i.ibb.co/vvB20P3/file-0000000026546230aa854a8e50a62cbb.png",
      description: "Una fragancia cálida y envolvente con toques orientales y una base de ámbar y vainilla.",
      notes: ["Ámbar", "Vainilla", "Rosa"],
      occasions: "Noches románticas, eventos sociales"
    },
    {
      id: "aqua-vitale",
      name: "Aqua Vitale",
      brand: "AROMASENS",
      imageUrl: "https://i.ibb.co/vQgvJZV/file-000000006a9061fd892e020436c2b59a.png",
      description: "Frescura marina con un toque cítrico que evoca las brisas mediterráneas y sensación de libertad.",
      notes: ["Limón de Amalfi", "Menta", "Algas marinas"],
      occasions: "Uso diario, actividades al aire libre"
    },
    // Espacio para más productos
    {
      id: "midnight-orchid",
      name: "Midnight Orchid",
      brand: "AROMASENS",
      imageUrl: "https://images.unsplash.com/photo-1605804931335-34ac138adfe9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      description: "Una fragancia misteriosa y seductora con notas de orquídea negra y vainilla bourbon.",
      notes: ["Orquídea negra", "Vainilla bourbon", "Sándalo"],
      occasions: "Ocasiones nocturnas, eventos especiales"
    },
    {
      id: "citrus-bloom",
      name: "Citrus Bloom",
      brand: "AROMASENS",
      imageUrl: "https://images.unsplash.com/photo-1605126300886-3300a57a69e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
      description: "Un aroma fresco y revitalizante con cítricos mediterráneos y flores blancas.",
      notes: ["Naranja", "Mandarina", "Neroli"],
      occasions: "Uso diario, primavera, verano"
    }
  ];

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

  // Si no hay recomendación, mostrar carga
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
    <div className="flex-grow animated-bg min-h-screen pt-20 pb-20">
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
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="logo-container w-16 h-16 overflow-hidden animate-float">
              <img 
                src={logoImg} 
                alt="AROMASENS Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl text-gradient font-bold mb-2"
          >
            TU PERFUME IDEAL
          </motion.h2>

          {/* Mensaje de notificación si viene desde webhook */}
          {location.state?.dataSent && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center space-y-3 mb-4"
            >
              <div className="glass-effect py-2 px-4 rounded-full inline-flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="text-foreground text-sm">
                  Información enviada correctamente. Gracias por tu participación.
                </p>
              </div>
              <button 
                className="btn-animated py-2 px-6 glass-effect border border-accent/20 text-accent rounded-full transition-all duration-300 flex items-center justify-center hover:bg-accent/10"
                onClick={() => window.location.href = "#recommended-products"}
              >
                <span>Ver más recomendaciones</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4"
          >
            <div className="glass-effect py-2 px-4 rounded-full inline-flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="text-foreground text-sm">
                Recomendación Personalizada
              </p>
            </div>

            {/* Controles de síntesis de voz */}
            <TextToSpeechControls gender={chatState.selectedGender} />
          </motion.div>
        </div>

        {/* Main Recommendation Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="futuristic-card fancy-border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Perfume Image Section */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 animate-gradient-bg"></div>
                <div className="h-full flex items-center justify-center p-8 md:p-12 relative z-10">
                  {showMainImage ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative p-2 rounded-xl bg-gradient-to-tr from-primary/30 to-accent/30 hover-glow transition-all duration-500 backdrop-blur-sm"
                      onClick={() => setShowMainImage(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 animate-pulse-subtle opacity-50 rounded-xl"></div>
                      <img 
                        src={recommendation.imageUrl} 
                        alt={recommendation.name} 
                        className="w-full h-auto rounded-lg z-10 relative hover:scale-105 transition-transform duration-500 cursor-pointer"
                      />
                      <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-card flex items-center justify-center border border-accent/50 backdrop-blur-md shadow-lg animate-float" style={{ animationDelay: '0.3s' }}>
                        <Heart className="w-6 h-6 text-accent" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ duration: 0.5 }}
                      className="p-2 rounded-xl bg-gradient-to-tr from-primary/30 to-accent/30 hover-glow transition-all duration-500 backdrop-blur-sm h-full w-full flex items-center justify-center"
                      onClick={() => setShowMainImage(true)}
                    >
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 animate-pulse-subtle opacity-50 rounded-xl"></div>
                        <div className="z-10 relative rounded-lg h-full flex items-center justify-center p-4">
                          <div className="glass-effect p-6 rounded-xl text-center">
                            <h3 className="font-serif text-2xl text-accent mb-4">Información del producto</h3>
                            <p className="text-sm mb-3"><span className="font-bold">Tipo:</span> Eau de Parfum</p>
                            <p className="text-sm mb-3"><span className="font-bold">Duración:</span> 8-10 horas</p>
                            <p className="text-sm mb-3"><span className="font-bold">Intensidad:</span> Media-Alta</p>
                            <p className="text-sm mb-3"><span className="font-bold">Familia olfativa:</span> {recommendation.notes?.[0]}</p>
                            <button className="mt-2 text-xs text-accent hover:underline">
                              Volver a la imagen
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Perfume Details Section */}
              <div className="p-8 md:p-12 flex flex-col h-full">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center mb-4"
                >
                  <div className="glass-effect py-1 px-4 rounded-full text-xs uppercase tracking-wider text-accent font-medium border border-accent/20">
                    {recommendation.brand}
                  </div>
                </motion.div>

                <motion.h2 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="font-serif text-3xl md:text-4xl font-bold text-gradient mb-4 leading-tight"
                >
                  {recommendation.name}
                </motion.h2>

                <motion.p 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-foreground leading-relaxed mb-6 flex-grow"
                >
                  {recommendation.description}
                </motion.p>

                {/* Perfume Notes */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="mb-6"
                >
                  <div className="flex items-center mb-3">
                    <Droplets className="w-4 h-4 text-accent mr-2" />
                    <h3 className="font-serif text-xl text-primary">Notas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.notes?.map((note, index) => (
                      <motion.span 
                        key={index} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                        className="px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm border border-accent/20 hover-glow transition-all duration-300" 
                      >
                        {note}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Occasions */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="mb-8"
                >
                  <div className="flex items-center mb-3">
                    <Clock className="w-4 h-4 text-accent mr-2" />
                    <h3 className="font-serif text-xl text-primary">Ideal para</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {recommendation.occasions}
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
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
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Carrusel de Recomendaciones */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-5xl mx-auto mt-20"
          id="recommended-products"
        >
          <div className="mb-10 text-center">
            <h3 className="font-serif text-3xl text-gradient mb-2">Descubre Más Fragancias</h3>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Explora nuestra colección exclusiva de perfumes diseñados para despertar emociones y crear recuerdos inolvidables.
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {additionalProducts.map((product, index) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="h-full"
                  >
                    <div className="futuristic-card h-full overflow-hidden hover:shadow-accent/20 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
                      <div className="relative h-64 overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transform hover:scale-110 transition-transform duration-700"
                          style={{backgroundImage: `url('${product.imageUrl}')`}}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>

                        <div className="absolute top-4 left-4 glass-effect py-1 px-3 rounded-full text-xs uppercase tracking-wider text-accent font-medium border border-accent/20">
                          {product.brand}
                        </div>
                      </div>

                      <div className="p-6">
                        <h4 className="font-serif text-xl font-bold mb-2">{product.name}</h4>
                        <p className="text-foreground text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1">
                            <Droplets className="w-3 h-3 text-accent" />
                            <span className="text-xs text-foreground/70">{product.notes.slice(0, 2).join(", ")}</span>
                          </div>
                          <div className="text-accent">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center mt-4">
              <CarouselPrevious className="relative inset-0 mx-1 translate-y-0 bg-card/80 hover:bg-accent/20 border-accent/20" />
              <CarouselNext className="relative inset-0 mx-1 translate-y-0 bg-card/80 hover:bg-accent/20 border-accent/20" />
            </div>
          </Carousel>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto mt-20 mb-10 text-center"
        >
          <div className="glass-effect rounded-2xl p-8 backdrop-blur-md fancy-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-accent/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-3xl"></div>
            
            <h3 className="font-serif text-3xl text-gradient mb-4">Experiencia Olfativa Personalizada</h3>
            <p className="text-foreground mb-6 max-w-xl mx-auto">
              Descubre el poder de las fragancias para expresar tu personalidad única. Nuestros expertos perfumistas han creado cada aroma con atención meticulosa a los detalles.
            </p>
            <Link href="/chat">
              <button className="btn-animated py-3 px-8 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg hover:shadow-accent/20 transition-all duration-300 inline-flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2" />
                <span>Encuentra tu fragancia ideal</span>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Virtual Assistant Component */}
      <VirtualAssistant />
    </div>
  );
}
