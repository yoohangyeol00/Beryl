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

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiResponseError(response.error);
  }

  return response.data;
}
