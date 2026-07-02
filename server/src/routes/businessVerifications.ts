import { Router, type Request, type Response } from 'express';
import { normalizeBusinessNumber, verifyBusinessStatus } from '../services/businessVerification.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

export const businessVerificationsRouter = Router();

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

businessVerificationsRouter.post('/status', async (req: Request, res: Response, next) => {
  const body = asRecord(req.body);
  const businessNumber = normalizeBusinessNumber(getString(body.businessNumber));

  if (businessNumber.length !== 10) {
    sendError(res, 400, 'INVALID_BUSINESS_NUMBER', '사업자등록번호는 숫자 10자리로 입력해주세요.');
    return;
  }

  try {
    sendSuccess(res, await verifyBusinessStatus(businessNumber));
  } catch (error) {
    sendError(
      res,
      error instanceof Error && error.message.includes('서비스 키') ? 400 : 502,
      'BUSINESS_VERIFICATION_FAILED',
      error instanceof Error ? error.message : '사업자번호 인증 요청에 실패했습니다.'
    );
  }
});
