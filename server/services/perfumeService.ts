import { storage } from "../storage";
import { 
  type Perfume, type ChatPreferences, type ChatResponse,
  type InsertChatSession, type InsertRecommendation
} from "@shared/schema";
import { generatePerfumeProfile, generateChatResponse } from "./openai";

export async function getPerfumesByGender(gender: string): Promise<Perfume[]> {
  return await storage.getPerfumes(gender);
}

export async function startChatSession(gender: string): Promise<ChatResponse> {
  try {
    // Initialize session data (without storing yet, as we don't have preferences)
    const initialMessage = await generateChatResponse(0, gender);
    
    return {
      message: initialMessage,
      step: 0,
    };
  } catch (error) {
    console.error("Error starting chat session:", error);
    throw new Error("Failed to start chat session");
  }
}

export async function processUserMessage(
  message: string, 
  gender: string, 
  step: number
): Promise<ChatResponse> {
  try {
    const nextStep = step + 1;
    
    // Get quick responses for specific steps if needed
    let quickResponses: string[] | undefined;
    if (nextStep === 3) {
      quickResponses = [
        "Uso diario", 
        "Eventos formales", 
        "Citas románticas", 
        "Reuniones sociales", 
        "Trabajo"
      ];
    } else if (nextStep === 4) {
      quickResponses = [
        "Florales", 
        "Frutales", 
        "Amaderadas", 
        "Orientales/especiadas", 
        "Cítricas", 
        "Dulces"
      ];
    }
    
    // Check if we need to generate a recommendation
    if (nextStep > 4) {
      return {
        message: "¡Gracias por tus respuestas! Basándome en tu perfil y preferencias, ya tengo una recomendación perfecta para ti.",
        step: nextStep,
        isComplete: true
      };
    }
    
    // Generate next message from OpenAI
    const aiResponse = await generateChatResponse(nextStep, gender, message);
    
    return {
      message: aiResponse,
      quickResponses,
      step: nextStep
    };
  } catch (error) {
    console.error("Error processing user message:", error);
    throw new Error("Failed to process message");
  }
}

export async function generateRecommendation(
  gender: string,
  preferences: ChatPreferences
): Promise<ChatResponse> {
  try {
    // Get all perfumes for this gender
    const perfumes = await storage.getPerfumes(gender);
    
    if (perfumes.length === 0) {
      throw new Error(`No perfumes found for gender: ${gender}`);
    }
    
    // Get available perfume IDs
    const availablePerfumeIds = perfumes.map(p => p.id);
    
    // Generate a perfume profile based on preferences using OpenAI
    const perfumeProfile = await generatePerfumeProfile(gender, preferences, availablePerfumeIds);
    
    // Get the recommended perfume
    const recommendedPerfume = await storage.getPerfume(perfumeProfile.recommendedPerfumeId);
    
    if (!recommendedPerfume) {
      throw new Error(`Recommended perfume not found: ${perfumeProfile.recommendedPerfumeId}`);
    }
    
    // Create a chat session in storage
    const chatSession = await storage.createChatSession({
      user_id: null,
      gender,
      preferences
    } as InsertChatSession);
    
    // Store the recommendation
    await storage.createRecommendation({
      chat_session_id: chatSession.id,
      perfume_id: recommendedPerfume.id,
      reason: perfumeProfile.recommendationReason
    } as InsertRecommendation);
    
    // Return the recommendation
    return {
      sessionId: chatSession.id.toString(),
      message: "Basado en tus preferencias y perfil, hemos encontrado el perfume perfecto para ti.",
      isComplete: true,
      recommendation: {
        perfumeId: recommendedPerfume.id,
        brand: recommendedPerfume.brand,
        name: recommendedPerfume.name,
        description: `${perfumeProfile.recommendationReason} ${recommendedPerfume.description}`,
        imageUrl: recommendedPerfume.image_url,
        notes: recommendedPerfume.notes,
        occasions: recommendedPerfume.occasions.join(', ')
      }
    };
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw new Error("Failed to generate recommendation");
  }
}
