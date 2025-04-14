# Defect Tracker System (DTS)
defect tracking system built with Node.js and Express.

## Features

- Secure authentication with JWT
- Role-based access control
- Comprehensive audit logging
- Defect management with version control
- Comment system
- File attachments
- Admin dashboard
- Export capabilities
- Recovery bin

## Prerequisites

- Node.js 16+
- PostgreSQL 13+
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/secure-defect-tracker.git
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
NODE_ENV=development
PORT=your-local-port
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=your-db-port
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
CORS_ORIGIN=http://localhost:your-frontend-port
```

4. Run database migrations:
```bash
npx knex migrate:latest
```

5. Start the server:
```bash
npm run dev
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Security headers with Helmet.js
- Input validation
- Audit logging
- Session management