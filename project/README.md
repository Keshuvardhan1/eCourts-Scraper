# TinyLink - URL Shortener

A modern URL shortener service built with Next.js, similar to bit.ly. Create short links, track clicks, and manage your URLs with a clean, responsive interface.

## Features

- ✅ Create short links with optional custom codes (6-8 alphanumeric characters)
- ✅ Automatic URL validation
- ✅ Click tracking with statistics
- ✅ Dashboard with search and filter functionality
- ✅ Individual link statistics page
- ✅ Delete links functionality
- ✅ Health check endpoint
- ✅ Responsive design with Tailwind CSS
- ✅ Clean, polished UI with proper error handling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres (serverless)
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ 
- A Neon Postgres database (free tier available at [neon.tech](https://neon.tech))

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   BASE_URL=http://localhost:3000
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The application will automatically create the required database table on first run. The schema includes:

- `code` (VARCHAR(8), PRIMARY KEY) - The short code
- `url` (TEXT) - The target URL
- `clicks` (INTEGER) - Total click count
- `last_clicked` (TIMESTAMP) - Last click timestamp
- `created_at` (TIMESTAMP) - Creation timestamp

## API Endpoints

### Create Link
```
POST /api/links
Body: { "url": "https://example.com", "code": "optional" }
Response: 201 Created or 409 Conflict (if code exists)
```

### List All Links
```
GET /api/links
Response: Array of link objects
```

### Get Link Stats
```
GET /api/links/:code
Response: Link object or 404 Not Found
```

### Delete Link
```
DELETE /api/links/:code
Response: 200 OK or 404 Not Found
```

### Health Check
```
GET /healthz
Response: { "ok": true, "version": "1.0" }
```

## Pages & Routes

- `/` - Dashboard (list, add, delete links)
- `/code/:code` - Statistics page for a specific link
- `/:code` - Redirect to original URL (302 redirect)
- `/healthz` - Health check endpoint

## Code Validation

- Short codes must be 6-8 alphanumeric characters: `[A-Za-z0-9]{6,8}`
- Custom codes are globally unique
- URLs are validated before saving

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `BASE_URL` (your Vercel deployment URL)
   - `NEXT_PUBLIC_BASE_URL` (your Vercel deployment URL)
4. Deploy!

### Alternative: Deploy to Render

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy!

## Testing

The application follows the specified URL conventions for automated testing:

- All routes match the specification exactly
- Health endpoint returns proper status codes
- API endpoints follow REST conventions
- Error responses match expected formats

## Project Structure

```
project/
├── app/
│   ├── api/
│   │   ├── healthz/
│   │   │   └── route.ts
│   │   └── links/
│   │       ├── [code]/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── code/
│   │   └── [code]/
│   │       └── page.tsx
│   ├── [code]/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db.ts
│   └── utils.ts
├── .env.example
├── package.json
├── tailwind.config.js
└── README.md
```

## License

This project is created for a take-home assignment.



