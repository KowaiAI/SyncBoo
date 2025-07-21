import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { insertBookmarkSchema, insertCollectionSchema, insertDeviceSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { fromError } from "zod-validation-error";
import lusca from "lusca";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

// Absolute path to the uploads directory
const uploadsDir = path.resolve(__dirname, "../uploads");

/**
 * Validates that the given filePath is contained within the uploadsDir.
 * Returns true if valid, false otherwise.
 */
function validateFilePath(filePath: string, uploadsDir: string): boolean {
  try {
    const resolvedPath = fs.realpathSync(path.resolve(filePath));
    // Ensure uploadsDir is normalized and real
    const uploadsRealPath = fs.realpathSync(uploadsDir);
    return resolvedPath.startsWith(uploadsRealPath + path.sep);
  } catch (err) {
    // If resolving fails, treat as invalid
    return false;
  }
}
// Define the absolute path to uploads directory
const uploadsDir = path.resolve("uploads");

// Validate that the file path is contained within the uploads directory
function validateFilePath(filePath: string, uploadsDir: string): boolean {
  try {
    // Resolve and normalize the file path
    const absPath = fs.realpathSync(path.resolve(filePath));
    // Ensure absPath starts with uploadsDir path
    return absPath.startsWith(uploadsDir + path.sep);
  } catch (error) {
    // If resolving fails, treat path as invalid
    return false;
  }
}
// Security: Ensure uploads directory exists and has proper permissions
const uploadsDir = path.resolve("uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { mode: 0o755 });
    console.log("Created uploads directory with secure permissions");
  } else {
    // Check if directory permissions are secure (not world-writable)
    const stats = fs.statSync(uploadsDir);
    const mode = stats.mode & parseInt('777', 8);
    if (mode & parseInt('002', 8)) {
      console.warn("WARNING: uploads directory is world-writable, this is a security risk");
    }
  }
} catch (error) {
  console.error("Failed to setup uploads directory:", error);
  throw new Error("Cannot create secure uploads directory");
}

