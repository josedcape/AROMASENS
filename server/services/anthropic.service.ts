import Anthropic from '@anthropic-ai/sdk';
import { ChatPreferences } from '@shared/schema';
import dotenv from 'dotenv';

dotenv.config();

// Verificar que existe la clave API
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️ No se ha encontrado ANTHROPIC_API_KEY en las variables de entorno');
}

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = 'claude-3-7-sonnet-20250219';

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
    
    Es importante que devuelvas la respuesta en formato JSON con la siguiente estructura exacta:
    {
      "psychologicalProfile": "Análisis psicológico detallado basado en las respuestas",
      "recommendedPerfumeId": número entre 1 y 20,
      "recommendationReason": "Explicación detallada en formato markdown con emojis de por qué este perfume se adapta al perfil"
    }
    `;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: "Eres un asistente experto en perfumería y psicología, especializado en hacer recomendaciones personalizadas basadas en perfiles psicológicos. Siempre respondes en formato JSON.",
      messages: [{ role: 'user', content: prompt }]
    });

    // Extraer el contenido JSON del mensaje
    const resultText = message.content[0].text;
    const result = JSON.parse(resultText);
    return result;
  } catch (error) {
    console.error('Error en Anthropic service:', error);
    throw new Error(`Error al generar el perfil con Anthropic: ${error.message}`);
  }
}

// Genera una respuesta de chat
export async function generateChatResponse(prompt: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error en Anthropic service:', error);
    throw new Error(`Error al generar respuesta de chat con Anthropic: ${error.message}`);
  }
}