# StreamFlow Frontend

React-based frontend for StreamFlow streaming platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`

## Running Locally

Start the development server:
```bash
npm run dev
```

Application available at: http://localhost:5173

## Building for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Code Quality

Linting:
```bash
npm run lint
```

## Environment Variables

See `.env.example` for configuration.

- `VITE_API_BASE_URL` - Backend API base URL

## Tech Stack

- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS
- Headless UI
