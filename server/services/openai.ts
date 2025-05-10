import { type ChatPreferences } from "@shared/schema";

type PerfumeProfile = {
  psychologicalProfile: string;
  recommendedPerfumeId: number;
  recommendationReason: string;
};

// Implementación con respuestas predefinidas para funcionar sin API de OpenAI
export async function generatePerfumeProfile(
  gender: string,
  preferences: ChatPreferences,
  availablePerfumeIds: number[]
): Promise<PerfumeProfile> {
  try {
    console.log("Generando perfil de perfume para:", gender, preferences);
    
    // Lógica simple para seleccionar un perfume basado en preferencias
    let recommendedPerfumeId = availablePerfumeIds[0]; // Default al primero
    
    // Selección básica basada en edad y ocasión
    if (preferences.age.includes("joven") || parseInt(preferences.age) < 30) {
      // Personas jóvenes - primer perfume si está disponible
      recommendedPerfumeId = availablePerfumeIds[0];
    } else if (preferences.occasion.includes("formal") || preferences.occasion.includes("trabajo")) {
      // Ocasiones formales - segundo perfume si está disponible
      recommendedPerfumeId = availablePerfumeIds.length > 1 ? availablePerfumeIds[1] : availablePerfumeIds[0];
    } else if (preferences.preferences.includes("dulce") || preferences.preferences.includes("floral")) {
      // Preferencias dulces/florales - tercer perfume si está disponible
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
    let profileType = "adulto"; // predeterminado
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
  } catch (error) {
    console.error("Error generando perfil de perfume:", error);
    return {
      psychologicalProfile: "Eres una persona que valora la calidad y tiene un gusto refinado. Buscas expresar tu personalidad única a través de fragancias distintivas.",
      recommendedPerfumeId: availablePerfumeIds[0],
      recommendationReason: "Esta fragancia se alinea perfectamente con tu personalidad y preferencias. Sus notas distintivas complementarán tu estilo personal."
    };
  }
}

export async function generateChatResponse(
  step: number,
  gender: string,
  previousMessage?: string
): Promise<string> {
  console.log("Generando respuesta para paso:", step, "género:", gender);
  
  // Respuestas predefinidas para cada paso del chat
  const responses = {
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
