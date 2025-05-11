import { useState } from 'react';
import { useAISettings } from '@/context/AISettingsContext';
import { AIModel, Language, getMessages } from '@/lib/aiService';
import { 
  Settings, 
  X, 
  Mic, 
  Languages, 
  Brain 
} from 'lucide-react';

// Componente para mostrar los ajustes de IA
export default function AISettingsPanel() {
  const { settings, setModel, setLanguage } = useAISettings();
  const [isOpen, setIsOpen] = useState(false);
  
  const messages = getMessages(settings.language);
  
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  const handleModelChange = (model: AIModel) => {
    setModel(model);
  };
  
  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
  };
  
  return (
    <div className="relative z-10">
      {/* Botón para abrir/cerrar el panel */}
      <button
        onClick={togglePanel}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-accent text-white shadow-lg hover:shadow-accent/20 transition-all duration-300 hover-glow"
        aria-label={messages.settings}
      >
        <Settings className="w-5 h-5" />
      </button>
      
      {/* Panel de ajustes */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 glass-effect p-6 rounded-xl shadow-lg border border-accent/20 w-72 backdrop-blur-lg animate-in fade-in-50 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-lg text-primary">{messages.settings}</h3>
            <button
              onClick={togglePanel}
              className="text-accent hover:text-accent-foreground transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Selección de modelo */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Brain className="w-4 h-4 text-accent mr-2" />
              <label className="text-foreground text-sm font-medium">
                {messages.modelSelection}
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleModelChange('openai')}
                className={`py-2 px-3 rounded-md text-sm transition-all ${
                  settings.model === 'openai'
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-background/50 border border-border/50 text-foreground/70 hover:border-accent/30'
                }`}
              >
                {messages.openai}
              </button>
              <button
                onClick={() => handleModelChange('anthropic')}
                className={`py-2 px-3 rounded-md text-sm transition-all ${
                  settings.model === 'anthropic'
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-background/50 border border-border/50 text-foreground/70 hover:border-accent/30'
                }`}
              >
                {messages.anthropic}
              </button>
              <button
                onClick={() => handleModelChange('gemini')}
                className={`py-2 px-3 rounded-md text-sm transition-all ${
                  settings.model === 'gemini'
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-background/50 border border-border/50 text-foreground/70 hover:border-accent/30'
                }`}
              >
                {messages.gemini}
              </button>
            </div>
          </div>
          
          {/* Selección de idioma */}
          <div>
            <div className="flex items-center mb-3">
              <Languages className="w-4 h-4 text-accent mr-2" />
              <label className="text-foreground text-sm font-medium">
                {messages.language}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLanguageChange('es')}
                className={`py-2 px-3 rounded-md text-sm transition-all ${
                  settings.language === 'es'
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-background/50 border border-border/50 text-foreground/70 hover:border-accent/30'
                }`}
              >
                {messages.spanish}
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`py-2 px-3 rounded-md text-sm transition-all ${
                  settings.language === 'en'
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-background/50 border border-border/50 text-foreground/70 hover:border-accent/30'
                }`}
              >
                {messages.english}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}