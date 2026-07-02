import { config } from '../config.js';

const activeBusinessStatusCode = '01';

type OdcloudStatusResponse = {
  data?: Array<{
    b_no?: string;
    b_stt?: string;
    b_stt_cd?: string;
    tax_type?: string;
  }>;
  message?: string;
};

export interface BusinessVerificationStatus {
  businessNumber: string;
  verified: boolean;
  statusCode: string;
  statusMessage: string;
  taxType: string;
}

export function normalizeBusinessNumber(value: string) {
  return value.replace(/\D/g, '');
}

export async function verifyBusinessStatus(businessNumberInput: string): Promise<BusinessVerificationStatus> {
  const businessNumber = normalizeBusinessNumber(businessNumberInput);

  if (businessNumber.length !== 10) {
    throw new Error('사업자등록번호는 숫자 10자리로 입력해주세요.');
  }

  if (!config.odcloudServiceKey) {
    throw new Error('사업자번호 인증 서비스 키가 설정되어 있지 않습니다.');
  }

  const url = new URL(config.odcloudBusinessStatusUrl);
  url.searchParams.set('serviceKey', config.odcloudServiceKey);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      b_no: [businessNumber]
    })
  });
  const result = (await response.json().catch(() => ({}))) as OdcloudStatusResponse;

  if (!response.ok) {
    throw new Error(result.message || `사업자번호 인증 요청에 실패했습니다. 상태 코드: ${response.status}`);
  }

  const status = result.data?.[0] ?? null;

  if (!status) {
    return {
      businessNumber,
      verified: false,
      statusCode: '',
      statusMessage: '사업자등록 상태를 확인할 수 없습니다.',
      taxType: ''
    };
  }

  return {
    businessNumber,
    verified: status.b_stt_cd === activeBusinessStatusCode,
    statusCode: status.b_stt_cd ?? '',
    statusMessage: status.b_stt ?? '',
    taxType: status.tax_type ?? ''
  };
}
