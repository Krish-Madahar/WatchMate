# WatchMate - Social Movie & TV Show Tracker

A full-stack web application for tracking movies and TV shows with recommendations powered by The Movie Database (TMDB) API.

## Features

- User authentication (register/login with JWT)
- Browse trending movies and TV shows
- Search functionality with caching
- Movie/TV show details with ratings and info
- Responsive design with Tailwind CSS
- Redis caching for improved performance

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM with PostgreSQL
- Redis for caching
- JWT authentication
- TMDB API integration

**Frontend:**
- React + Vite + TypeScript
- Tailwind CSS
- React Router
- TanStack Query (React Query)
- React Hot Toast

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (or Docker)
- Redis (or Docker)
- TMDB API key (get free at https://www.themoviedb.org/settings/api)

### Option 1: Docker (Recommended)

```bash
# Clone and navigate to project
cd watchmate

# Create server .env file
cp server/.env.example server/.env
# Edit server/.env with your TMDB_API_KEY

# Start all services
docker-compose up -d

# Initialize database (first time only)
docker-compose exec backend npx prisma migrate dev --name init
```

App will be available at http://localhost:5173

### Option 2: Manual Setup

#### Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values

# Setup database
npx prisma migrate dev --name init

# Start development server
npm run dev
```

#### Frontend

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

### Server (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (default: 5000) | No |
| DATABASE_URL | PostgreSQL connection string | Yes |
| REDIS_URL | Redis connection string | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| TMDB_API_KEY | TMDB API key | Yes |
| FRONTEND_URL | Frontend URL for CORS | No |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Movies
- `GET /api/movies/trending` - Get trending movies (protected)
- `GET /api/movies/search?query=...` - Search movies (protected)
- `GET /api/movies/:id` - Get movie details (protected)
- `GET /api/movies/tv/trending` - Get trending TV shows (protected)

## Project Structure

```
watchmate/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utilities
│   └── Dockerfile
├── server/                 # Express backend
│   ├── src/
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   ├── prisma/             # Database schema
│   └── Dockerfile
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## Development

### Running Tests

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

### Building for Production

```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

## License

MIT