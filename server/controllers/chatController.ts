import { Request, Response } from "express";
import { 
  sendMessageSchema, 
  chatPreferencesSchema,
  startChatSchema
} from "@shared/schema";
import { startChatSession, processUserMessage, generateRecommendation } from "../services/perfumeService";
import { AIModel } from "../services/ai.service";

export async function handleStartChat(req: Request, res: Response) {
  try {
    const { gender, model = 'openai' } = req.body;
    
    // Validamos el género con el esquema
    const validatedData = startChatSchema.parse({ gender });
    
    // Validamos el modelo de IA
    const validModel = validateAIModel(model);
    
    // Iniciamos la sesión con el modelo seleccionado
    const response = await startChatSession(validatedData.gender, validModel);
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(400).json({ message: error.message || "Failed to start chat" });
  }
}

export async function handleSendMessage(req: Request, res: Response) {
  try {
    const { message, gender, step, model = 'openai' } = req.body;
    
    // Validamos los datos del mensaje
    const validatedData = sendMessageSchema.parse({ message, gender, step });
    
    if (!validatedData.gender || validatedData.step === undefined) {
      return res.status(400).json({ message: "Gender and step are required" });
    }
    
    // Validamos el modelo de IA
    const validModel = validateAIModel(model);
    
    // Procesamos el mensaje con el modelo seleccionado
    const response = await processUserMessage(
      validatedData.message, 
      validatedData.gender, 
      validatedData.step,
      validModel
    );
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(400).json({ message: error.message || "Failed to process message" });
  }
}

export async function handleGetRecommendation(req: Request, res: Response) {
  try {
    const { gender, age, experience, occasion, preferences, model = 'openai' } = req.body;
    
    // Validate the chat preferences
    const validatedPreferences = chatPreferencesSchema.parse({
      age,
      experience,
      occasion,
      preferences
    });
    
    // Validamos el modelo de IA
    const validModel = validateAIModel(model);
    
    // Generamos la recomendación con el modelo seleccionado
    const recommendation = await generateRecommendation(
      gender, 
      validatedPreferences,
      validModel
    );
    
    res.status(200).json(recommendation);
  } catch (error) {
    console.error("Error generating recommendation:", error);
    res.status(400).json({ message: error.message || "Failed to generate recommendation" });
  }
}

// Función auxiliar para validar el modelo de IA
function validateAIModel(model: string): AIModel {
  const validModels: AIModel[] = ['openai', 'anthropic', 'gemini'];
  
  if (!validModels.includes(model as AIModel)) {
    console.warn(`Modelo de IA inválido: ${model}, usando openai por defecto`);
    return 'openai';
  }
  
  return model as AIModel;
}
