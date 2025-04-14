import { 
  users, type User, type InsertUser, 
  friends, type Friend, type InsertFriend,
  chats, type Chat, type InsertChat,
  chatParticipants, type ChatParticipant, type InsertChatParticipant,
  messages, type Message, type InsertMessage,
  files, type File, type InsertFile
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Expanded storage interface with all needed CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(address: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Friend operations
  getFriend(userId: number, friendId: number): Promise<Friend | undefined>;
  getFriendsByUserId(userId: number): Promise<Friend[]>;
  createFriend(friend: InsertFriend): Promise<Friend>;
  updateFriendStatus(userId: number, friendId: number, status: string): Promise<Friend | undefined>;
  
  // Chat operations
  getChat(id: number): Promise<Chat | undefined>;
  getChatByParticipants(participant1Id: number, participant2Id: number): Promise<Chat | undefined>;
  getUserChats(userId: number): Promise<Chat[]>;
  createChat(chat: InsertChat, participants: InsertChatParticipant[]): Promise<Chat>;
  updateChatLastMessage(chatId: number, timestamp: Date): Promise<void>;
  
  // Chat participants operations
  getChatParticipants(chatId: number): Promise<ChatParticipant[]>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  removeChatParticipant(chatId: number, userId: number): Promise<void>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getChatMessages(chatId: number, limit: number, offset: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFileByHash(fileHash: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  
  // Session store for authentication
  sessionStore: any; // Using any for now to avoid TypeScript errors
}

// Database implementation of our storage interface
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // In our model, we're using address instead of username
    // This method is kept for interface compatibility
    const [user] = await db.select().from(users).where(eq(users.address, username));
    return user;
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.address, address));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        // Make sure displayName is properly initialized
        displayName: insertUser.displayName || null,
        // Make sure ENS name is properly initialized
        ensName: insertUser.ensName || null
      })
      .returning();
    return user;
  }

  async updateUser(address: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.address, address))
      .returning();
    return updatedUser;
  }
  
  // Friend operations
  async getFriend(userId: number, friendId: number): Promise<Friend | undefined> {
    const [friend] = await db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.friendId, friendId)
        )
      );
    return friend;
  }
  
  async getFriendsByUserId(userId: number): Promise<Friend[]> {
    return await db
      .select()
      .from(friends)
      .where(eq(friends.userId, userId));
  }
  
  async createFriend(friend: InsertFriend): Promise<Friend> {
    const [newFriend] = await db
      .insert(friends)
      .values(friend)
      .returning();
    return newFriend;
  }
  
  async updateFriendStatus(userId: number, friendId: number, status: string): Promise<Friend | undefined> {
    const [updatedFriend] = await db
      .update(friends)
      .set({ status })
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.friendId, friendId)
        )
      )
      .returning();
    return updatedFriend;
  }
  
  // Chat operations
  async getChat(id: number): Promise<Chat | undefined> {
    const [chat] = await db
      .select()
      .from(chats)
      .where(eq(chats.id, id));
    return chat;
  }
  
  async getChatByParticipants(participant1Id: number, participant2Id: number): Promise<Chat | undefined> {
    // For direct chats between two participants
    const chatIds = await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(
        eq(chatParticipants.userId, participant1Id)
      );
    
    if (chatIds.length === 0) return undefined;
    
    const chatIdValues = chatIds.map(row => row.chatId);
    
    // Find chats where both participants are members and it's not a group chat
    const [chat] = await db
      .select()
      .from(chats)
      .innerJoin(
        chatParticipants,
        and(
          eq(chats.id, chatParticipants.chatId),
          eq(chatParticipants.userId, participant2Id),
          inArray(chatParticipants.chatId, chatIdValues),
          eq(chats.isGroup, false)
        )
      );
    
    return chat?.chats;
  }
  
  async getUserChats(userId: number): Promise<Chat[]> {
    const result = await db
      .select({
        chat: chats
      })
      .from(chatParticipants)
      .innerJoin(chats, eq(chatParticipants.chatId, chats.id))
      .where(eq(chatParticipants.userId, userId))
      .orderBy(desc(chats.lastMessageTime));
    
    return result.map(row => row.chat);
  }
  
  async createChat(chat: InsertChat, participants: InsertChatParticipant[]): Promise<Chat> {
    // Insert the chat first
    const [newChat] = await db
      .insert(chats)
      .values(chat)
      .returning();
    
    // Then add all participants
    for (const participant of participants) {
      await db
        .insert(chatParticipants)
        .values({
          ...participant,
          chatId: newChat.id
        });
    }
    
    return newChat;
  }
  
  async updateChatLastMessage(chatId: number, timestamp: Date): Promise<void> {
    await db
      .update(chats)
      .set({ lastMessageTime: timestamp })
      .where(eq(chats.id, chatId));
  }
  
  // Chat participants operations
  async getChatParticipants(chatId: number): Promise<ChatParticipant[]> {
    return await db
      .select()
      .from(chatParticipants)
      .where(eq(chatParticipants.chatId, chatId));
  }
  
  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    const [newParticipant] = await db
      .insert(chatParticipants)
      .values(participant)
      .returning();
    return newParticipant;
  }
  
  async removeChatParticipant(chatId: number, userId: number): Promise<void> {
    await db
      .delete(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatId, chatId),
          eq(chatParticipants.userId, userId)
        )
      );
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }
  
  async getChatMessages(chatId: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.timestamp))
      .limit(limit)
      .offset(offset);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    // Update the chat's last message time
    await this.updateChatLastMessage(message.chatId, message.timestamp);
    
    return newMessage;
  }
  
  // File operations
  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, id));
    return file;
  }
  
  async getFileByHash(fileHash: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.fileHash, fileHash));
    return file;
  }
  
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }
}

// Create and export a single instance of the database storage
export const storage = new DatabaseStorage();
