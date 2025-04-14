import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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

export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chatParticipants),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
}));

// Friend relationships
export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  friendId: integer("friendId").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, {
    fields: [friends.userId],
    references: [users.id],
  }),
  friend: one(users, {
    fields: [friends.friendId],
    references: [users.id],
  }),
}));

// Chats table (supports both direct and group chats)
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  name: text("name"), // Used for group chats
  isGroup: boolean("isGroup").notNull().default(false),
  avatarColor: text("avatarColor"), // Optional avatar color for group
  createdById: integer("createdById").references(() => users.id).notNull(),
  lastMessageTime: timestamp("lastMessageTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const chatsRelations = relations(chats, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [chats.createdById],
    references: [users.id],
  }),
  participants: many(chatParticipants),
  messages: many(messages),
}));

// Chat participants (for both direct and group chats)
export const chatParticipants = pgTable("chat_participants", {
  chatId: integer("chatId").references(() => chats.id).notNull(),
  userId: integer("userId").references(() => users.id).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  isAdmin: boolean("isAdmin").default(false),
}, (table) => {
  return {
    pk: primaryKey(table.chatId, table.userId),
  };
});

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  chat: one(chats, {
    fields: [chatParticipants.chatId],
    references: [chats.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

// Messages table (only metadata, not content)
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chatId").references(() => chats.id).notNull(),
  senderId: integer("senderId").references(() => users.id).notNull(),
  messageType: text("messageType").notNull().default("text"), // text, file, transaction
  metadata: json("metadata").$type<{
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileHash?: string;
    transactionHash?: string;
    amount?: string;
    token?: string;
    chain?: string;
  }>(),
  timestamp: timestamp("timestamp").notNull(),
  encrypted: boolean("encrypted").notNull().default(true),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
}));

// Files metadata table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  messageId: integer("messageId").references(() => messages.id).notNull(),
  uploaderId: integer("uploaderId").references(() => users.id).notNull(),
  fileHash: text("fileHash").notNull(),
  encryptionKey: text("encryptionKey"), // Encrypted using recipient's public key
  fileName: text("fileName").notNull(),
  fileSize: integer("fileSize").notNull(),
  fileType: text("fileType").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one }) => ({
  message: one(messages, {
    fields: [files.messageId],
    references: [messages.id],
  }),
  uploader: one(users, {
    fields: [files.uploaderId],
    references: [users.id],
  }),
}));

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
  lastMessageTime: true,
}).extend({
  name: z.string().optional(),
  isGroup: z.boolean().default(false),
  avatarColor: z.string().optional(),
});

export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({
  joinedAt: true,
}).extend({
  isAdmin: z.boolean().default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
}).extend({
  messageType: z.enum(['text', 'file', 'transaction']).default('text'),
  metadata: z.object({
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    fileType: z.string().optional(),
    fileHash: z.string().optional(),
    transactionHash: z.string().optional(),
    amount: z.string().optional(),
    token: z.string().optional(),
    chain: z.string().optional(),
  }).optional(),
  timestamp: z.date().or(z.number().transform(n => new Date(n))),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Friend = typeof friends.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;

export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
