import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { type ChatPreferences } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

// Función para leer el archivo .env manualmente
function readEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars: Record<string, string> = {};
      
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          envVars[key] = value;
          // También lo añadimos al process.env si no existe
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      
      return envVars;
    }
  } catch (error) {
    console.error('Error leyendo archivo .env:', error);
  }
  return {};
}

// Leer variables de entorno directamente del archivo
const envVars = readEnvFile();

// Initialize AI clients with API keys
const openaiApiKey = envVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
const anthropicApiKey = envVars.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '';

console.log('¿Tenemos clave de OpenAI?', !!openaiApiKey);
console.log('¿Tenemos clave de Anthropic?', !!anthropicApiKey);

// Initialize clients
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

try {
  if (openaiApiKey) {
    openai = new OpenAI({ apiKey: openaiApiKey });
  } else {
    console.warn('No se encontró OPENAI_API_KEY en las variables de entorno');
  }
} catch (error) {
  console.error('Error inicializando OpenAI:', error);
}

try {
  if (anthropicApiKey) {
    anthropic = new Anthropic({ apiKey: anthropicApiKey });
  } else {
    console.warn('No se encontró ANTHROPIC_API_KEY en las variables de entorno');
  }
} catch (error) {
  console.error('Error inicializando Anthropic:', error);
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025

type PerfumeProfile = {
  psychologicalProfile: string;
  recommendedPerfumeId: number;
  recommendationReason: string;
};

// Implementación utilizando OpenAI y un fallback a respuestas predefinidas
export async function generatePerfumeProfile(
  gender: string,
  preferences: ChatPreferences,
  availablePerfumeIds: number[]
): Promise<PerfumeProfile> {
  try {
    console.log("Generando perfil de perfume para:", gender, preferences);
    
    // Primero intentamos usar OpenAI
    if (openai) {
      try {
        const prompt = `
        Eres un experto en perfumería y psicología especializado en recomendaciones de fragancias. Necesitas analizar el perfil y preferencias de un usuario para sugerir el perfume perfecto.

        Preferencias del usuario:
        - Género: ${gender}
        - Edad: ${preferences.age}
        - Experiencia con perfumes: ${preferences.experience}
        - Ocasión para usar el perfume: ${preferences.occasion}
        - Fragancias preferidas: ${preferences.preferences}

        Basándote en esta información:
        1. Crea un breve perfil psicológico del usuario (3-4 oraciones).
        2. Selecciona un ID de perfume de esta lista que mejor se adapte a su perfil: ${JSON.stringify(availablePerfumeIds)}
        3. Proporciona una razón para tu recomendación que conecte su psicología con la fragancia (2-3 oraciones).

        Responde con JSON en este formato:
        {
          "psychologicalProfile": "perfil psicológico del usuario",
          "recommendedPerfumeId": número,
          "recommendationReason": "razón de la recomendación"
        }
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Eres un experto en perfumería y psicología especializado en recomendaciones de fragancias. Tu análisis es siempre reflexivo y personalizado."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (content) {
          const result = JSON.parse(content) as PerfumeProfile;
          
          // Validar que el ID del perfume esté en la lista disponible
          if (!availablePerfumeIds.includes(result.recommendedPerfumeId)) {
            // Si la recomendación no es válida, usamos el primer perfume
            result.recommendedPerfumeId = availablePerfumeIds[0];
          }
          
          return result;
        } else {
          throw new Error("Respuesta vacía de OpenAI");
        }
      } catch (openaiError) {
        console.log("Error con OpenAI, intentando con Anthropic:", openaiError);
      }
    } else {
      console.log("Cliente de OpenAI no disponible, intentando con Anthropic");
    }
    
    // Si OpenAI falla o no está disponible, intentamos con Anthropic
    if (anthropic) {
      try {
        const prompt = `
        Eres un experto en perfumería y psicología especializado en recomendaciones de fragancias. Necesitas analizar el perfil y preferencias de un usuario para sugerir el perfume perfecto.

        Preferencias del usuario:
        - Género: ${gender}
        - Edad: ${preferences.age}
        - Experiencia con perfumes: ${preferences.experience}
        - Ocasión para usar el perfume: ${preferences.occasion}
        - Fragancias preferidas: ${preferences.preferences}

        Basándote en esta información:
        1. Crea un breve perfil psicológico del usuario (3-4 oraciones).
        2. Selecciona un ID de perfume de esta lista que mejor se adapte a su perfil: ${JSON.stringify(availablePerfumeIds)}
        3. Proporciona una razón para tu recomendación que conecte su psicología con la fragancia (2-3 oraciones).

        Responde con un JSON válido que contenga los siguientes campos:
        psychologicalProfile, recommendedPerfumeId, recommendationReason
        `;

        const response = await anthropic.messages.create({
          model: "claude-3-sonnet-20240229", // Usando un modelo disponible
          max_tokens: 1000,
          system: "Eres un experto en perfumería y psicología especializado en recomendaciones de fragancias. Tu análisis es siempre reflexivo y personalizado.",
          messages: [
            { role: "user", content: prompt }
          ],
        });

        // Extraemos el JSON de la respuesta
        let jsonStr = '{}';
        const firstContent = response.content[0];
        if (firstContent.type === 'text') {
          const content = firstContent.text;
          const jsonStart = content.indexOf('{');
          const jsonEnd = content.lastIndexOf('}') + 1;
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            jsonStr = content.substring(jsonStart, jsonEnd);
          }
        }
        
        const result = JSON.parse(jsonStr) as PerfumeProfile;
        
        // Validar que el ID del perfume esté en la lista disponible
        if (!availablePerfumeIds.includes(result.recommendedPerfumeId)) {
          result.recommendedPerfumeId = availablePerfumeIds[0];
        }
        
        return result;
      } catch (anthropicError) {
        console.log("Error con Anthropic, usando respuestas predefinidas:", anthropicError);
      }
    } else {
      console.log("Cliente de Anthropic no disponible, usando respuestas predefinidas");
    }
    
    // Si llegamos aquí, ambos servicios fallaron o no están disponibles
    throw new Error("Fallaron todos los servicios de IA o no están disponibles");
  } catch (error) {
    console.error("Error generando perfil de perfume:", error);
    
    // Fallback a lógica simple para seleccionar un perfume basado en preferencias
    let recommendedPerfumeId = availablePerfumeIds[0]; // Default al primero
    
    // Selección básica basada en edad y ocasión
    if (preferences.age.includes("joven") || parseInt(preferences.age) < 30) {
      recommendedPerfumeId = availablePerfumeIds[0];
    } else if (preferences.occasion.includes("formal") || preferences.occasion.includes("trabajo")) {
      recommendedPerfumeId = availablePerfumeIds.length > 1 ? availablePerfumeIds[1] : availablePerfumeIds[0];
    } else if (preferences.preferences.includes("dulce") || preferences.preferences.includes("floral")) {
      recommendedPerfumeId = availablePerfumeIds.length > 2 ? availablePerfumeIds[2] : availablePerfumeIds[0];
    }
    
    // Perfiles psicológicos predefinidos
    const profiles = {
      joven: "Eres una persona dinámica y espontánea que busca experiencias nuevas. Valoras la libertad y la autenticidad en tus relaciones. Tu personalidad vibrante atrae a los demás naturalmente.",
      adulto: "Tienes una personalidad equilibrada con un fuerte sentido de ti mismo. Valoras la calidad y la elegancia en todos los aspectos de tu vida. Tu presencia transmite confianza y sofisticación.",
      formal: "Eres metódico y organizado, con un enfoque estructurado en la vida. Valoras la puntualidad y la responsabilidad. Tu atención al detalle te distingue en entornos profesionales."
    };
    
    // Razones de recomendación predefinidas
    const reasons = {
      joven: "Esta fragancia captura tu espíritu libre y dinámico con notas frescas y energizantes. Su composición moderna refleja tu personalidad contemporánea.",
      adulto: "Este perfume sofisticado complementa tu personalidad equilibrada con una mezcla armoniosa de notas. Su elegancia atemporal refuerza tu presencia distinguida.",
      formal: "La estructura clásica de esta fragancia se alinea con tu personalidad metódica. Sus notas equilibradas proyectan profesionalismo y confiabilidad."
    };
    
    // Determinar qué perfil usar basado en edad y preferencias
    let profileType: 'joven' | 'adulto' | 'formal' = "adulto"; // predeterminado
    if (preferences.age.includes("joven") || parseInt(preferences.age) < 30) {
      profileType = "joven";
    } else if (preferences.occasion.includes("formal") || preferences.occasion.includes("trabajo")) {
      profileType = "formal";
    }
    
    return {
      psychologicalProfile: profiles[profileType],
      recommendedPerfumeId: recommendedPerfumeId,
      recommendationReason: reasons[profileType]
    };
  }
}

export async function generateChatResponse(
  step: number,
  gender: string,
  previousMessage?: string
): Promise<string> {
  console.log("Generando respuesta para paso:", step, "género:", gender);
  
  try {
    // Primero intentamos usar OpenAI
    if (openai) {
      try {
        const prompt = `
        Eres un asistente virtual de una tienda de perfumes llamada AROMASENS. Estás manteniendo una conversación con un cliente para recomendarle el perfume perfecto.
        
        El cliente está buscando fragancias ${gender === 'femenino' ? 'femeninas' : 'masculinas'}.
        
        Estás actualmente en el paso ${step} de la conversación.
        
        ${previousMessage ? `El último mensaje del cliente fue: "${previousMessage}"` : ''}
        
        Basado en el paso actual, responde con un mensaje apropiado:
        
        Paso 0: Preséntate y pregunta por la edad del cliente.
        Paso 1: Pregunta sobre su experiencia con perfumes y sus favoritos.
        Paso 2: Pregunta sobre las ocasiones para las que quiere el perfume.
        Paso 3: Pregunta sobre sus notas o tipos de fragancias preferidas.
        Paso 4: Agradece sus respuestas y hazle saber que le proporcionarás una recomendación.
        
        Tu respuesta debe ser conversacional, amistosa y en español. No uses pasos numerados en tu respuesta.
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Eres un asistente amigable de tienda de perfumes. Mantén tus respuestas concisas, útiles y en español."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        });

        if (response.choices[0].message.content) {
          return response.choices[0].message.content;
        } else {
          throw new Error("Respuesta vacía de OpenAI");
        }
      } catch (openaiError) {
        console.log("Error con OpenAI, intentando con Anthropic:", openaiError);
      }
    } else {
      console.log("Cliente de OpenAI no disponible, intentando con Anthropic");
    }
      
    // Si OpenAI falla o no está disponible, intentamos con Anthropic
    if (anthropic) {
      try {
        const prompt = `
        Eres un asistente virtual de una tienda de perfumes llamada AROMASENS. Estás manteniendo una conversación con un cliente para recomendarle el perfume perfecto.
        
        El cliente está buscando fragancias ${gender === 'femenino' ? 'femeninas' : 'masculinas'}.
        
        Estás actualmente en el paso ${step} de la conversación.
        
        ${previousMessage ? `El último mensaje del cliente fue: "${previousMessage}"` : ''}
        
        Basado en el paso actual, responde con un mensaje apropiado:
        
        Paso 0: Preséntate y pregunta por la edad del cliente.
        Paso 1: Pregunta sobre su experiencia con perfumes y sus favoritos.
        Paso 2: Pregunta sobre las ocasiones para las que quiere el perfume.
        Paso 3: Pregunta sobre sus notas o tipos de fragancias preferidas.
        Paso 4: Agradece sus respuestas y hazle saber que le proporcionarás una recomendación.
        
        Tu respuesta debe ser conversacional, amistosa y en español. No uses pasos numerados en tu respuesta.
        `;

        const response = await anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1000,
          system: "Eres un asistente amigable de tienda de perfumes. Mantén tus respuestas concisas, útiles y en español.",
          messages: [
            { role: "user", content: prompt }
          ],
        });

        const firstContent = response.content[0];
        if (firstContent.type === 'text') {
          return firstContent.text;
        } else {
          throw new Error("Respuesta no textual de Anthropic");
        }
      } catch (anthropicError) {
        console.log("Error con Anthropic, usando respuestas predefinidas:", anthropicError);
      }
    } else {
      console.log("Cliente de Anthropic no disponible, usando respuestas predefinidas");
    }
    
    // Si llegamos aquí, ambos servicios fallaron o no están disponibles
    throw new Error("Fallaron todos los servicios de IA o no están disponibles");
  } catch (error) {
    console.error("Error generando respuesta de chat:", error);
    
    // Fallback a respuestas predefinidas
    // Respuestas predefinidas para cada paso del chat
    const responses: {
      masculine: { [key: number]: string };
      feminine: { [key: number]: string };
    } = {
      masculine: {
        0: "¡Hola! Soy el asistente virtual de AROMASENS, especializado en fragancias masculinas. Para ayudarte a encontrar el perfume perfecto, me gustaría conocerte mejor. ¿Podrías decirme tu edad?",
        1: "Gracias por compartir eso. Ahora, me gustaría saber sobre tu experiencia con perfumes. ¿Has usado colonias o perfumes antes? ¿Tienes alguna marca o fragancia favorita?",
        2: "Excelente. Para recomendar el perfume ideal, necesito saber para qué ocasiones lo usarías principalmente. ¿Es para el trabajo, eventos especiales, uso diario o alguna ocasión específica?",
        3: "Ya casi tenemos toda la información. Por último, ¿qué tipo de fragancias te atraen más? Por ejemplo: amaderadas, cítricas, especiadas, frescas, orientales...",
        4: "¡Perfecto! Gracias por compartir tus preferencias. Con esta información, puedo recomendarte el perfume ideal para ti. Dame un momento mientras analizo las opciones más adecuadas para tu perfil."
      },
      feminine: {
        0: "¡Hola! Soy el asistente virtual de AROMASENS, especializado en fragancias femeninas. Me encantaría ayudarte a encontrar tu perfume ideal. Para empezar, ¿podrías decirme tu edad?",
        1: "Gracias por compartir eso. Ahora, cuéntame sobre tu experiencia con perfumes. ¿Has usado perfumes regularmente? ¿Tienes alguna fragancia favorita que hayas usado antes?",
        2: "Genial. Para encontrar el perfume perfecto para ti, necesito saber en qué ocasiones lo usarías principalmente. ¿Es para eventos formales, trabajo, citas románticas, uso diario...?",
        3: "Estamos a un paso de encontrar tu fragancia ideal. Por último, ¿qué tipo de aromas prefieres? Por ejemplo: florales, frutales, dulces, cítricos, orientales...",
        4: "¡Excelente! Con toda esta información, puedo recomendarte el perfume que mejor se adapte a tu personalidad y preferencias. Dame un momento mientras busco la opción perfecta para ti."
      }
    };
    
    const genderType = gender === 'femenino' ? 'feminine' : 'masculine';
    
    // Devolver respuesta según el paso
    if (step >= 0 && step <= 4) {
      return responses[genderType][step];
    } else {
      return "Gracias por toda la información. Estoy procesando tu recomendación personalizada.";
    }
  }
}
