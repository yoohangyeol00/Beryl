export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: ApiError;
    };

export class ApiResponseError extends Error {
  code: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiResponseError';
    this.code = error.code;
  }
}

function isApiErrorResponse(value: unknown): value is Extract<ApiResponse<unknown>, { success: false }> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Partial<ApiResponse<unknown>>;
  return response.success === false && !!response.error?.message;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;

    if (isApiErrorResponse(response?.data)) {
      return response.data.error.message;
    }
  }

  return fallback;
}

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiResponseError(response.error);
  }

  return response.data;
}
