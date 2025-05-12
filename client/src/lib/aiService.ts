import { type ChatMessage } from './types';

// Tipos para los diferentes modelos de IA y lenguajes
export type AIModel = 'openai' | 'anthropic' | 'gemini';
export type Language = 'es' | 'en';

// Interfaz para los ajustes de IA
export interface AISettings {
  model: AIModel;
  language: Language;
}

// Declaraciones de tipos para Speech Recognition Web API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Mensajes en diferentes idiomas
export const messages = {
  es: {
    welcome: "¡Bienvenido a AROMASENS!",
    settings: "Ajustes",
    modelSelection: "Modelo de IA",
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Gemini",
    language: "Idioma",
    spanish: "Español",
    english: "Inglés",
    noSpeechRecognition: "Tu navegador no soporta reconocimiento de voz",
    startListening: "Iniciar reconocimiento de voz",
    stopListening: "Detener reconocimiento de voz",
    enableTTS: "Activar síntesis de voz",
    disableTTS: "Desactivar síntesis de voz",
    voiceLanguage: "Idioma de voz",
    voiceGender: "Género de voz",
    maleVoice: "Voz masculina",
    femaleVoice: "Voz femenina",
    noTTSSupport: "Tu navegador no soporta síntesis de voz",
    typeMessage: "Escribe tu respuesta...",
    sendMessage: "Enviar",
    quickResponses: "Respuestas rápidas",
    recommendation: "Recomendación",
    home: "Inicio",
    notFound: "Página no encontrada",
    backToHome: "Volver al inicio",
    loading: "Cargando...",
    error: "Error",
    retry: "Reintentar",
    perfumeAssistant: "Asistente de Fragancias",
    feminine: "Femeninas",
    masculine: "Masculinas",
    conversePerfume: "Conversa con nuestro asistente para encontrar tu perfume ideal",
    age: "Edad",
    experience: "Experiencia",
    occasion: "Ocasión",
    preferences: "Preferencias",
    processing: "Procesando...",
    discover: "Descubrir",
    idealPerfume: "Descubre tu perfume ideal",
    idealFragrance: "Nuestro asistente te ayudará a encontrar el perfume perfecto según tu personalidad y preferencias."
  },
  en: {
    welcome: "Welcome to AROMASENS!",
    settings: "Settings",
    modelSelection: "AI Model",
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Gemini",
    language: "Language",
    spanish: "Spanish",
    english: "English",
    noSpeechRecognition: "Your browser does not support speech recognition",
    startListening: "Start speech recognition",
    stopListening: "Stop speech recognition",
    enableTTS: "Enable text-to-speech",
    disableTTS: "Disable text-to-speech",
    voiceLanguage: "Voice language",
    voiceGender: "Voice gender",
    maleVoice: "Male voice",
    femaleVoice: "Female voice",
    noTTSSupport: "Your browser does not support text-to-speech",
    typeMessage: "Type your answer...",
    sendMessage: "Send",
    quickResponses: "Quick responses",
    recommendation: "Recommendation",
    home: "Home",
    notFound: "Page not found",
    backToHome: "Back to Home",
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    perfumeAssistant: "Perfume Assistant",
    feminine: "Feminine",
    masculine: "Masculine",
    conversePerfume: "Chat with our assistant to find your ideal perfume",
    age: "Age",
    experience: "Experience",
    occasion: "Occasion",
    preferences: "Preferences",
    processing: "Processing...",
    discover: "Discover",
    idealPerfume: "Discover your ideal perfume",
    idealFragrance: "Our assistant will help you find the perfect perfume based on your personality and preferences."
  }
};

// Clase para el reconocimiento de voz
export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private language: Language = 'es';
  private onResultCallback: ((text: string) => void) | null = null;
  private onStartCallback: (() => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.language === 'es' ? 'es-ES' : 'en-US';
        
        this.recognition.onresult = (event: any) => {
          const result = event.results[event.resultIndex];
          if (result.isFinal && this.onResultCallback) {
            this.onResultCallback(result[0].transcript);
          }
        };
        
        this.recognition.onstart = () => {
          this.isListening = true;
          if (this.onStartCallback) {
            this.onStartCallback();
          }
        };
        
        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };
        
        this.recognition.onerror = (event: any) => {
          this.isListening = false;
          if (this.onErrorCallback) {
            this.onErrorCallback(event);
          }
        };
      }
    }
  }

  public setLanguage(language: Language): void {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
    }
  }

  public start(): boolean {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        return true;
      } catch (error) {
        console.error('Error al iniciar el reconocimiento de voz:', error);
        return false;
      }
    }
    return false;
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error al detener el reconocimiento de voz:', error);
      }
    }
  }

  public isSupported(): boolean {
    return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
  }

  public onResult(callback: (text: string) => void): void {
    this.onResultCallback = callback;
  }

  public onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  public onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  public onError(callback: (error: any) => void): void {
    this.onErrorCallback = callback;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognition = new SpeechRecognitionService();

// Función para traducir los mensajes del chat según el idioma
export function translateChatMessages(messages: ChatMessage[], language: Language): ChatMessage[] {
  // Implementación básica, en una aplicación real se traduciría usando un servicio
  return messages;
}

// Función para obtener los mensajes según el idioma
export function getMessages(language: Language) {
  return messages[language];
}