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
npm run migrate
npm run dev
```

The client runs on `http://localhost:5173` and proxies API requests to the server on `http://localhost:3000`.
