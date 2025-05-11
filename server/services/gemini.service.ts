import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatPreferences } from '@shared/schema';
import dotenv from 'dotenv';

dotenv.config();

// Verificar que existe la clave API
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ No se ha encontrado GEMINI_API_KEY en las variables de entorno');
}

// Inicializar cliente de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// El modelo más avanzado de Gemini disponible
const MODEL = 'gemini-1.5-pro';

// Genera un perfil psicológico y recomendación de perfume
export async function generatePerfumeProfile(preferences: ChatPreferences): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    const prompt = `
    Actúa como un experto en perfumería y psicología. Basándote en la siguiente información del usuario:

    - Género: ${preferences.gender}
    - Edad: ${preferences.age}
    - Experiencia previa con perfumes: ${preferences.experience}
    - Ocasión de uso: ${preferences.occasion}
    - Preferencias personales: ${preferences.preferences}

    Por favor crea un perfil psicológico detallado y recomienda un perfume específico que se adapte a su personalidad y necesidades.
    Devuelve la respuesta en formato JSON con la siguiente estructura:
    {
      "psychologicalProfile": "Análisis psicológico detallado basado en las respuestas",
      "recommendedPerfumeId": número entre 1 y 20,
      "recommendationReason": "Explicación detallada de por qué este perfume se adapta al perfil"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extraer el JSON de la respuesta
    try {
      // Buscar el JSON en el texto (puede estar rodeado de texto explicativo)
      const jsonMatch = text.match(/({[\s\S]*})/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Si no se pudo encontrar un JSON válido, intentamos parsear todo el texto
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('Error al parsear JSON de Gemini:', jsonError);
      
      // Si no podemos parsear JSON, devolvemos un objeto con el formato esperado
      return {
        psychologicalProfile: "No se pudo generar un perfil psicológico estructurado",
        recommendedPerfumeId: Math.floor(Math.random() * 20) + 1,
        recommendationReason: text.substring(0, 200) // Usamos parte del texto como razón
      };
    }
  } catch (error) {
    console.error('Error en Gemini service:', error);
    throw new Error(`Error al generar el perfil con Gemini: ${error.message}`);
  }
}

// Genera una respuesta de chat
export async function generateChatResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error en Gemini service:', error);
    throw new Error(`Error al generar respuesta de chat con Gemini: ${error.message}`);
  }
}