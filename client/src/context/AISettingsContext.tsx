import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AIModel, Language, AISettings } from "@/lib/aiService";
import { TextToSpeechSettings, textToSpeech } from "@/lib/textToSpeechService";

interface AISettingsContextType {
  settings: AISettings;
  ttsSettings: TextToSpeechSettings;
  setModel: (model: AIModel) => void;
  setLanguage: (language: Language) => void;
  setTTSEnabled: (enabled: boolean) => void;
  setTTSGender: (gender: 'male' | 'female') => void;
  setTTSLanguage: (language: Language) => void;
  speakText: (text: string) => void;
  stopSpeech: () => void;
}

const defaultSettings: AISettings = {
  model: "openai",
  language: "es",
};

const defaultTTSSettings: TextToSpeechSettings = {
  enabled: false,
  gender: 'female',
  language: 'es'
};

const AISettingsContext = createContext<AISettingsContextType | undefined>(
  undefined,
);

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [ttsSettings, setTTSSettings] = useState<TextToSpeechSettings>(defaultTTSSettings);

  useEffect(() => {
    // Sincronizar configuración de TTS con nuestro servicio
    textToSpeech.updateSettings(ttsSettings);
  }, [ttsSettings]);

  const setModel = (model: AIModel) => {
    setSettings((prev) => ({ ...prev, model }));
  };

  const setLanguage = (language: Language) => {
    setSettings((prev) => ({ ...prev, language }));
    // Actualizar también el idioma de TTS
    setTTSSettings((prev) => ({ ...prev, language }));
  };

  const setTTSEnabled = (enabled: boolean) => {
    setTTSSettings((prev) => ({ ...prev, enabled }));
  };

  const setTTSGender = (gender: 'male' | 'female') => {
    setTTSSettings((prev) => ({ ...prev, gender }));
  };

  const setTTSLanguage = (language: Language) => {
    setTTSSettings((prev) => ({ ...prev, language }));
  };

  const speakText = (text: string) => {
    textToSpeech.speak(text);
  };

  const stopSpeech = () => {
    textToSpeech.stop();
  };

  return (
    <AISettingsContext.Provider 
      value={{ 
        settings, 
        ttsSettings,
        setModel, 
        setLanguage,
        setTTSEnabled,
        setTTSGender,
        setTTSLanguage,
        speakText,
        stopSpeech
      }}
    >
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings() {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error("useAISettings must be used within an AISettingsProvider");
  }
  return context;
}