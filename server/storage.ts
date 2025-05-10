import { 
  users, perfumes, chatSessions, recommendations,
  type User, type InsertUser,
  type Perfume, type InsertPerfume,
  type ChatSession, type InsertChatSession,
  type Recommendation, type InsertRecommendation,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Perfume operations
  getPerfumes(gender: string): Promise<Perfume[]>;
  getPerfume(id: number): Promise<Perfume | undefined>;
  createPerfume(perfume: InsertPerfume): Promise<Perfume>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  
  // Recommendation operations
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getRecommendationsBySession(sessionId: number): Promise<Recommendation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private perfumes: Map<number, Perfume>;
  private chatSessions: Map<number, ChatSession>;
  private recommendations: Map<number, Recommendation>;
  currentUserId: number;
  currentPerfumeId: number;
  currentChatSessionId: number;
  currentRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.perfumes = new Map();
    this.chatSessions = new Map();
    this.recommendations = new Map();
    this.currentUserId = 1;
    this.currentPerfumeId = 1;
    this.currentChatSessionId = 1;
    this.currentRecommendationId = 1;
    
    // Initialize with some sample perfumes
    this.initializePerfumes();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Perfume operations
  async getPerfumes(gender: string): Promise<Perfume[]> {
    return Array.from(this.perfumes.values()).filter(
      (perfume) => perfume.gender === gender
    );
  }

  async getPerfume(id: number): Promise<Perfume | undefined> {
    return this.perfumes.get(id);
  }

  async createPerfume(insertPerfume: InsertPerfume): Promise<Perfume> {
    const id = this.currentPerfumeId++;
    const perfume: Perfume = { ...insertPerfume, id };
    this.perfumes.set(id, perfume);
    return perfume;
  }

  // Chat session operations
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentChatSessionId++;
    const session: ChatSession = { ...insertSession, id };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  // Recommendation operations
  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentRecommendationId++;
    const recommendation: Recommendation = { ...insertRecommendation, id };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getRecommendationsBySession(sessionId: number): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(
      (recommendation) => recommendation.chat_session_id === sessionId
    );
  }
  
  private initializePerfumes() {
    // Female perfumes
    const femininePerfumes: InsertPerfume[] = [
      {
        name: "Jardin de Fleurs",
        brand: "Maison Elégance",
        description: "Una fragancia sofisticada y femenina con notas de jazmín, rosa y vainilla. Refleja una personalidad elegante y romántica.",
        gender: "femenino",
        image_url: "https://images.unsplash.com/photo-1595457730125-2f194d8d1db1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
        notes: ["Jazmín", "Rosa", "Vainilla", "Ámbar"],
        occasions: ["Eventos formales", "Citas románticas", "Reuniones sociales"],
        profile_tags: ["Elegante", "Romántica", "Sofisticada", "Sensual"]
      },
      {
        name: "Velvet Dream",
        brand: "Lumine",
        description: "Fragancia dulce con notas florales y toques de vainilla. Ideal para las mujeres que buscan un aroma sutil pero memorable.",
        gender: "femenino",
        image_url: "https://pixabay.com/get/g61d4c27ac8f6d782356cdf37ec0fd86b415b43d3c7d4c86229a92a653550f1b248810cae8ae58bde543c1865bfe0dda6a2713ac8d8736c71d100e9a975510ee0_1280.jpg",
        notes: ["Vainilla", "Flores blancas", "Almizcle", "Sándalo"],
        occasions: ["Uso diario", "Trabajo", "Eventos casuales"],
        profile_tags: ["Dulce", "Suave", "Alegre", "Moderna"]
      },
      {
        name: "Spring Bouquet",
        brand: "Floralie",
        description: "Fragancia fresca con notas cítricas y florales ligeras. Perfecta para mujeres de espíritu libre y amantes de la naturaleza.",
        gender: "femenino",
        image_url: "https://images.unsplash.com/photo-1617897903246-719242758050?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        notes: ["Bergamota", "Azahar", "Lirio", "Jazmín", "Almizcle blanco"],
        occasions: ["Uso diario", "Actividades al aire libre", "Primavera/Verano"],
        profile_tags: ["Fresca", "Juvenil", "Natural", "Espontánea"]
      }
    ];
    
    // Male perfumes
    const masculinePerfumes: InsertPerfume[] = [
      {
        name: "Ébano Intenso",
        brand: "Noble Woods",
        description: "Una fragancia masculina con carácter, notas de madera de cedro, cuero y ámbar. Proyecta confianza y distinción.",
        gender: "masculino",
        image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
        notes: ["Cedro", "Cuero", "Ámbar", "Pimienta negra"],
        occasions: ["Eventos formales", "Negocios", "Noches de gala"],
        profile_tags: ["Elegante", "Confiado", "Sofisticado", "Poderoso"]
      },
      {
        name: "Midnight Essence",
        brand: "Noir Collection",
        description: "Aroma intenso con notas amaderadas y especiadas. Para hombres de carácter fuerte y personalidad misteriosa.",
        gender: "masculino",
        image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        notes: ["Cardamomo", "Pachulí", "Oud", "Sándalo", "Vainilla"],
        occasions: ["Ocasiones especiales", "Citas románticas", "Noches"],
        profile_tags: ["Misterioso", "Intenso", "Cautivador", "Sensual"]
      },
      {
        name: "Aqua Vitae",
        brand: "Marine Elements",
        description: "Fragancia fresca y vigorizante con notas marinas y cítricas. Para hombres dinámicos y aventureros.",
        gender: "masculino",
        image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
        notes: ["Limón", "Sal marina", "Menta", "Almizcle", "Madera de teca"],
        occasions: ["Uso diario", "Deportes", "Actividades al aire libre"],
        profile_tags: ["Activo", "Moderno", "Refrescante", "Dinámico"]
      }
    ];
    
    // Add perfumes to storage
    [...femininePerfumes, ...masculinePerfumes].forEach(perfume => {
      this.createPerfume(perfume);
    });
  }
}

export const storage = new MemStorage();
