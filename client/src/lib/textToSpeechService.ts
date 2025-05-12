
import { Language } from './aiService';

export type VoiceGender = 'male' | 'female';

export interface TextToSpeechSettings {
  enabled: boolean;
  gender: VoiceGender;
  language: Language;
}

class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private settings: TextToSpeechSettings = {
    enabled: false,
    gender: 'female',
    language: 'es'
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      // Cargar voces cuando estén disponibles
      if (this.synth) {
        // Las voces pueden no estar disponibles inmediatamente
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = this.loadVoices.bind(this);
        }
        // Intentar cargar voces inmediatamente también
        this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (this.synth) {
      this.voices = this.synth.getVoices();
      console.log('Voces disponibles:', this.voices);
    }
  }

  public isSupported(): boolean {
    return !!this.synth;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public updateSettings(settings: Partial<TextToSpeechSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  public getSettings(): TextToSpeechSettings {
    return this.settings;
  }

  public speak(text: string): void {
    if (!this.synth || !this.settings.enabled || !text) return;

    // Detener cualquier síntesis en curso
    this.synth.cancel();

    // Seleccionar la voz apropiada según configuración
    const voiceLanguageCode = this.settings.language === 'es' ? 'es' : 'en';
    
    // Elegir género de voz
    let selectedVoice = this.findVoice(voiceLanguageCode, this.settings.gender);
    
    // Si no se encuentra una voz del género específico, usar cualquiera del idioma
    if (!selectedVoice) {
      selectedVoice = this.voices.find(voice => 
        voice.lang.toLowerCase().includes(voiceLanguageCode.toLowerCase())
      );
    }

    // Si aún no hay voz, usar la predeterminada
    if (!selectedVoice && this.voices.length > 0) {
      selectedVoice = this.voices[0];
    }

    // Crear y configurar el utterance
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = this.settings.language === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Reproducir
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  private findVoice(langCode: string, gender: VoiceGender): SpeechSynthesisVoice | undefined {
    // Patrones comunes en nombres de voces para identificar género
    const malePatterns = ['male', 'hombre', 'carlos', 'miguel', 'diego', 'juan', 'jorge', 'david'];
    const femalePatterns = ['female', 'mujer', 'carmen', 'maria', 'sofia', 'laura', 'ana', 'elena'];

    // Comprobar nombres de voces por idioma y género
    return this.voices.find(voice => {
      const voiceName = voice.name.toLowerCase();
      const voiceLang = voice.lang.toLowerCase();
      const isCorrectLang = voiceLang.includes(langCode.toLowerCase());
      
      if (isCorrectLang) {
        if (gender === 'male') {
          return malePatterns.some(pattern => voiceName.includes(pattern)) || 
                 (voice.name.includes('Google') && voiceName.includes('male'));
        } else {
          return femalePatterns.some(pattern => voiceName.includes(pattern)) || 
                 (voice.name.includes('Google') && voiceName.includes('female'));
        }
      }
      return false;
    });
  }
}

export const textToSpeech = new TextToSpeechService();
