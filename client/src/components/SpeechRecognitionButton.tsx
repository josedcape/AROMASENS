import { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { speechRecognition, getMessages } from '@/lib/aiService';
import { useAISettings } from '@/context/AISettingsContext';

interface SpeechRecognitionButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

export default function SpeechRecognitionButton({ 
  onResult, 
  className = ''
}: SpeechRecognitionButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const { settings } = useAISettings();
  
  const messages = getMessages(settings.language);

  useEffect(() => {
    // Comprobar si el navegador soporta reconocimiento de voz
    setIsSupported(speechRecognition.isSupported());
    
    // Configurar los callbacks
    speechRecognition.onResult((text) => {
      onResult(text);
      // Detenemos el reconocimiento después de obtener un resultado
      speechRecognition.stop();
      setIsListening(false);
    });
    
    speechRecognition.onStart(() => {
      setIsListening(true);
      startAnimation();
    });
    
    speechRecognition.onEnd(() => {
      setIsListening(false);
      stopAnimation();
    });
    
    speechRecognition.onError(() => {
      setIsListening(false);
      stopAnimation();
    });
    
    // Actualizar el idioma del reconocimiento de voz cuando cambie el idioma
    speechRecognition.setLanguage(settings.language);
    
    return () => {
      // Detener el reconocimiento si el componente se desmonta
      if (isListening) {
        speechRecognition.stop();
      }
    };
  }, [onResult, settings.language]);
  
  const toggleListening = () => {
    if (!isSupported) return;
    
    if (isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
  };
  
  const startAnimation = () => {
    setIsAnimating(true);
  };
  
  const stopAnimation = () => {
    setIsAnimating(false);
  };
  
  if (!isSupported) {
    return (
      <div className="text-muted-foreground text-sm">
        {messages.noSpeechRecognition}
      </div>
    );
  }
  
  return (
    <button
      onClick={toggleListening}
      className={`relative ${className} ${
        isListening 
          ? 'bg-primary text-white' 
          : 'bg-accent/10 text-accent hover:bg-accent/20'
      } rounded-full p-3 transition-all duration-300`}
      title={isListening ? messages.stopListening : messages.startListening}
      aria-label={isListening ? messages.stopListening : messages.startListening}
    >
      {isListening ? (
        <>
          <MicOff className="w-5 h-5" />
          {isAnimating && (
            <>
              <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-primary"></span>
              <span className="absolute inset-[-4px] rounded-full animate-pulse opacity-50 bg-primary"></span>
            </>
          )}
        </>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}