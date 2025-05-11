import { storage } from "../storage";
import { 
  type Perfume, type ChatPreferences, type ChatResponse,
  type InsertChatSession, type InsertRecommendation
} from "@shared/schema";
import { generatePerfumeProfile, generateChatResponse } from "./ai.service";

export async function getPerfumesByGender(gender: string): Promise<Perfume[]> {
  return await storage.getPerfumes(gender);
}

export async function startChatSession(gender: string, model: string = 'openai'): Promise<ChatResponse> {
  try {
    // Initialize session data (without storing yet, as we don't have preferences)
    const prompt = `
    Eres un asistente virtual de una tienda de perfumes llamada AROMASENS. Estás manteniendo una conversación con un cliente para recomendarle el perfume perfecto.
    
    El cliente está buscando fragancias ${gender === 'femenino' ? 'femeninas' : 'masculinas'}.
    
    Estás iniciando la conversación. Preséntate y pregunta por la edad del cliente.
    
    Tu respuesta debe ser conversacional, amistosa y concisa.
    `;
    
    const initialMessage = await generateChatResponse(prompt, model as any);
    
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
  step: number,
  model: string = 'openai'
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
    
    // Preparamos el prompt según el paso actual
    const prompts = {
      1: "Pregunta sobre su experiencia con perfumes y sus favoritos.",
      2: "Pregunta sobre las ocasiones para las que quiere el perfume.",
      3: "Pregunta sobre sus notas o tipos de fragancias preferidas.",
      4: "Agradece sus respuestas y hazle saber que le proporcionarás una recomendación."
    };
    
    const prompt = `
    Eres un asistente virtual de una tienda de perfumes llamada AROMASENS. Estás manteniendo una conversación con un cliente para recomendarle el perfume perfecto.
    
    El cliente está buscando fragancias ${gender === 'femenino' ? 'femeninas' : 'masculinas'}.
    
    El último mensaje del cliente fue: "${message}"
    
    Estás en el paso ${nextStep} de la conversación. En este paso, tu tarea es: ${prompts[nextStep as keyof typeof prompts]}
    
    Tu respuesta debe ser conversacional, amistosa y concisa.
    `;
    
    // Generate next message from the selected AI model
    const aiResponse = await generateChatResponse(prompt, model as any);
    
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
  preferences: ChatPreferences,
  model: string = 'openai'
): Promise<ChatResponse> {
  try {
    // Get all perfumes for this gender
    const perfumes = await storage.getPerfumes(gender);
    
    if (perfumes.length === 0) {
      throw new Error(`No perfumes found for gender: ${gender}`);
    }
    
    // Get available perfume IDs
    const availablePerfumeIds = perfumes.map(p => p.id);
    
    // Crear objeto de preferencias con género incluido para el perfil
    const preferencesWithGender = {
      ...preferences,
      gender
    };
    
    // Generate a perfume profile based on preferences using the selected AI model
    const perfumeProfile = await generatePerfumeProfile(preferencesWithGender, model as any);
    
    // Asegurarse de que el ID de perfume recomendado esté en la lista disponible
    let recommendedPerfumeId = perfumeProfile.recommendedPerfumeId;
    if (!availablePerfumeIds.includes(recommendedPerfumeId)) {
      recommendedPerfumeId = availablePerfumeIds[0];
    }
    
    // Get the recommended perfume
    const recommendedPerfume = await storage.getPerfume(recommendedPerfumeId);
    
    if (!recommendedPerfume) {
      throw new Error(`Recommended perfume not found: ${recommendedPerfumeId}`);
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
        description: `${perfumeProfile.recommendationReason} ${recommendedPerfume.description || ''}`,
        imageUrl: recommendedPerfume.image_url,
        notes: recommendedPerfume.notes,
        occasions: recommendedPerfume.occasions ? recommendedPerfume.occasions.join(', ') : ''
      }
    };
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw new Error("Failed to generate recommendation");
  }
}
