import { useState, useEffect, useRef, FormEvent } from "react";
import { useLocation } from "wouter";
import { useChatContext } from "@/context/ChatContext";
import { ChatStep } from "@/lib/types";
import { startChat, sendMessage, getRecommendation, sleep } from "@/lib/chatHelpers";

export default function ChatInterface() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useChatContext();
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
          const response = await startChat(state.selectedGender);
          
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
    <div className="container mx-auto px-4 h-full flex flex-col">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl md:text-3xl text-primary">
          AROMASENS
        </h2>
        <h3 className="font-display text-xl md:text-2xl text-secondary">
          Asistente de Fragancias {state.selectedGender === "femenino" ? "Femeninas" : "Masculinas"}
        </h3>
        <p className="text-neutral-dark mt-2">
          Conversa con nuestro asistente para encontrar tu perfume ideal
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-4 flex-grow flex flex-col max-w-3xl mx-auto w-full">
        {/* Chat Messages */}
        <div className="chat-container overflow-y-auto flex-grow scrollbar-hide p-2">
          <div className="flex flex-col space-y-4">
            {state.messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message flex items-start ${
                  message.role === "user" ? "justify-end mb-4" : "mb-4"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white flex-shrink-0 mr-3">
                    <i className="ri-user-smile-line"></i>
                  </div>
                )}
                
                <div
                  className={`${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-neutral-light"
                  } rounded-lg py-2 px-4 max-w-[80%]`}
                >
                  <p>{message.content}</p>
                </div>
                
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white flex-shrink-0 ml-3">
                    <i className="ri-user-line"></i>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {state.isTyping && (
              <div className="chat-message flex items-start mb-4">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white flex-shrink-0 mr-3">
                  <i className="ri-user-smile-line"></i>
                </div>
                <div className="bg-neutral-light rounded-lg py-2 px-4">
                  <p className="flex space-x-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="mt-4 border-t pt-4">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-grow border border-neutral rounded-l-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-secondary"
              placeholder="Escribe tu respuesta..."
              disabled={state.isTyping || isProcessing}
            />
            <button
              type="submit"
              className="bg-secondary hover:bg-secondary-light text-white py-3 px-6 rounded-r-lg transition-colors disabled:opacity-50"
              disabled={state.isTyping || isProcessing || !userInput.trim()}
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </form>
          
          {/* Quick Responses */}
          {state.quickResponses && state.quickResponses.length > 0 && !state.isTyping && (
            <div className="flex flex-wrap gap-2 mt-3">
              {state.quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  className="py-2 px-4 bg-neutral hover:bg-neutral-dark text-primary rounded-full text-sm transition-colors"
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
