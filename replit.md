# Dekr User Deck Manager

## Overview

This is a full-stack application called "Dekr" - a comprehensive user deck management system for stock portfolio organization. The application enables users to create, organize, and manage personalized collections of stocks with tier-based restrictions, strategy application, and notification management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom Dekr dark theme
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the entire stack
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **API Pattern**: RESTful API with JSON responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM with schema-first approach
- **Session Storage**: PostgreSQL-based session storage
- **Development Storage**: In-memory storage implementation for development/testing

## Key Components

### Tier-Based Access Control
The system implements a sophisticated 7-tier user access system:
- **Freemium**: Basic access with limited decks and stocks
- **Market Hours Pro**: Extended trading hours features
- **Sector Specialist**: Sector-specific analysis tools
- **Weekend Warrior**: Extended weekend access
- **Dark Pool Insider**: Advanced trading insights
- **Algorithmic Trader**: Automated trading features
- **Institutional Elite**: Enterprise-level access

Each tier has specific limits for:
- Maximum number of decks
- Maximum stocks per deck
- Feature access permissions
- Notification preferences

### Deck Management System
- **Deck Types**: Watchlist, Portfolio, Strategy, Research, Custom
- **Organization**: Hierarchical deck structure with categories
- **Collaboration**: Public/private deck visibility options
- **Performance Tracking**: Real-time performance analytics per deck

### Stock Management
- **Stock Addition**: Multi-source stock discovery and addition
- **Metadata**: Notes, target prices, stop losses, position sizes
- **Status Tracking**: Watching, Active, Strategy Applied, Archived
- **Tagging System**: Flexible tagging for organization

### Notification System
- **Multi-Channel**: In-app, email, push notifications
- **Tier-Based**: Different notification limits per tier
- **Customizable**: User-configurable notification preferences
- **Real-Time**: Live updates for deck changes and market events

## Data Flow

1. **User Authentication**: Session-based authentication with PostgreSQL storage
2. **Deck Operations**: CRUD operations on decks with tier validation
3. **Stock Management**: Add/remove stocks with real-time validation
4. **Notifications**: Event-driven notification system
5. **Real-Time Updates**: React Query for automatic cache invalidation and updates

## External Dependencies

### Database & Storage
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **connect-pg-simple**: PostgreSQL session storage

### UI & Frontend
- **@radix-ui/***: Comprehensive UI component library
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for server development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon Database with development environment
- **Session Management**: PostgreSQL-based sessions
- **Error Handling**: Runtime error overlay for development

### Production Build
- **Frontend**: Vite build with optimized bundle
- **Backend**: esbuild compilation to ESM format
- **Database**: Neon Database production instance
- **Static Assets**: Served through Express static middleware

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment setting (development/production)
- **Session Configuration**: Automatic PostgreSQL session store setup

### Key Features
- **Tier-Based Restrictions**: Automatic enforcement of user tier limits
- **Real-Time Sync**: Automatic updates across all connected clients
- **Responsive Design**: Mobile-first responsive design with dark theme
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Database Migrations**: Drizzle Kit for schema management
- **Error Handling**: Comprehensive error handling with user-friendly messages

The application follows modern full-stack development practices with a focus on type safety, performance, and user experience. The tier-based system provides a clear monetization path while the comprehensive deck management features serve both individual investors and institutional users.