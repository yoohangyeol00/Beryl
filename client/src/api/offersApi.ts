import { axiosInstance, requestWithMockFallback } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import { mockOffersResponse } from '../mocks/offers.mock';
import type { Offer, OfferDetail, OfferListParams, OfferListResponse, OfferMatch, OfferMutationPayload, OfferSubmission, OfferSubmissionPayload } from '../types/offer';

function toListResponse(items: Offer[]): OfferListResponse {
  return {
    items,
    total: items.length,
    summary: {
      total: items.length,
      draft: items.filter((item) => item.status === 'draft').length,
      submitted: items.filter((item) => item.status === 'submitted').length,
      awarded: items.filter((item) => item.status === 'awarded').length,
      rejected: items.filter((item) => item.status === 'rejected').length
    }
  };
}

export async function getOffers(params: OfferListParams = {}) {
  return requestWithMockFallback<OfferListResponse>({
    request: async () => {
      const response = await axiosInstance.get<ApiResponse<OfferListResponse>>('/offers', { params });
      return unwrapApiResponse(response.data);
    },
    mock: () => toListResponse(unwrapApiResponse(mockOffersResponse))
  });
}

export async function getOffer(offerId: string) {
  const response = await axiosInstance.get<ApiResponse<OfferDetail>>(`/offers/${offerId}`);
  return unwrapApiResponse(response.data);
}

export async function createOffer(payload: OfferMutationPayload) {
  const response = await axiosInstance.post<ApiResponse<Offer>>('/offers', payload);
  return unwrapApiResponse(response.data);
}

export async function updateOffer(offerId: string, payload: OfferMutationPayload) {
  const response = await axiosInstance.patch<ApiResponse<Offer>>(`/offers/${offerId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function getOfferMatches(offerId: string) {
  const response = await axiosInstance.get<ApiResponse<{ items: OfferMatch[]; total: number }>>(`/offers/${offerId}/matches`);
  return unwrapApiResponse(response.data);
}

export async function confirmOffer(offerId: string, confirmedResumeIds: string[]) {
  const response = await axiosInstance.post<ApiResponse<{ id: string; status: string; confirmedResumeIds: string[]; confirmedAt: string }>>(
    `/offers/${offerId}/confirm`,
    { confirmedResumeIds }
  );
  return unwrapApiResponse(response.data);
}

export async function recordOfferSubmission(offerId: string, payload: OfferSubmissionPayload) {
  const response = await axiosInstance.post<ApiResponse<OfferSubmission>>(`/offers/${offerId}/submissions`, payload);
  return unwrapApiResponse(response.data);
}
