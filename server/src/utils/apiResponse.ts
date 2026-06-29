import type { Response } from 'express';

export interface ApiErrorResponse {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  error: null;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({
    success: true,
    data,
    error: null
  } satisfies ApiSuccessResponse<T>);
}

export function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({
    success: false,
    data: null,
    error: {
      code,
      message
    }
  } satisfies ApiErrorResponse);
}
