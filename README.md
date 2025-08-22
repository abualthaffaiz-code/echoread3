# Echoread - Book Summary App

A comprehensive audiobook summary platform delivering personalized, interactive learning experiences through advanced AI-powered content discovery and immersive reading technologies.

## Features

- **Book Summaries**: Text and audio summaries of non-fiction books
- **User Authentication**: Replit OAuth integration
- **Progress Tracking**: Reading sessions, bookmarks, and notes
- **Audio Player**: Custom audio player with sync capabilities
- **Subscription Management**: Free and premium tiers
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Indonesian Localization**: Fully localized for Indonesian users

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- shadcn/ui component library
- Wouter for routing
- TanStack Query for state management

### Backend
- Node.js with Express
- TypeScript
- Drizzle ORM with PostgreSQL
- Replit Authentication (OpenID Connect)
- Object Storage for media files

### Database
- PostgreSQL (Neon serverless)
- Drizzle migrations

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── db.ts              # Database connection
│   └── replitAuth.ts      # Authentication setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── attached_assets/       # Static assets and uploads
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Replit account (for authentication)

### Environment Variables
Create these secrets in your Replit environment:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit application ID
- `REPLIT_DOMAINS` - Allowed domains for auth
- Object storage configuration variables

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

## Database Schema

Key entities:
- **Users**: User profiles and authentication
- **Books**: Book catalog with metadata
- **Authors**: Author information
- **Categories**: Book categorization
- **Summaries**: Text and audio content
- **Reading Sessions**: Progress tracking
- **Bookmarks**: User bookmarks
- **Notes**: User notes

## API Endpoints

- `/api/auth/*` - Authentication routes
- `/api/books` - Book management
- `/api/summaries` - Summary content
- `/api/users` - User management
- `/api/dashboard` - User dashboard data

## Development

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate migrations

### Key Features Implementation
- **Audio Player**: Custom implementation with Web Audio API
- **Progress Tracking**: Automatic saving of reading progress
- **Authentication**: Replit OAuth with session management
- **File Upload**: Object storage integration for audio files
- **Responsive Design**: Mobile-first approach with dark theme

## License

Private project - All rights reserved

## Export/Import Notes

When importing to a new environment:
1. Set up all environment variables
2. Configure database connection
3. Set up object storage
4. Import database schema and data
5. Test all functionality

See `EXPORT_CHECKLIST.md` for detailed migration instructions.
