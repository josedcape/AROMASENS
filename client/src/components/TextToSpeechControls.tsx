
import { useState, useEffect } from "react";
import { useAISettings } from "@/context/AISettingsContext";
import { textToSpeech } from "@/lib/textToSpeechService";
import { Volume2, VolumeX, Languages } from "lucide-react";
import { getMessages } from "@/lib/aiService";

export default function TextToSpeechControls({ gender }: { gender?: string }) {
  const { 
    settings, 
    ttsSettings, 
    setTTSEnabled, 
    setTTSGender,
    setTTSLanguage
  } = useAISettings();
  
  const [isSupported, setIsSupported] = useState(false);
  const messages = getMessages(settings.language);
  
  // Detectar si el navegador soporta síntesis de voz
  useEffect(() => {
    setIsSupported(textToSpeech.isSupported());
  }, []);

  // Establecer el género de la voz basado en el chat seleccionado
  useEffect(() => {
    if (gender) {
      setTTSGender(gender === 'femenino' ? 'female' : 'male');
    }
  }, [gender, setTTSGender]);

  // Si el navegador no soporta síntesis de voz, no mostrar el componente
  if (!isSupported) return null;

  return (
    <div className="text-to-speech-controls flex items-center space-x-3 bg-accent/10 backdrop-blur-sm rounded-full px-3 py-1.5">
      {/* Botón para activar/desactivar la síntesis de voz */}
      <button 
        onClick={() => setTTSEnabled(!ttsSettings.enabled)}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          ttsSettings.enabled 
            ? 'bg-accent/20 text-accent' 
            : 'bg-transparent text-foreground/60 hover:text-accent/80'
        }`}
        title={ttsSettings.enabled ? messages.disableTTS || "Desactivar voz" : messages.enableTTS || "Activar voz"}
      >
        {ttsSettings.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
      
      {/* Selector de idioma de la voz (solo mostrar si la síntesis está activada) */}
      {ttsSettings.enabled && (
        <div className="flex items-center space-x-2">
          <Languages size={16} className="text-foreground/60" />
          <select 
            value={ttsSettings.language}
            onChange={(e) => setTTSLanguage(e.target.value as 'es' | 'en')}
            className="bg-transparent text-xs border-none focus:ring-0 cursor-pointer pr-6"
            style={{ WebkitAppearance: "none", appearance: "none" }}
          >
            <option value="es">🇪🇸 {messages.spanish || "Español"}</option>
            <option value="en">🇬🇧 {messages.english || "Inglés"}</option>
          </select>
        </div>
      )}
    </div>
  );
}
