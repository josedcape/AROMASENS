import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const perfumes = pgTable("perfumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  gender: text("gender").notNull(), // "femenino" or "masculino"
  image_url: text("image_url").notNull(),
  notes: text("notes").array().notNull(),
  occasions: text("occasions").array().notNull(),
  profile_tags: text("profile_tags").array().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  gender: text("gender").notNull(), // "femenino" or "masculino"
  preferences: jsonb("preferences").notNull(),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  chat_session_id: integer("chat_session_id").references(() => chatSessions.id).notNull(),
  perfume_id: integer("perfume_id").references(() => perfumes.id).notNull(),
  reason: text("reason").notNull(),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPerfumeSchema = createInsertSchema(perfumes).pick({
  name: true,
  brand: true,
  description: true,
  gender: true,
  image_url: true,
  notes: true,
  occasions: true,
  profile_tags: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  user_id: true,
  gender: true,
  preferences: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  chat_session_id: true,
  perfume_id: true,
  reason: true,
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPerfume = z.infer<typeof insertPerfumeSchema>;
export type Perfume = typeof perfumes.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

// Chat related schemas
export const chatPreferencesSchema = z.object({
  age: z.string(),
  experience: z.string(),
  occasion: z.string(),
  preferences: z.string(),
});

export type ChatPreferences = z.infer<typeof chatPreferencesSchema>;

// API schemas
export const startChatSchema = z.object({
  gender: z.string().refine(val => val === "femenino" || val === "masculino", {
    message: "Gender must be 'femenino' or 'masculino'"
  })
});

export const sendMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, "Message cannot be empty"),
  gender: z.string().optional(),
  step: z.number().optional()
});

export const chatResponseSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string(),
  quickResponses: z.array(z.string()).optional(),
  step: z.number().optional(),
  isComplete: z.boolean().optional(),
  recommendation: z.object({
    perfumeId: z.number().optional(),
    brand: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    notes: z.array(z.string()).optional(),
    occasions: z.string().optional(),
  }).optional()
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
