import type { ApiResponse } from '../api/apiResponse';
import type { Offer } from '../types/offer';

export const mockOffersResponse: ApiResponse<Offer[]> = {
  success: true,
  data: [],
  error: null
};
