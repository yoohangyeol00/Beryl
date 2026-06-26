import type { ApiResponse } from '../api/apiResponse';
import type { Resume } from '../types/resume';

export const mockResumesResponse: ApiResponse<Resume[]> = {
  success: true,
  data: [],
  error: null
};