// Security: CSRF protection middleware for state-changing operations
// Only apply to browser-facing, state-changing routes (POST, PATCH, DELETE, PUT)
const csrfProtection = lusca.csrf({
  cookie: {
    name: '_csrf',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Helper function to determine if route needs CSRF protection
function needsCSRFProtection(method: string, path: string): boolean {
  // Only protect state-changing methods for browser routes
  const stateChangingMethods = ['POST', 'PATCH', 'DELETE', 'PUT'];
  const isBrowserRoute = !path.includes('/api/auth/') && !path.includes('/api/export');
  return stateChangingMethods.includes(method.toUpperCase()) && isBrowserRoute;
}

// Security: Secure file path validation to prevent directory traversal
function validateFilePath(filePath: string, allowedDirectory: string): boolean {
  try {
    const resolvedPath = path.resolve(filePath);
    const resolvedAllowedDir = path.resolve(allowedDirectory);
    const relativePath = path.relative(resolvedAllowedDir, resolvedPath);
    
    // File must be within the allowed directory and not use .. to escape
    return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
  } catch (error) {
    console.error("File path validation error:", error);
    return false;
  }
}

// Helper functions for bookmark parsing and export
function parseNetscapeBookmarks(content: string): any[] {
  const bookmarks: any[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('<A HREF=') || line.includes('<a href=')) {
      const urlMatch = line.match(/href="([^"]+)"/i);
      const titleMatch = line.match(/>([^<]+)</);
      
      if (urlMatch && titleMatch) {
        bookmarks.push({
          title: titleMatch[1].trim(),
          url: urlMatch[1],
          description: '',
          tags: [],
        });
      }
    }
  }
  
  return bookmarks;
}



function generateNetscapeBookmarks(bookmarks: any[], options: any = {}): string {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  bookmarks.forEach(bookmark => {
    const title = bookmark.title || 'Untitled';
    const url = bookmark.url;
    const addDate = bookmark.createdAt ? Math.floor(new Date(bookmark.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000);
    
    html += `    <DT><A HREF="${url}" ADD_DATE="${addDate}">${title}</A>\n`;
    if (bookmark.description && options.includeTimestamps) {
      html += `    <DD>${bookmark.description}\n`;
    }
  });

  html += `</DL><p>`;
  return html;
}

function generateCsvBookmarks(bookmarks: any[], options: any = {}): string {
  const headers = ['Title', 'URL'];
  if (options.includeTimestamps) headers.push('Created At');
  if (options.includeDeviceInfo) headers.push('Device');
  
  let csv = headers.join(',') + '\n';
  
  bookmarks.forEach(bookmark => {
    const row = [
      `"${(bookmark.title || 'Untitled').replace(/"/g, '""')}"`,
      `"${bookmark.url || ''}"`
    ];
    
    if (options.includeTimestamps) {
      row.push(`"${bookmark.createdAt || ''}"`);
    }
    if (options.includeDeviceInfo) {
      row.push(`"${bookmark.device?.name || 'Unknown'}"`);
    }
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

function generateXmlBookmarks(bookmarks: any[], options: any = {}): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bookmarks>
`;

  bookmarks.forEach(bookmark => {
    xml += `  <bookmark>
    <title><![CDATA[${bookmark.title || 'Untitled'}]]></title>
    <url><![CDATA[${bookmark.url || ''}]]></url>`;
    
    if (bookmark.description) {
      xml += `\n    <description><![CDATA[${bookmark.description}]]></description>`;
    }
    
    if (options.includeTimestamps && bookmark.createdAt) {
      xml += `\n    <created>${bookmark.createdAt}</created>`;
    }
    
    if (options.includeDeviceInfo && bookmark.device) {
      xml += `\n    <device><![CDATA[${bookmark.device.name}]]></device>`;
    }
    
    xml += `\n  </bookmark>
`;
  });

  xml += `</bookmarks>`;
  return xml;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupSimpleAuth(app);

  // Security: Apply CSRF protection conditionally to state-changing browser routes
  app.use((req, res, next) => {
    if (needsCSRFProtection(req.method, req.path)) {
      return csrfProtection(req, res, next);
    }
    next();
  });

  // Security: Expose CSRF token for frontend use
  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: res.locals._csrf });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Device routes
  app.get("/api/devices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const devices = await storage.getUserDevices(userId);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.post("/api/devices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deviceData = insertDeviceSchema.parse({ ...req.body, userId });
      const device = await storage.createDevice(deviceData);
      res.json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      console.error("Error creating device:", error);
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.patch("/api/devices/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const { isOnline } = req.body;
      await storage.updateDeviceStatus(deviceId, isOnline);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating device status:", error);
      res.status(500).json({ message: "Failed to update device status" });
    }
  });

  // Collection routes
  app.get("/api/collections", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const collections = await storage.getUserCollections(userId);
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.post("/api/collections", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const collectionData = insertCollectionSchema.parse({ ...req.body, userId });
      const collection = await storage.createCollection(collectionData);
      res.json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      console.error("Error creating collection:", error);
      res.status(500).json({ message: "Failed to create collection" });
    }
  });

  app.patch("/api/collections/:id", isAuthenticated, async (req: any, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const updateData = insertCollectionSchema.partial().parse(req.body);
      const collection = await storage.updateCollection(collectionId, updateData);
      res.json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      console.error("Error updating collection:", error);
      res.status(500).json({ message: "Failed to update collection" });
    }
  });

  app.delete("/api/collections/:id", isAuthenticated, async (req: any, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      await storage.deleteCollection(collectionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  // Bookmark routes
  app.get("/api/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const bookmarks = await storage.getUserBookmarks(userId, limit);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.get("/api/bookmarks/search", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const bookmarks = await storage.searchBookmarks(userId, query);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error searching bookmarks:", error);
      res.status(500).json({ message: "Failed to search bookmarks" });
    }
  });

  app.get("/api/collections/:id/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const bookmarks = await storage.getBookmarksByCollection(collectionId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching collection bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch collection bookmarks" });
    }
  });

  app.post("/api/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarkData = insertBookmarkSchema.parse({ ...req.body, userId });
      const bookmark = await storage.createBookmark(bookmarkData);
      res.json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.patch("/api/bookmarks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const bookmarkId = parseInt(req.params.id);
      const updateData = insertBookmarkSchema.partial().parse(req.body);
      const bookmark = await storage.updateBookmark(bookmarkId, updateData);
      res.json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      console.error("Error updating bookmark:", error);
      res.status(500).json({ message: "Failed to update bookmark" });
    }
  });

  app.delete("/api/bookmarks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const bookmarkId = parseInt(req.params.id);
      await storage.deleteBookmark(bookmarkId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  // Import routes
  app.post("/api/import/file", isAuthenticated, upload.single("bookmarkFile"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Security: Validate file path to prevent directory traversal attacks
      if (!validateFilePath(file.path, uploadsDir)) {
        console.error("Invalid file path detected:", file.path);
        return res.status(400).json({ message: "Invalid file path" });
      }

      // Parse the file
      
      let bookmarks: any[] = [];
      let sourceType = "file";
      
      if (file.mimetype === "application/json" || file.originalname.endsWith(".json")) {
        try {
          const data = JSON.parse(fileContent);
          // Use existing parseJsonBookmarks function defined at top
          if (Array.isArray(data)) {
            bookmarks = data.map(item => ({
              title: item.title || item.name || 'Untitled',
              url: item.url || item.href,
              description: item.description || '',
              tags: item.tags || [],
            }));
          } else if (data.roots) {
            // Handle Chrome-style bookmark format
            Object.values(data.roots).forEach((root: any) => {
              if (root.children) {
                const extractBookmarks = (node: any) => {
                  if (node.type === 'url') {
                    bookmarks.push({
                      title: node.name || 'Untitled',
                      url: node.url,
                      description: '',
                      tags: [],
                    });
                  } else if (node.children) {
                    node.children.forEach(extractBookmarks);
                  }
                };
                root.children.forEach(extractBookmarks);
              }
            });
          }
        } catch (error) {
          return res.status(400).json({ message: "Invalid JSON file format" });
        }
      } else if (file.mimetype === "text/html" || file.originalname.endsWith(".html")) {
        bookmarks = parseHtmlBookmarks(fileContent);
      } else {
        return res.status(400).json({ message: "Unsupported file format. Please upload HTML or JSON files." });
      }

      // Create import history record
      const importRecord = await storage.createImportHistory({
        userId,
        sourceType,
        fileName: file.originalname,
        totalBookmarks: bookmarks.length,
        successfulImports: 0,
        failedImports: 0,
        status: "processing",
      });

      // Process bookmarks
      const bookmarkData = bookmarks.map(bookmark => ({
        userId,
        title: bookmark.title || bookmark.name || "Untitled",
        url: bookmark.url || bookmark.href,
        description: bookmark.description || "",
        favicon: bookmark.icon || "",
        tags: bookmark.tags || [],
        sourceApp: "imported",
      })).filter(bookmark => bookmark.url);

      const createdBookmarks = await storage.bulkCreateBookmarks(bookmarkData);

      // Update import history
      await storage.createImportHistory({
        ...importRecord,
        successfulImports: createdBookmarks.length,
        failedImports: bookmarks.length - createdBookmarks.length,
        status: "completed",
      });

      // Security: Clean up uploaded file with path validation
      if (validateFilePath(file.path, uploadsDir)) {
        fs.unlinkSync(file.path);
      } else {
        console.error("Cannot clean up file with invalid path:", file.path);
      }

      res.json({
        success: true,
        imported: createdBookmarks.length,
        failed: bookmarks.length - createdBookmarks.length,
        total: bookmarks.length,
      });
    } catch (error) {
      console.error("Error importing bookmarks:", error);
      res.status(500).json({ message: "Failed to import bookmarks" });
    }
  });

  // Statistics route
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Import history route
  app.get("/api/import/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getUserImportHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching import history:", error);
      res.status(500).json({ message: "Failed to fetch import history" });
    }
  });

  // Export route
  app.get("/api/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getUserBookmarks(userId, 10000); // Get all bookmarks
      
      const exportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        total_bookmarks: bookmarks.length,
        bookmarks: bookmarks.map(bookmark => ({
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          tags: bookmark.tags,
          collection: bookmark.collection?.name,
          device: bookmark.device?.name,
          created_at: bookmark.createdAt,
        }))
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=bookmarks-export.json");
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting bookmarks:", error);
      res.status(500).json({ message: "Failed to export bookmarks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function for parsing HTML bookmarks
function parseHtmlBookmarks(html: string): any[] {
  const bookmarks: any[] = [];
  
  // Simple regex to extract bookmark links from HTML
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    bookmarks.push({
      url: match[1],
      title: match[2].trim(),
    });
  }
  
  return bookmarks;
}
