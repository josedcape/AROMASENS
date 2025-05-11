import { createContext, useContext, useState, ReactNode } from 'react';
import { AIModel, AISettings, Language } from '@/lib/aiService';

// Valor por defecto para el contexto
const defaultSettings: AISettings = {
  model: 'openai',
  language: 'es'
};

// Tipo para el contexto
interface AISettingsContextType {
  settings: AISettings;
  setModel: (model: AIModel) => void;
  setLanguage: (language: Language) => void;
}

// Crear el contexto
const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

// Proveedor del contexto
export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);

  const setModel = (model: AIModel) => {
    setSettings(prev => ({ ...prev, model }));
  };

  const setLanguage = (language: Language) => {
    setSettings(prev => ({ ...prev, language }));
  };

  return (
    <AISettingsContext.Provider value={{ settings, setModel, setLanguage }}>
      {children}
    </AISettingsContext.Provider>
  );
}

// Hook para usar el contexto
export function useAISettings() {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
}