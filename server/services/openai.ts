import OpenAI from "openai";
import { type ChatPreferences } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type PerfumeProfile = {
  psychologicalProfile: string;
  recommendedPerfumeId: number;
  recommendationReason: string;
};

export async function generatePerfumeProfile(
  gender: string,
  preferences: ChatPreferences,
  availablePerfumeIds: number[]
): Promise<PerfumeProfile> {
  try {
    const prompt = `
    You are a perfume expert and psychologist specializing in fragrance recommendations. You need to analyze a user's profile and preferences to suggest the perfect perfume.

    User preferences:
    - Gender: ${gender}
    - Age: ${preferences.age}
    - Experience with perfumes: ${preferences.experience}
    - Occasion for using perfume: ${preferences.occasion}
    - Preferred fragrances: ${preferences.preferences}

    Based on this information:
    1. Create a brief psychological profile of the user (3-4 sentences).
    2. Select a perfume ID from this list that would best match their profile: ${JSON.stringify(availablePerfumeIds)}
    3. Provide a reason for your recommendation that connects their psychology to the fragrance (2-3 sentences).

    Respond with JSON in this format: 
    {
      "psychologicalProfile": "user psychological profile",
      "recommendedPerfumeId": number,
      "recommendationReason": "reason for recommendation"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a perfume expert and psychologist specializing in fragrance recommendations. Your analysis is always thoughtful and personalized."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content) as PerfumeProfile;
    
    // Validate the perfume ID is in the available list
    if (!availablePerfumeIds.includes(result.recommendedPerfumeId)) {
      // Default to the first perfume if the recommendation is invalid
      result.recommendedPerfumeId = availablePerfumeIds[0];
    }
    
    return result;
  } catch (error) {
    console.error("Error generating perfume profile:", error);
    // Return a default profile in case of error
    return {
      psychologicalProfile: "No pudimos generar un perfil psicológico debido a un error.",
      recommendedPerfumeId: availablePerfumeIds[0],
      recommendationReason: "Te recomendamos probar esta fragancia basada en tus preferencias generales."
    };
  }
}

export async function generateChatResponse(
  step: number,
  gender: string,
  previousMessage?: string
): Promise<string> {
  try {
    const prompt = `
    You are an AI assistant for a perfume store. You're having a conversation with a customer to recommend the perfect perfume.
    
    The customer is looking for ${gender === 'femenino' ? 'feminine' : 'masculine'} fragrances.
    
    You are currently at step ${step} of the conversation.
    
    ${previousMessage ? `The customer's last message was: "${previousMessage}"` : ''}
    
    Based on the current step, respond with an appropriate message:
    
    Step 0: Introduce yourself and ask for the customer's age.
    Step 1: Ask about their experience with perfumes and their favorites.
    Step 2: Ask about the occasions they want the perfume for.
    Step 3: Ask about their preferred fragrance notes or types.
    Step 4: Thank them for their answers and let them know you'll provide a recommendation.
    
    Your response should be conversational, friendly, and in Spanish. Don't use numbered steps in your response.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a friendly perfume store assistant. Keep your responses concise, helpful, and in Spanish."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.choices[0].message.content || 
      "Lo siento, hubo un problema al generar la respuesta. ¿Podrías decirme qué estás buscando en un perfume?";
    
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "Lo siento, estoy teniendo problemas para procesar tu solicitud. ¿Podrías intentarlo de nuevo?";
  }
}
