export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum ChatStep {
  AGE = 0,
  EXPERIENCE = 1,
  OCCASION = 2,
  PREFERENCES = 3,
  COMPLETE = 4
}

export interface ChatState {
  selectedGender: string;
  selectedLanguage?: 'es' | 'en';
  currentStep: ChatStep;
  messages: ChatMessage[];
  isTyping: boolean;
  quickResponses?: string[];
  userResponses: {
    gender: string;
    age: string;
    experience: string; 
    occasion: string;
    preferences: string;
  };
}

export interface PerfumeRecommendation {
  perfumeId?: number;
  brand?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  notes?: string[];
  occasions?: string;
}

export interface ApiResponse {
  message: string;
  quickResponses?: string[];
  step?: number;
  isComplete?: boolean;
  recommendation?: PerfumeRecommendation;
}