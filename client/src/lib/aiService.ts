import { type ChatMessage } from './types';

// Tipos para los diferentes modelos de IA
export type AIModel = 'openai' | 'anthropic' | 'gemini';
export type Language = 'es' | 'en';

// Declaraciones de tipos para Speech Recognition Web API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  // La interfaz SpeechRecognition
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onstart: () => void;
    onend: () => void;
    onerror: (event: any) => void;
  }

  // El evento SpeechRecognitionEvent
  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
  }

  // Lista de resultados
  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  // Resultado individual
  interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }

  // Alternativa de reconocimiento
  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
}

// Interfaz para los ajustes de IA
export interface AISettings {
  model: AIModel;
  language: Language;
}

// Mensajes en diferentes idiomas
export const messages = {
  es: {
    listening: 'Escuchando...',
    startListening: 'Iniciar reconocimiento de voz',
    stopListening: 'Detener reconocimiento de voz',
    modelSelection: 'Modelo de IA',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    gemini: 'Google Gemini',
    language: 'Idioma',
    spanish: 'Español',
    english: 'Inglés',
    settings: 'Ajustes',
    sendMessage: 'Enviar mensaje',
    typeMessage: 'Escribe tu mensaje...',
    noSpeechRecognition: 'Tu navegador no soporta reconocimiento de voz',
    perfumeAssistant: 'Asistente de Fragancias',
    feminine: 'Femeninas',
    masculine: 'Masculinas',
    conversePerfume: 'Conversa con nuestro asistente para encontrar tu perfume ideal',
    age: 'Edad',
    experience: 'Experiencia',
    occasion: 'Ocasión',
    preferences: 'Preferencias',
    loading: 'Cargando...',
    processing: 'Procesando...',
    discover: 'Descubrir',
    idealPerfume: 'Descubre tu perfume ideal',
    idealFragrance: 'Nuestro asistente te ayudará a encontrar el perfume perfecto según tu personalidad y preferencias.',
    startSpeechRecognition: 'Iniciar reconocimiento de voz',
    stopSpeechRecognition: 'Detener reconocimiento de voz',
  },
  en: {
    listening: 'Listening...',
    startListening: 'Start speech recognition',
    stopListening: 'Stop speech recognition',
    modelSelection: 'AI Model',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    gemini: 'Google Gemini',
    language: 'Language',
    spanish: 'Spanish',
    english: 'English',
    settings: 'Settings',
    sendMessage: 'Send message',
    typeMessage: 'Type your message...',
    noSpeechRecognition: 'Your browser does not support speech recognition',
    perfumeAssistant: 'Perfume Assistant',
    feminine: 'Feminine',
    masculine: 'Masculine',
    conversePerfume: 'Chat with our assistant to find your ideal perfume',
    age: 'Age',
    experience: 'Experience',
    occasion: 'Occasion',
    preferences: 'Preferences',
    loading: 'Loading...',
    processing: 'Processing...',
    discover: 'Discover',
    idealPerfume: 'Discover your ideal perfume',
    idealFragrance: 'Our assistant will help you find the perfect perfume based on your personality and preferences.',
    startSpeechRecognition: 'Start speech recognition',
    stopSpeechRecognition: 'Stop speech recognition',
  }
};

// Clase para gestionar el reconocimiento de voz
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
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
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // @ts-ignore - Utilizamos TypeScript ignore porque el API web no está completamente tipado
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language === 'es' ? 'es-ES' : 'en-US';

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        if (event.results[0].isFinal && this.onResultCallback) {
          this.onResultCallback(transcript);
        }
      };

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStartCallback) this.onStartCallback();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) this.onEndCallback();
      };

      this.recognition.onerror = (event) => {
        if (this.onErrorCallback) this.onErrorCallback(event);
      };
    }
  }

  public setLanguage(language: Language): void {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
    }
  }

  public start(): boolean {
    if (!this.recognition) return false;
    
    if (!this.isListening) {
      try {
        this.recognition.start();
        return true;
      } catch (e) {
        console.error('Error al iniciar el reconocimiento de voz:', e);
        return false;
      }
    }
    return true;
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public isSupported(): boolean {
    return ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
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

// Creamos una instancia exportable del servicio
export const speechRecognition = new SpeechRecognitionService();

// Función para traducir mensajes de chat según el idioma
export function translateChatMessages(messages: ChatMessage[], language: Language): ChatMessage[] {
  // Aquí podríamos implementar una traducción real de los mensajes
  // Por ahora solo devolvemos los mismos mensajes
  // En una implementación real, usaríamos un servicio de traducción
  return messages;
}

// Función para obtener mensajes según el idioma
export function getMessages(language: Language) {
  return messages[language];
}