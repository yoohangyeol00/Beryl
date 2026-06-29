import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/beryl',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  publicBaseUrl: process.env.SERVER_PUBLIC_BASE_URL ?? `http://localhost:${Number(process.env.PORT ?? 3000)}`,
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'beryl.sid',
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 24),
  isProduction: process.env.NODE_ENV === 'production'
};
