import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/beryl',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  publicBaseUrl: process.env.SERVER_PUBLIC_BASE_URL ?? `http://localhost:${Number(process.env.PORT ?? 3000)}`,
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'beryl.sid',
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 24),
  brevoApiKey: process.env.BREVO_API_KEY ?? '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL ?? '',
  brevoSenderName: process.env.BREVO_SENDER_NAME ?? 'BERYL',
  invitationTtlHours: Number(process.env.INVITATION_TTL_HOURS ?? 72),
  odcloudServiceKey: process.env.ODCLOUD_SERVICE_KEY ?? '',
  odcloudBusinessStatusUrl:
    process.env.ODCLOUD_BUSINESS_STATUS_URL ?? 'https://api.odcloud.kr/api/nts-businessman/v1/status',
  aiProvider: process.env.AI_PROVIDER ?? 'rule-based',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL ?? 'qwen2.5:7b',
  ollamaTimeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS ?? 30000),
  ollamaCandidateLimit: Number(process.env.OLLAMA_CANDIDATE_LIMIT ?? 8),
  isProduction: process.env.NODE_ENV === 'production'
};
