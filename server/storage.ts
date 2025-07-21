import {
  users,
  devices,
  collections,
  bookmarks,
  importHistory,
  type User,
  type InsertUser,
  type UpsertUser,
  type Device,
  type InsertDevice,
  type Collection,
  type InsertCollection,
  type Bookmark,
  type InsertBookmark,
  type ImportHistory,
  type InsertImportHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Device operations
  getUserDevices(userId: string): Promise<Device[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDeviceStatus(deviceId: number, isOnline: boolean): Promise<void>;
  
  // Collection operations
  getUserCollections(userId: string): Promise<Collection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: number, collection: Partial<InsertCollection>): Promise<Collection>;
  deleteCollection(id: number): Promise<void>;
  
  // Bookmark operations
  getUserBookmarks(userId: string, limit?: number): Promise<(Bookmark & { device?: Device; collection?: Collection })[]>;
  getBookmarksByCollection(collectionId: number): Promise<Bookmark[]>;
  searchBookmarks(userId: string, query: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  updateBookmark(id: number, bookmark: Partial<InsertBookmark>): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<void>;
  bulkCreateBookmarks(bookmarks: InsertBookmark[]): Promise<Bookmark[]>;
  
  // Import history operations
  createImportHistory(importRecord: InsertImportHistory): Promise<ImportHistory>;
  getUserImportHistory(userId: string): Promise<ImportHistory[]>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    totalBookmarks: number;
    connectedDevices: number;
    collections: number;
    lastSync: Date | null;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const userId = userData.id || `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const [user] = await db
      .insert(users)
      .values({ ...userData, id: userId })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserDevices(userId: string): Promise<Device[]> {
    return await db
      .select()
      .from(devices)
      .where(eq(devices.userId, userId))
      .orderBy(desc(devices.lastSyncAt));
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const [newDevice] = await db.insert(devices).values(device).returning();
    return newDevice;
  }

  async updateDeviceStatus(deviceId: number, isOnline: boolean): Promise<void> {
    await db
      .update(devices)
      .set({ isOnline, lastSyncAt: new Date() })
      .where(eq(devices.id, deviceId));
  }

  async getUserCollections(userId: string): Promise<Collection[]> {
    return await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(collections.name);
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [newCollection] = await db
      .insert(collections)
      .values(collection)
      .returning();
    return newCollection;
  }

  async updateCollection(id: number, collection: Partial<InsertCollection>): Promise<Collection> {
    const [updatedCollection] = await db
      .update(collections)
      .set(collection)
      .where(eq(collections.id, id))
      .returning();
    return updatedCollection;
  }

  async deleteCollection(id: number): Promise<void> {
    await db.delete(collections).where(eq(collections.id, id));
  }

  async getUserBookmarks(userId: string, limit = 50): Promise<(Bookmark & { device?: Device; collection?: Collection })[]> {
    const result = await db
      .select({
        bookmark: bookmarks,
        device: devices,
        collection: collections,
      })
      .from(bookmarks)
      .leftJoin(devices, eq(bookmarks.deviceId, devices.id))
      .leftJoin(collections, eq(bookmarks.collectionId, collections.id))
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isDeleted, false)))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.bookmark,
      device: row.device || undefined,
      collection: row.collection || undefined,
    }));
  }

  async getBookmarksByCollection(collectionId: number): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.collectionId, collectionId), eq(bookmarks.isDeleted, false)))
      .orderBy(desc(bookmarks.createdAt));
  }

  async searchBookmarks(userId: string, query: string): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.isDeleted, false),
          sql`(${bookmarks.title} ILIKE ${`%${query}%`} OR ${bookmarks.description} ILIKE ${`%${query}%`} OR ${bookmarks.url} ILIKE ${`%${query}%`})`
        )
      )
      .orderBy(desc(bookmarks.createdAt));
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const [newBookmark] = await db.insert(bookmarks).values(bookmark).returning();
    return newBookmark;
  }

  async updateBookmark(id: number, bookmark: Partial<InsertBookmark>): Promise<Bookmark> {
    const [updatedBookmark] = await db
      .update(bookmarks)
      .set({ ...bookmark, updatedAt: new Date() })
      .where(eq(bookmarks.id, id))
      .returning();
    return updatedBookmark;
  }

  async deleteBookmark(id: number): Promise<void> {
    await db
      .update(bookmarks)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(bookmarks.id, id));
  }

  async bulkCreateBookmarks(bookmarkList: InsertBookmark[]): Promise<Bookmark[]> {
    if (bookmarkList.length === 0) return [];
    return await db.insert(bookmarks).values(bookmarkList).returning();
  }

  async createImportHistory(importRecord: InsertImportHistory): Promise<ImportHistory> {
    const [newImport] = await db
      .insert(importHistory)
      .values(importRecord)
      .returning();
    return newImport;
  }

  async getUserImportHistory(userId: string): Promise<ImportHistory[]> {
    return await db
      .select()
      .from(importHistory)
      .where(eq(importHistory.userId, userId))
      .orderBy(desc(importHistory.createdAt));
  }

  async getUserStats(userId: string): Promise<{
    totalBookmarks: number;
    connectedDevices: number;
    collections: number;
    lastSync: Date | null;
  }> {
    const [bookmarkCount] = await db
      .select({ count: count() })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isDeleted, false)));

    const [deviceCount] = await db
      .select({ count: count() })
      .from(devices)
      .where(eq(devices.userId, userId));

    const [collectionCount] = await db
      .select({ count: count() })
      .from(collections)
      .where(eq(collections.userId, userId));

    const [lastSyncDevice] = await db
      .select({ lastSyncAt: devices.lastSyncAt })
      .from(devices)
      .where(eq(devices.userId, userId))
      .orderBy(desc(devices.lastSyncAt))
      .limit(1);

    return {
      totalBookmarks: bookmarkCount.count,
      connectedDevices: deviceCount.count,
      collections: collectionCount.count,
      lastSync: lastSyncDevice?.lastSyncAt || null,
    };
  }
}

export const storage = new DatabaseStorage();
