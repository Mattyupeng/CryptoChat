import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  publicKey: text("publicKey").notNull(),
  ensName: text("ensName"),
  displayName: text("displayName"),
  lastSeen: timestamp("lastSeen").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Friend relationships
export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  friendId: integer("friendId").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Chat metadata (no message content stored in DB)
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  participant1Id: integer("participant1Id").references(() => users.id).notNull(),
  participant2Id: integer("participant2Id").references(() => users.id).notNull(),
  lastMessageTime: timestamp("lastMessageTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Message metadata (only metadata, not content)
export const messageMetadata = pgTable("messageMetadata", {
  id: serial("id").primaryKey(),
  chatId: integer("chatId").references(() => chats.id).notNull(),
  senderId: integer("senderId").references(() => users.id).notNull(),
  recipientId: integer("recipientId").references(() => users.id).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  transactionHash: text("transactionHash"),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  address: z.string().min(1).max(255),
  publicKey: z.string().min(1),
  lastSeen: z.date().or(z.number().transform(n => new Date(n))),
});

export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
  createdAt: true,
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true,
});

export const insertMessageMetadataSchema = createInsertSchema(messageMetadata).omit({
  id: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Friend = typeof friends.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;

export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type MessageMetadata = typeof messageMetadata.$inferSelect;
export type InsertMessageMetadata = z.infer<typeof insertMessageMetadataSchema>;
