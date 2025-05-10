import { useEffect } from "react";
import { useLocation } from "wouter";
import ChatInterface from "@/components/ChatInterface";
import { useChatContext } from "@/context/ChatContext";

export default function Chat() {
  const [, setLocation] = useLocation();
  const { state } = useChatContext();

  // Redirect to home if no gender is selected
  useEffect(() => {
    if (!state.selectedGender) {
      setLocation("/");
    }
  }, [state.selectedGender, setLocation]);

  return (
    <div className="flex-grow pt-20 pb-10">
      <ChatInterface />
    </div>
  );
}
