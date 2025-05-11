import { apiRequest } from "./queryClient";
import { ChatStep, type ChatState, type ApiResponse } from "./types";
import { AIModel } from "./aiService";

export async function startChat(gender: string, model: AIModel = 'openai', language: 'es' | 'en' = 'es'): Promise<ApiResponse> {
  const response = await apiRequest("POST", "/api/chat/start", { gender, model, language });
  return await response.json();
}

export async function sendMessage(
  message: string, 
  gender: string, 
  step: ChatStep,
  model: AIModel = 'openai',
  language: 'es' | 'en' = 'es'
): Promise<ApiResponse> {
  const response = await apiRequest(
    "POST", 
    "/api/chat/message", 
    { message, gender, step, model, language }
  );
  return await response.json();
}

export async function getRecommendation(chatState: ChatState, model: AIModel = 'openai', language: 'es' | 'en' = 'es'): Promise<ApiResponse> {
  const { userResponses } = chatState;
  
  const response = await apiRequest(
    "POST", 
    "/api/chat/recommendation", 
    { 
      gender: userResponses.gender,
      age: userResponses.age,
      experience: userResponses.experience,
      occasion: userResponses.occasion,
      preferences: userResponses.preferences,
      model,
      language
    }
  );
  
  return await response.json();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
