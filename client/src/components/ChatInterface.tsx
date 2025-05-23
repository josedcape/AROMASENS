import { useState, useEffect, useRef, FormEvent } from "react";
import { useLocation } from "wouter";
import { useChatContext } from "@/context/ChatContext";
import { useAISettings } from "@/context/AISettingsContext";
import { ChatStep } from "@/lib/types";
import { startChat, sendMessage, getRecommendation, sleep } from "@/lib/chatHelpers";
import { Send, Bot, User, Sparkles } from "lucide-react";
import logoImg from "@/assets/aromasens-logo.png";
import SpeechRecognitionButton from "@/components/SpeechRecognitionButton";
import TextToSpeechControls from "@/components/TextToSpeechControls";
import { getMessages } from "@/lib/aiService";

export default function ChatInterface() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useChatContext();
  const { settings, setLanguage, ttsSettings, speakText } = useAISettings();
  const [userInput, setUserInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showWebhookButton, setShowWebhookButton] = useState<boolean>(false);
  const [isSendingData, setIsSendingData] = useState<boolean>(false);
  const [dataSent, setDataSent] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Obtener los mensajes según el idioma seleccionado
  const messages = getMessages(settings.language);

  // Función para desplazarse manualmente al principio de la conversación
  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Scroll to bottom whenever messages change or when el input recibe focus
  useEffect(() => {
    if (messagesEndRef.current) {
      // Usamos requestAnimationFrame para un scroll más confiable
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }

    // Leer en voz alta el último mensaje del asistente si TTS está activado
    if (ttsSettings.enabled && state.messages.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Limpiar el texto para TTS (eliminar markdown y otros símbolos)
        const cleanText = lastMessage.content
          .replace(/\*\*(.*?)\*\*/g, '$1') // Eliminar negrita
          .replace(/\*(.*?)\*/g, '$1')     // Eliminar cursiva
          .replace(/`(.*?)`/g, '$1')       // Eliminar formato de código
          .replace(/- /g, ', ');           // Convertir viñetas en comas

        // Usar el servicio de TTS
        speakText(cleanText);
      }
    }
  }, [state.messages, ttsSettings.enabled, speakText]);

  // Initialize chat when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      if (state.selectedGender && state.messages.length === 0) {
        try {
          dispatch({ type: "SET_TYPING", payload: true });

          // Si no se ha seleccionado idioma, mostrar mensaje de selección de idioma
          if (!state.selectedLanguage) {
            await sleep(500);
            dispatch({
              type: "ADD_MESSAGE",
              payload: { 
                role: "assistant", 
                content: "👋 ¡Hola! Hello! ¿En qué idioma prefieres comunicarte? / In which language would you prefer to communicate?" 
              },
            });

            // Ofrecer opciones rápidas para seleccionar idioma
            dispatch({ 
              type: "SET_QUICK_RESPONSES", 
              payload: ["Español", "English"] 
            });

            dispatch({ type: "SET_TYPING", payload: false });
            return;
          }

          // Si ya se seleccionó el idioma, iniciar el chat normal
          const response = await startChat(state.selectedGender, settings.model, state.selectedLanguage);

          await sleep(1000); // Simulate typing delay

          dispatch({
            type: "ADD_MESSAGE",
            payload: { role: "assistant", content: response.message },
          });

          if (response.quickResponses) {
            dispatch({ type: "SET_QUICK_RESPONSES", payload: response.quickResponses });
          }

          dispatch({ type: "SET_TYPING", payload: false });
        } catch (error) {
          console.error("Failed to initialize chat:", error);
        }
      }
    };

    initializeChat();
  }, [state.selectedGender, state.messages.length, state.selectedLanguage, dispatch, settings.model]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (userInput.trim() === "" || isProcessing) return;

    try {
      setIsProcessing(true);

      // Add user message to chat
      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "user", content: userInput },
      });

      // Detectar si es selección de idioma (solo si aún no hay idioma seleccionado)
      if (!state.selectedLanguage && state.messages.length === 1) {
        const userInputLower = userInput.toLowerCase().trim();
        let detectedLanguage: 'es' | 'en' = 'es'; // Default to Spanish

        // Detectar idioma basado en la respuesta
        if (userInputLower === 'english' || 
            userInputLower === 'en' || 
            userInputLower === 'inglés' ||
            userInputLower === 'ingles' ||
            userInputLower.includes('english')) {
          detectedLanguage = 'en';
        }

        // Establecer el idioma seleccionado
        dispatch({ type: "SET_LANGUAGE", payload: detectedLanguage });

        // Actualizar los ajustes de IA con el nuevo idioma
        setLanguage(detectedLanguage);

        // Clear input and set typing indicator
        setUserInput("");
        dispatch({ type: "SET_TYPING", payload: true });

        // Responder acorde al idioma seleccionado
        await sleep(1000);

        const welcomeMessage = detectedLanguage === 'en' 
          ? "Thank you! I'll communicate with you in English from now on. Let's continue with your perfume selection."
          : "¡Gracias! Me comunicaré contigo en español a partir de ahora. Continuemos con tu selección de perfume.";

        dispatch({
          type: "ADD_MESSAGE",
          payload: { role: "assistant", content: welcomeMessage },
        });

        // Iniciar el chat normal después de la selección de idioma
        await sleep(500);
        const response = await startChat(state.selectedGender, settings.model, detectedLanguage);

        await sleep(1000);

        dispatch({
          type: "ADD_MESSAGE",
          payload: { role: "assistant", content: response.message },
        });

        if (response.quickResponses) {
          dispatch({ type: "SET_QUICK_RESPONSES", payload: response.quickResponses });
        }

        dispatch({ type: "SET_TYPING", payload: false });
        setIsProcessing(false);
        return;
      }

      // Proceso normal para mensajes después de selección de idioma
      // Store user response based on current step
      const responseKey = Object.keys(state.userResponses)[state.currentStep + 1]; // +1 because gender is already set
      dispatch({
        type: "SET_USER_RESPONSE",
        payload: { key: responseKey, value: userInput },
      });

      // Clear input and set typing indicator
      setUserInput("");
      dispatch({ type: "SET_TYPING", payload: true });

      await sleep(500); // Small delay before sending to API

      // Get response from API
      const response = await sendMessage(
        userInput,
        state.selectedGender,
        state.currentStep,
        settings.model,
        state.selectedLanguage
      );

      // Move to next step
      dispatch({ type: "SET_STEP", payload: (state.currentStep + 1) as ChatStep });

      // Add assistant message after a short delay
      await sleep(1000); // Simulate typing delay

      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "assistant", content: response.message },
      });

      // Set quick responses if provided
      dispatch({ type: "SET_QUICK_RESPONSES", payload: response.quickResponses });

      // Check if chat is complete
      if (response.isComplete || state.currentStep >= ChatStep.COMPLETE) {
        // Generate recommendation
        await sleep(1000);
        const recommendation = await getRecommendation(state, settings.model, state.selectedLanguage);
        setLocation("/recommendation", { 
          state: { recommendation: recommendation.recommendation } 
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      dispatch({ type: "SET_TYPING", payload: false });
      setIsProcessing(false);
    }
  };

  const handleQuickResponse = (response: string) => {
    // Si es selección de idioma y no hay idioma seleccionado
    if (!state.selectedLanguage && state.messages.length === 1 && 
        (response === "Español" || response === "English")) {
      const detectedLanguage: 'es' | 'en' = response === "English" ? 'en' : 'es';

      // Establecer el idioma directamente aquí
      dispatch({ type: "SET_LANGUAGE", payload: detectedLanguage });

      // Actualizar los ajustes de IA
      setLanguage(detectedLanguage);

      // Enviar el mensaje seleccionado
      setUserInput(response);
      handleSendMessage();
      return;
    }

    // Caso normal para otras respuestas rápidas
    setUserInput(response);
    handleSendMessage();
  };

  return (
    <div className="container mx-auto px-4 h-full flex flex-col pt-6 pb-10">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 logo-container overflow-hidden">
            <img 
              src={logoImg} 
              alt="AROMASENS Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl text-gradient font-bold mb-2">
          {messages.perfumeAssistant}
        </h2>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px bg-accent/30 w-12"></div>
          <h3 className="font-serif text-xl text-primary animate-pulse-subtle">
            {state.selectedGender === "femenino" ? messages.feminine : messages.masculine}
          </h3>
          <div className="h-px bg-accent/30 w-12"></div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <div className="glass-effect py-2 px-4 rounded-full inline-flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="text-foreground text-sm">
              {messages.idealPerfume}
            </p>
          </div>

          {/* Controles de síntesis de voz */}
          <TextToSpeechControls gender={state.selectedGender} />
        </div>
      </div>

      <div className="futuristic-card flex-grow flex flex-col max-w-3xl mx-auto w-full bg-card/90 backdrop-blur-md">
        {/* Chat Progress Indicator */}
        <div className="w-full px-4 py-3 border-b border-border/50">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-foreground/70">{messages.loading}</span>
            <span className="text-xs text-accent">
              {Math.min(state.currentStep + 1, 4)}/4
            </span>
          </div>
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${Math.min((state.currentStep + 1) / 4 * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-foreground/50 mt-1">
            <span>{messages.age}</span>
            <span>{messages.experience}</span>
            <span>{messages.occasion}</span>
            <span>{messages.preferences}</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="chat-container overflow-y-auto overflow-x-hidden flex-grow p-4 md:p-6 scrollbar-hide"
        >
          <div className="flex flex-col space-y-4 w-full">
            {state.messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message flex items-start ${
                  message.role === "user" ? "justify-end" : ""
                } animate-in fade-in-0 duration-300 ease-in-out w-full`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20 flex-shrink-0 mr-3">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div
                  className={`${
                    message.role === "user"
                      ? "bg-orange-200 border border-orange-300 text-black"
                      : "glass-effect bg-orange-100 text-black border border-orange-200"
                  } rounded-2xl py-3 px-4 max-w-[85%] shadow-md`}
                >
                  {message.role === "user" ? (
                    <div className="mb-1 text-xs font-semibold text-orange-600 uppercase tracking-wide">Usuario</div>
                  ) : (
                    <div className="mb-1 text-xs font-semibold text-primary uppercase tracking-wide">Asistente</div>
                  )}
                  <div className="markdown-content leading-relaxed">
                    {message.content.split('\n').map((paragraph, i) => {
                      // Procesamiento básico de Markdown
                      // Formato de negrita
                      let formattedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      // Formato de cursiva
                      formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
                      // Formato de código
                      formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-orange-50 px-1 rounded text-orange-800">$1</code>');
                      // Formato de listas
                      if (formattedText.trim().startsWith('- ')) {
                        formattedText = `<span class="flex"><span class="mr-2">•</span><span>${formattedText.substring(2)}</span></span>`;
                      }

                      return (
                        <p 
                          key={i} 
                          className={`${i > 0 ? 'mt-2' : ''}`}
                          dangerouslySetInnerHTML={{ __html: formattedText }}
                        />
                      );
                    })}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-accent/10 backdrop-blur-sm flex items-center justify-center border border-accent/20 flex-shrink-0 ml-3">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {state.isTyping && (
              <div className="chat-message flex items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20 flex-shrink-0 mr-3">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="glass-effect bg-orange-100 border border-orange-200 rounded-2xl py-3 px-6 shadow-md">
                  <div className="mb-1 text-xs font-semibold text-primary uppercase tracking-wide">Asistente</div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Botón para subir cuando hay muchos mensajes */}
          {state.messages.length > 5 && (
            <button
              onClick={scrollToTop}
              className="absolute top-4 right-4 bg-accent/20 hover:bg-accent/40 text-accent rounded-full p-2 transition-all duration-300 shadow-md"
              aria-label="Scroll to top"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border/50 bg-card/30 sticky bottom-0 z-20">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <SpeechRecognitionButton 
              onResult={(text) => setUserInput(text)}
              className="flex"
            />

            <div className="relative flex-grow">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => {
                  // Mejor manejo del enfoque y scroll
                  setTimeout(() => {
                    if (messagesEndRef.current) {
                      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
                    }
                  }, 100);
                }}
                className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-l-full py-3 px-5 pr-12 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all duration-300"
                placeholder={messages.typeMessage}
                disabled={state.isTyping || isProcessing}
                style={{ fontSize: '16px' }} /* Evitar zoom en iOS */
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center btn-animated disabled:opacity-50"
                disabled={state.isTyping || isProcessing || !userInput.trim()}
              >
                <Send className={`w-5 h-5 ${userInput.trim() ? 'text-accent' : 'text-muted-foreground'}`} />
              </button>
            </div>
            <button
              type="submit"
              className={`bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white py-3 px-6 rounded-r-full transition-all duration-300 disabled:opacity-50 btn-animated ${
                !userInput.trim() || state.isTyping || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={state.isTyping || isProcessing || !userInput.trim()}
            >
              {messages.sendMessage}
            </button>
          </form>

          {/* Quick Responses */}
          {state.quickResponses && state.quickResponses.length > 0 && !state.isTyping && (
            <div className="flex flex-wrap gap-2 mt-4 mb-2 pb-2">
              {state.quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  className="py-2 px-4 bg-accent/10 backdrop-blur-sm hover:bg-accent/20 text-accent rounded-full text-sm transition-all duration-300 border border-accent/20 hover-glow"
                  style={{ animationDelay: `${index * 100}ms`, fontSize: '14px' }}
                >
                  {response}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}