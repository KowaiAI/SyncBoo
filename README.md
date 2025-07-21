SyncBoo - Bookmark Synchronization Platform

A modern, full-stack web application for synchronizing bookmarks across multiple devices and browsers. Built with React, TypeScript, Express.js, and PostgreSQL.

FEATURES

Core Functionality:
• Multi-Browser Import: Import bookmarks from Chrome, Firefox, Safari, Edge, Opera, and Brave
• Smart Organization: Create custom collections with color coding
• Device Management: Track and manage bookmarks across multiple devices
• Real-time Sync: Automatic synchronization across all connected devices
• Bulk Operations: Move, organize, and manage multiple bookmarks at once

User Experience:
• Google Authentication: Secure login with Google OAuth
• Responsive Design: Works seamlessly on desktop, tablet, and mobile
• Context Menus: Right-click any image for options (view, copy, save)
• Dark Mode Ready: CSS variables support for theme switching
• Drag & Drop: Easy file upload with visual feedback

Technical Features:
• Type Safety: Full TypeScript implementation
• Database: PostgreSQL with Drizzle ORM
• API: RESTful endpoints with comprehensive error handling
• File Processing: Parse HTML bookmark files from any browser
• Session Management: Secure session handling with PostgreSQL storage

TECHNOLOGY STACK

Frontend:
• React 18 with TypeScript
• Wouter for routing
• TanStack Query for state management
• Tailwind CSS + shadcn/ui for styling
• Radix UI components
• Vite for build tooling

Backend:
• Node.js with Express.js
• TypeScript with ES modules
• Drizzle ORM with PostgreSQL
• Passport.js for authentication
• Multer for file uploads
• Zod for validation

Database:
• PostgreSQL (Neon serverless compatible)
• Drizzle Kit for migrations
• Connection pooling support

REQUIREMENTS

• Node.js 18 or higher
• PostgreSQL database
• Google OAuth credentials (for authentication)

QUICK START

1. Installation:
   Clone the repository
   cd syncboo
   npm install

2. Environment Setup:
   Create a .env file in the root directory with:
   
   DATABASE_URL="postgresql://username:password@localhost:5432/syncboo"
   SESSION_SECRET="your-super-secret-session-key"
   REPLIT_DOMAINS="your-domain.com"
   ISSUER_URL="https://auth.replit.com"
   PORT=5000
   NODE_ENV=development

3. Database Setup:
   npm run db:push

4. Start Development Server:
   npm run dev

PROJECT STRUCTURE

syncboo/
├── client/                 (React frontend)
│   ├── src/
│   │   ├── components/    (Reusable UI components)
│   │   ├── pages/         (Page components)
│   │   ├── hooks/         (Custom React hooks)
│   │   ├── lib/           (Utilities and configurations)
│   │   └── main.tsx       (Entry point)
│   ├── index.html         (HTML template)
├── server/                (Express backend)
│   ├── routes.ts          (API route definitions)
│   ├── storage.ts         (Database interface)
│   ├── vite.ts            (Vite integration)
│   └── index.ts           (Server entry point)
├── shared/                (Shared types and schemas)
│   └── schema.ts          (Database schema - Drizzle)
├── package.json           (Dependencies and scripts)
├── tsconfig.json          (TypeScript configuration)
├── vite.config.ts         (Vite configuration)
├── tailwind.config.ts     (Tailwind CSS configuration)
├── drizzle.config.ts      (Database configuration)
└── README.md              (This file)

AVAILABLE SCRIPTS

Development:
• npm run dev - Start development server
• npm run build - Build for production
• npm run start - Start production server

Database:
• npm run db:push - Push schema changes to database

Type checking:
• npm run check - Run TypeScript type checking

DATABASE SCHEMA

Core Tables:
• users - User profiles and authentication data
• devices - Connected devices per user
• collections - User-created bookmark folders
• bookmarks - Individual bookmark entries
• import_history - Track import operations

