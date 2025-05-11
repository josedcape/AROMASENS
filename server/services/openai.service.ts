import OpenAI from 'openai';
import { ChatPreferences } from '@shared/schema';
import dotenv from 'dotenv';

dotenv.config();

// Verificar que existe la clave API
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ No se ha encontrado OPENAI_API_KEY en las variables de entorno');
}

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = 'gpt-4o';

// Genera un perfil psicológico y recomendación de perfume
export async function generatePerfumeProfile(preferences: ChatPreferences): Promise<any> {
  try {
    const prompt = `
    Actúa como un experto en perfumería y psicología. Basándote en la siguiente información del usuario:

    - Género: ${preferences.gender}
    - Edad: ${preferences.age}
    - Experiencia previa con perfumes: ${preferences.experience}
    - Ocasión de uso: ${preferences.occasion}
    - Preferencias personales: ${preferences.preferences}

    Por favor crea un perfil psicológico detallado y recomienda un perfume específico que se adapte a su personalidad y necesidades.
    
    Para la parte de recommendationReason, asegúrate de incluir emojis para resaltar puntos importantes y usa formato markdown para que la respuesta esté bien presentada visualmente. Incluye encabezados, listas o negritas cuando sea apropiado.
    
    Devuelve la respuesta en formato JSON con la siguiente estructura:
    {
      "psychologicalProfile": "Análisis psicológico detallado basado en las respuestas",
      "recommendedPerfumeId": número entre 1 y 20,
      "recommendationReason": "Explicación detallada en formato markdown con emojis de por qué este perfume se adapta al perfil"
    }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error en OpenAI service:', error);
    throw new Error(`Error al generar el perfil con OpenAI: ${error.message}`);
  }
}

// Genera una respuesta de chat
export async function generateChatResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error en OpenAI service:', error);
    throw new Error(`Error al generar respuesta de chat con OpenAI: ${error.message}`);
  }
}