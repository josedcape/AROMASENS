import { apiRequest } from "./queryClient";
import { ChatStep, type ChatState, type ApiResponse } from "./types";

export async function startChat(gender: string): Promise<ApiResponse> {
  const response = await apiRequest("POST", "/api/chat/start", { gender });
  return await response.json();
}

export async function sendMessage(
  message: string, 
  gender: string, 
  step: ChatStep
): Promise<ApiResponse> {
  const response = await apiRequest(
    "POST", 
    "/api/chat/message", 
    { message, gender, step }
  );
  return await response.json();
}

export async function getRecommendation(chatState: ChatState): Promise<ApiResponse> {
  const { userResponses } = chatState;
  
  const response = await apiRequest(
    "POST", 
    "/api/chat/recommendation", 
    { 
      gender: userResponses.gender,
      age: userResponses.age,
      experience: userResponses.experience,
      occasion: userResponses.occasion,
      preferences: userResponses.preferences
    }
  );
  
  return await response.json();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
