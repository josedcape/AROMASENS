import { ChatPreferences } from '@shared/schema';
import * as openAIService from './openai.service';
import * as anthropicService from './anthropic.service';
import * as geminiService from './gemini.service';

export type AIModel = 'openai' | 'anthropic' | 'gemini';

// Genera un perfil psicológico y recomendación de perfume según el modelo elegido
export async function generatePerfumeProfile(
  preferences: ChatPreferences, 
  model: AIModel = 'openai'
): Promise<any> {
  try {
    console.log(`Generando perfil con el modelo ${model}`);
    
    switch (model) {
      case 'openai':
        return await openAIService.generatePerfumeProfile(preferences);
      case 'anthropic':
        return await anthropicService.generatePerfumeProfile(preferences);
      case 'gemini':
        return await geminiService.generatePerfumeProfile(preferences);
      default:
        // Por defecto usamos OpenAI
        return await openAIService.generatePerfumeProfile(preferences);
    }
  } catch (error) {
    console.error(`Error al generar perfil con ${model}:`, error);
    
    // Si falla el modelo seleccionado, intentamos con otro modelo como respaldo
    try {
      const fallbackModel = model === 'openai' ? 'anthropic' : 'openai';
      console.log(`Intentando con modelo de respaldo: ${fallbackModel}`);
      
      switch (fallbackModel) {
        case 'openai':
          return await openAIService.generatePerfumeProfile(preferences);
        case 'anthropic':
          return await anthropicService.generatePerfumeProfile(preferences);
        default:
          throw error; // Si el modelo de respaldo también falla, lanzamos el error original
      }
    } catch (fallbackError) {
      console.error('Error en el modelo de respaldo:', fallbackError);
      throw error; // Devolvemos el error original
    }
  }
}

// Genera una respuesta de chat según el modelo elegido
export async function generateChatResponse(
  prompt: string, 
  model: AIModel = 'openai'
): Promise<string> {
  try {
    console.log(`Generando respuesta de chat con el modelo ${model}`);
    
    switch (model) {
      case 'openai':
        return await openAIService.generateChatResponse(prompt);
      case 'anthropic':
        return await anthropicService.generateChatResponse(prompt);
      case 'gemini':
        return await geminiService.generateChatResponse(prompt);
      default:
        // Por defecto usamos OpenAI
        return await openAIService.generateChatResponse(prompt);
    }
  } catch (error) {
    console.error(`Error al generar respuesta con ${model}:`, error);
    
    // Si falla el modelo seleccionado, intentamos con otro modelo como respaldo
    try {
      const fallbackModel = model === 'openai' ? 'anthropic' : 'openai';
      console.log(`Intentando con modelo de respaldo: ${fallbackModel}`);
      
      switch (fallbackModel) {
        case 'openai':
          return await openAIService.generateChatResponse(prompt);
        case 'anthropic':
          return await anthropicService.generateChatResponse(prompt);
        default:
          throw error; // Si el modelo de respaldo también falla, lanzamos el error original
      }
    } catch (fallbackError) {
      console.error('Error en el modelo de respaldo:', fallbackError);
      throw error; // Devolvemos el error original
    }
  }
}