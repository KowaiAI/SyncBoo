import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

// Email/password authentication system
export function setupSimpleAuth(app: Express) {
  // Email/Password signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        firstName,
        lastName,
        password: hashedPassword
      });

      // Set session cookie
      res.cookie('user', JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }), { 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.json({ message: "User created successfully", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email/Password login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session cookie
      res.cookie('user', JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }), { 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.json({ message: "Login successful", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quick demo login (for testing)
  app.get("/api/login", (req, res) => {
    // Set a simple session cookie for demo
    res.cookie('user', JSON.stringify({
      id: 'demo-user-123',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User'
    }), { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.redirect('/');
  });

  app.get("/api/logout", (req, res) => {
    res.clearCookie('user');
    res.redirect('/');
  });

  app.get('/api/auth/user', (req, res) => {
    const userCookie = req.cookies?.user;
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        res.json(user);
      } catch (e) {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Profile update endpoint
  app.patch("/api/auth/profile", async (req, res) => {
    const userCookie = req.cookies?.user;
    if (!userCookie) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const currentUser = JSON.parse(userCookie);
      const { firstName, lastName, email } = req.body;
      
      // Update user in database if it exists
      if (currentUser.id.startsWith('user_')) {
        await storage.updateUser(currentUser.id, { firstName, lastName, email });
      }
      
      // Update session cookie
      const updatedUser = { ...currentUser, firstName, lastName, email };
      res.cookie('user', JSON.stringify(updatedUser), { 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
      
      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Change password endpoint
  app.post("/api/auth/change-password", async (req, res) => {
    const userCookie = req.cookies?.user;
    if (!userCookie) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const currentUser = JSON.parse(userCookie);
      const { currentPassword, newPassword } = req.body;
      
      // Only allow password change for real users (not demo users)
      if (!currentUser.id.startsWith('user_')) {
        return res.status(400).json({ message: "Password change not available for demo account" });
      }
      
      // Get user from database
      const user = await storage.getUser(currentUser.id);
      if (!user || !user.password) {
        return res.status(400).json({ message: "User not found or no password set" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(currentUser.id, { password: hashedPassword });
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const userCookie = req.cookies?.user;
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      (req as any).user = { claims: { sub: user.id }, ...user };
      next();
    } catch (e) {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};