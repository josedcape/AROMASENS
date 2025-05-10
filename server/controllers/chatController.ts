import { Request, Response } from "express";
import { 
  sendMessageSchema, 
  chatPreferencesSchema,
  startChatSchema
} from "@shared/schema";
import { startChatSession, processUserMessage, generateRecommendation } from "../services/perfumeService";

export async function handleStartChat(req: Request, res: Response) {
  try {
    const { gender } = startChatSchema.parse(req.body);
    
    const response = await startChatSession(gender);
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(400).json({ message: error.message || "Failed to start chat" });
  }
}

export async function handleSendMessage(req: Request, res: Response) {
  try {
    const { message, gender, step } = sendMessageSchema.parse(req.body);
    
    if (!gender || step === undefined) {
      return res.status(400).json({ message: "Gender and step are required" });
    }
    
    const response = await processUserMessage(message, gender, step);
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(400).json({ message: error.message || "Failed to process message" });
  }
}

export async function handleGetRecommendation(req: Request, res: Response) {
  try {
    const { gender, age, experience, occasion, preferences } = req.body;
    
    // Validate the chat preferences
    const validatedPreferences = chatPreferencesSchema.parse({
      age,
      experience,
      occasion,
      preferences
    });
    
    const recommendation = await generateRecommendation(gender, validatedPreferences);
    
    res.status(200).json(recommendation);
  } catch (error) {
    console.error("Error generating recommendation:", error);
    res.status(400).json({ message: error.message || "Failed to generate recommendation" });
  }
}
