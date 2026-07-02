import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/beryl',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  publicBaseUrl: process.env.SERVER_PUBLIC_BASE_URL ?? `http://localhost:${Number(process.env.PORT ?? 3000)}`,
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'beryl.sid',
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 24),
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  invitationFromEmail: process.env.INVITATION_FROM_EMAIL ?? '',
  invitationTtlHours: Number(process.env.INVITATION_TTL_HOURS ?? 72),
  odcloudServiceKey: process.env.ODCLOUD_SERVICE_KEY ?? '',
  odcloudBusinessStatusUrl:
    process.env.ODCLOUD_BUSINESS_STATUS_URL ?? 'https://api.odcloud.kr/api/nts-businessman/v1/status',
  aiProvider: process.env.AI_PROVIDER ?? 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-lite',
  geminiTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS ?? 15000),
  isProduction: process.env.NODE_ENV === 'production'
};
