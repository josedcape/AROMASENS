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
export async function generatePerfumeProfile(preferences: ChatPreferences, conversationHistory?: string[]): Promise<any> {
  try {
    // Construir el historial de conversación para proporcionar contexto
    const history = conversationHistory ? 
      conversationHistory.map((message, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: message
      })) : [];

    const prompt = `
    Eres AROMASENS, un asesor experto en perfumería de lujo con formación avanzada en psicología olfativa y comportamiento humano. Tu objetivo es analizar meticulosamente el perfil psicológico del cliente y recomendar la fragancia que mejor refleje su esencia personal.

    ## INFORMACIÓN DEL CLIENTE
    - Género: ${preferences.gender}
    - Edad: ${preferences.age}
    - Nivel de experiencia con fragancias: ${preferences.experience}
    - Contexto de uso principal: ${preferences.occasion}
    - Preferencias olfativas y personalidad: ${preferences.preferences}

    ## INSTRUCCIONES
    1. Realiza un análisis psicológico profundo basado en los datos proporcionados.
    2. Identifica rasgos de personalidad dominantes, motivaciones subyacentes y necesidades emocionales.
    3. Selecciona una fragancia específica (ID entre 1-20) que armonice perfectamente con el perfil psicológico.
    4. Explica la recomendación utilizando terminología profesional de perfumería y psicología.
    5. Incluye referencias a notas olfativas, familias de fragancias y efectos psicológicos específicos.

    ## FORMATO DE RESPUESTA
    Utiliza markdown avanzado en recommendationReason para crear una experiencia visualmente atractiva:
    - Encabezados jerárquicos (##, ###)
    - Listas con viñetas o numeradas
    - Texto en negrita para conceptos clave
    - Emojis estratégicamente colocados para mejorar la experiencia visual
    - Secciones bien definidas con espaciado adecuado

    Devuelve ÚNICAMENTE un objeto JSON con la siguiente estructura:
    {
      "psychologicalProfile": "Análisis psicológico detallado y profesional",
      "recommendedPerfumeId": número entre 1 y 20,
      "recommendationReason": "Explicación elaborada en formato markdown con emojis estratégicos"
    }
    `;

    const messages = [
      ...history,
      { role: 'system', content: 'Eres AROMASENS, un asesor experto en perfumería con formación en psicología olfativa.' },
      { role: 'user', content: prompt }
    ];

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages,
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error en OpenAI service:', error);
    throw new Error(`Error al generar el perfil con OpenAI: ${error.message}`);
  }
}

// Genera una respuesta de chat con memoria persistente
export async function generateChatResponse(prompt: string, conversationHistory: string[]): Promise<string> {
  try {
    // Construir mensajes con la historia de la conversación para mantener contexto
    const messages = conversationHistory.map((message, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: message
    }));

    // Añadir mensaje del sistema y la nueva consulta
    messages.unshift({
      role: 'system',
      content: `Eres AROMASENS, un asesor experto en perfumería de lujo con formación avanzada en psicología olfativa.
      Mantienes un tono profesional pero cálido, utilizando terminología especializada de perfumería cuando sea apropiado.
      Tus respuestas son concisas pero informativas, con un enfoque en proporcionar valor y conocimiento experto.
      Recuerda toda la información previa compartida por el usuario para ofrecer una experiencia personalizada y coherente.`
    });

    messages.push({ role: 'user', content: prompt });

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error en OpenAI service:', error);
    throw new Error(`Error al generar respuesta de chat con OpenAI: ${error.message}`);
  }
}