Key Relationships:
• Users have many devices and collections
• Collections contain many bookmarks
• Bookmarks belong to users and optionally to collections
• Import history tracks all bookmark import operations

AUTHENTICATION FLOW

1. User initiates login via Google OAuth
2. OpenID Connect handles token exchange
3. User profile created/updated in database
4. Session established with PostgreSQL storage
5. Client receives authentication state

IMPORT PROCESS

1. File Upload: Drag & drop or browse for bookmark files
2. Validation: Check file format and size constraints
3. Parsing: Extract bookmark data from HTML files
4. Processing: Validate data against schema
5. Storage: Bulk insert with transaction safety
6. Feedback: Real-time progress updates

API ENDPOINTS

Authentication:
• GET /api/auth/user - Get current user
• GET /api/login - Initiate Google OAuth
• GET /api/logout - End session

Bookmarks:
• GET /api/bookmarks - List user bookmarks
• POST /api/bookmarks - Create bookmark
• PATCH /api/bookmarks/:id - Update bookmark
• DELETE /api/bookmarks/:id - Delete bookmark

Collections:
• GET /api/collections - List user collections
• POST /api/collections - Create collection
• PATCH /api/collections/:id - Update collection
• DELETE /api/collections/:id - Delete collection

Devices & Stats:
• GET /api/devices - List user devices
• POST /api/devices - Register device
• GET /api/stats - Get user statistics

File Operations:
• POST /api/upload - Upload bookmark file
• POST /api/import - Import from file
• GET /api/export - Export bookmarks

UI COMPONENTS

Layout Components:
• Sidebar - Navigation with user profile
• TopBar - Secondary navigation
• Dashboard - Overview with stats and recent bookmarks

Feature Components:
• BookmarkCard - Individual bookmark display with context menu
• CollectionManager - Create and organize collections
• ImportModal - File upload and import wizard
• DeviceOverview - Connected devices management

UI Library:
Built on shadcn/ui with components including:
• Forms with validation
• Data tables with sorting
• Modal dialogs
• Context menus (right-click functionality)
• Toast notifications
• Loading states

DEPLOYMENT

Production Build:
npm run build
npm run start

Environment Variables for Production:
DATABASE_URL="your-production-db-url"
SESSION_SECRET="secure-random-string"
REPLIT_DOMAINS="your-production-domain.com"
NODE_ENV=production

Database Migration:
npm run db:push

SECURITY FEATURES

• Session Security: HTTP-only cookies with secure flags
• Input Validation: Zod schemas for all API inputs
• SQL Injection Protection: Parameterized queries via Drizzle
• CORS Configuration: Proper cross-origin setup
• File Upload Security: Size limits and type validation

CONFIGURATION

Tailwind CSS:
Custom color scheme with CSS variables for theming:
:root {
  --primary: 220 90% 56%;
  --secondary: 210 40% 98%;
}

Vite Configuration:
• React plugin with fast refresh
• Path aliases (@/ for src/)
• Development proxy setup
• Build optimization

TROUBLESHOOTING

Common Issues:

Database Connection:
Check DATABASE_URL format: postgresql://user:password@host:port/database

Session Issues:
Ensure SESSION_SECRET is set: export SESSION_SECRET="your-secret-key"

Import Failures:
• Check file format (HTML bookmarks only)
• Verify file size (under 10MB)
• Ensure proper browser export format

Development Tips:
• Use browser dev tools for API debugging
• Check console for React errors
• Monitor network tab for failed requests
• Use Drizzle Studio for database inspection

CONTRIBUTING

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

Code Style:
• TypeScript for type safety
• ESLint for code quality
• Prettier for formatting
• Component-based architecture

LICENSE

This project is open source and available under the MIT License.

SUPPORT

For support:
1. Check the troubleshooting section
2. Review the GitHub issues
3. Create a new issue with details

ROADMAP

• Real-time collaboration features
• Browser extension for direct sync
• Advanced search and filtering
• Bookmark sharing capabilities
• Mobile app development
• API key authentication
• Webhook integrations

Built using modern web technologies