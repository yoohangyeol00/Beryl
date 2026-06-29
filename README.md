# Beryl

React, Vite, TypeScript client with a Node.js, Express, PostgreSQL server.

## Structure

- `client`: React + Vite + TypeScript frontend
- `server`: Node.js + Express + TypeScript backend
- `server/migrations`: PostgreSQL database migrations

## Setup

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run migrate
npm run dev
```

The client runs on `http://localhost:5173`, and the server runs on `http://localhost:3000`.

Current `client/.env.example` uses `VITE_API_BASE_URL=http://localhost:3000/api`, so API requests call the Express server directly. The Vite proxy is only used when the client sends relative `/api` requests.
