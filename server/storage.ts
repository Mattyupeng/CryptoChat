import { users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(address: string, updates: Partial<InsertUser>): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // In our model, we're using address instead of username
    // This method is kept for interface compatibility
    return Array.from(this.users.values()).find(
      (user) => user.address === username,
    );
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.address === address,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      // Make sure displayName is properly initialized
      displayName: insertUser.displayName || null,
      // Make sure ENS name is properly initialized
      ensName: insertUser.ensName || null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(address: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUserByAddress(address);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
    };
    
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();
