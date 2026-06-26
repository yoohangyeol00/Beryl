import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

export type ApiMode = 'api' | 'mock' | 'auto';

export function getApiMode(): ApiMode {
  const mode = import.meta.env.VITE_API_MODE;

  if (mode === 'api' || mode === 'mock' || mode === 'auto') {
    return mode;
  }

  return 'auto';
}

export function canUseMockFallback() {
  return !import.meta.env.PROD;
}

export async function requestWithMockFallback<T>({
  request,
  mock,
  mockDelay = 200
}: {
  request: () => Promise<T>;
  mock: () => T;
  mockDelay?: number;
}) {
  const mode = getApiMode();

  if (mode === 'mock') {
    if (!canUseMockFallback()) {
      throw new Error('Mock mode is disabled in production.');
    }

    await delay(mockDelay);
    return mock();
  }

  if (mode === 'api') {
    return request();
  }

  try {
    return await request();
  } catch (error) {
    if (!canUseMockFallback()) {
      throw error;
    }

    await delay(mockDelay);
    return mock();
  }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
