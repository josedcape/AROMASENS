import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  handleStartChat, 
  handleSendMessage, 
  handleGetRecommendation 
} from "./controllers/chatController";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/perfumes/:gender", async (req, res) => {
    try {
      const { gender } = req.params;
      if (gender !== "femenino" && gender !== "masculino") {
        return res.status(400).json({ message: "Invalid gender parameter" });
      }
      
      const perfumes = await storage.getPerfumes(gender);
      res.json(perfumes);
    } catch (error) {
      console.error("Error fetching perfumes:", error);
      res.status(500).json({ message: "Failed to fetch perfumes" });
    }
  });

  app.get("/api/perfume/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid perfume ID" });
      }
      
      const perfume = await storage.getPerfume(id);
      if (!perfume) {
        return res.status(404).json({ message: "Perfume not found" });
      }
      
      res.json(perfume);
    } catch (error) {
      console.error("Error fetching perfume:", error);
      res.status(500).json({ message: "Failed to fetch perfume" });
    }
  });

  // Chat routes
  app.post("/api/chat/start", handleStartChat);
  app.post("/api/chat/message", handleSendMessage);
  app.post("/api/chat/recommendation", handleGetRecommendation);

  const httpServer = createServer(app);

  return httpServer;
}
