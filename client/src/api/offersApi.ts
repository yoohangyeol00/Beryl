import { axiosInstance, requestWithMockFallback } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import { mockOffersResponse } from '../mocks/offers.mock';
import type { Offer } from '../types/offer';

export async function getOffers() {
  return requestWithMockFallback<Offer[]>({
    request: async () => {
      const response = await axiosInstance.get<ApiResponse<Offer[]>>('/offers');
      return unwrapApiResponse(response.data);
    },
    mock: () => unwrapApiResponse(mockOffersResponse)
  });
}
