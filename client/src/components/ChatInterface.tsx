import { useState, useEffect, useRef, FormEvent } from "react";
import { useLocation } from "wouter";
import { useChatContext } from "@/context/ChatContext";
import { useAISettings } from "@/context/AISettingsContext";
import { ChatStep } from "@/lib/types";
import { startChat, sendMessage, getRecommendation, sleep } from "@/lib/chatHelpers";
import { Send, Bot, User, Sparkles } from "lucide-react";
import logoImg from "@/assets/aromasens-logo.png";
import SpeechRecognitionButton from "@/components/SpeechRecognitionButton";
import { getMessages } from "@/lib/aiService";

export default function ChatInterface() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useChatContext();
  const { settings } = useAISettings();
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Obtener los mensajes según el idioma seleccionado
  const messages = getMessages(settings.language);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);
  
  // Initialize chat when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      if (state.selectedGender && state.messages.length === 0) {
        try {
          dispatch({ type: "SET_TYPING", payload: true });
          const response = await startChat(state.selectedGender, settings.model);
          
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
  }, [state.selectedGender, state.messages.length, dispatch]);
  
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
        state.currentStep
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
        const recommendation = await getRecommendation(state);
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
        <div className="glass-effect py-2 px-4 rounded-full inline-flex items-center space-x-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <p className="text-foreground text-sm">
            {messages.idealPerfume}
          </p>
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
        <div className="chat-container overflow-y-auto flex-grow p-4 md:p-6">
          <div className="flex flex-col space-y-4">
            {state.messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message flex items-start ${
                  message.role === "user" ? "justify-end" : ""
                } animate-in fade-in-0 duration-300 ease-in-out`}
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
                      ? "bg-accent/10 border border-accent/20 text-foreground"
                      : "glass-effect text-foreground"
                  } rounded-2xl py-3 px-4 max-w-[85%] shadow-sm`}
                >
                  <p className="leading-relaxed">{message.content}</p>
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
                <div className="glass-effect rounded-2xl py-3 px-6">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.3s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="p-4 border-t border-border/50 bg-card/30">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <SpeechRecognitionButton 
              onResult={(text) => setUserInput(text)}
              className="hidden sm:flex"
            />
            
            <div className="relative flex-grow">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-l-full py-3 px-5 pr-12 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all duration-300"
                placeholder={messages.typeMessage}
                disabled={state.isTyping || isProcessing}
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
            <div className="flex flex-wrap gap-2 mt-4">
              {state.quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  className="py-2 px-4 bg-accent/10 backdrop-blur-sm hover:bg-accent/20 text-accent rounded-full text-sm transition-all duration-300 border border-accent/20 hover-glow"
                  style={{ animationDelay: `${index * 100}ms` }}
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
