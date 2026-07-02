# BERYL API

## 1. 문서 목적

이 문서는 BERYL API endpoint의 기준을 정리한다.

`docs/spec.md`는 API의 상위 원칙과 도메인 범위를 정의하고, 이 문서는 endpoint, query parameter, request/response 형태, status code를 관리한다.

현재 문서는 구현 전 API 초안이다. 실제 구현 시 request/response 타입은 client 타입, server route, migration schema와 함께 갱신한다.

## 2. Common Rules

### Base URL

로컬 개발 기준:

```text
http://localhost:3000/api
```

API path 기준:

```text
/api
```

### Response Envelope

성공 응답:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

오류 응답:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Protected Domain API Rules

로그인/회원가입처럼 공개되어야 하는 endpoint를 제외한 도메인 API는 기본적으로 인증과 현재 소속 기업 기준 접근 제어를 적용한다.

서버 구현 기준:

- 도메인 라우터는 기본적으로 `createCompanyScopedRouter()`로 생성한다.
- handler는 클라이언트 request body/query/path의 `companyId`, `role`, `currentCompanyId` 값을 권한 판단 기준으로 신뢰하지 않는다.
- 현재 기업 기준은 서버 세션에서 주입된 `req.auth.user.companyId`를 사용한다.
- handler 내부에서는 `getCurrentCompanyId(req)`로 current company를 얻는다.
- URL의 리소스 ID로 DB row를 조회한 뒤, row의 소유/관계 기업 ID가 current company와 맞는지 확인한다.
- current company가 접근할 수 없는 row는 `403 COMPANY_SCOPE_FORBIDDEN`을 반환한다.

예:

```ts
export const jobsRouter = createCompanyScopedRouter();

jobsRouter.get('/:jobId', async (req, res) => {
  const companyId = getCurrentCompanyId(req);
  const job = await findJob(req.params.jobId);

  if (!job || job.buyerCompanyId !== companyId) {
    sendCompanyScopeError(res);
    return;
  }

  sendSuccess(res, job);
});
```

### Pagination

목록 API는 기본적으로 다음 query를 지원한다.

```text
page=1
pageSize=20
sort=createdAt
order=desc
q=검색어
status=active
```

목록 응답:

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 20
  },
  "error": null
}
```

### Status Codes

- `200 OK`: 조회/수정 성공
- `201 Created`: 생성 성공
- `204 No Content`: 삭제 또는 logout 성공
- `400 Bad Request`: request validation 실패
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: current company 기준 접근 권한 없음
- `404 Not Found`: 대상 없음
- `409 Conflict`: 중복 또는 상태 충돌
- `500 Internal Server Error`: 서버 오류

## 3. Auth

기업 회원 로그인을 기준으로 한다. 발주기관 계정과 공급기업 계정을 분리하지 않는다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/auth/me` | 현재 사용자와 소속 기업 조회 |
| `PATCH` | `/api/auth/me` | 내 계정/구성원 프로필 수정 |
| `PATCH` | `/api/auth/me/password` | 내 비밀번호 변경 |
| `DELETE` | `/api/auth/me` | 내 계정 탈퇴 처리 |
| `GET` | `/api/auth/invitations/accept` | 초대 수락 전 토큰 검증 |
| `POST` | `/api/auth/invitations/accept` | 초대 수락, 비밀번호 설정, 계정 활성화 |

### `POST /api/auth/signup`

일반 회원가입은 `companyUser`만 생성한다. request body에서 `role`은 받지 않으며, `systemAdmin` 계정은 프로그램 초기 설정, seed, 운영 스크립트 같은 별도 경로로 생성한다.

Request:

```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "password",
  "passwordConfirm": "password",
  "company": {
    "name": "A기업",
    "businessRegistrationNo": "123-45-67890",
    "supportsBuyer": true,
    "supportsSupplier": true
  }
}
```

Response data:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "companyUser",
    "companyId": "uuid"
  },
  "company": {
    "id": "uuid",
    "name": "A기업",
    "businessRegistrationNo": "123-45-67890",
    "companyType": null,
    "representativeName": null,
    "address": null,
    "contactPhone": null,
    "contactEmail": null,
    "status": "active",
    "logoUrl": null,
    "supportsBuyer": true,
    "supportsSupplier": true
  },
  "member": {
    "id": "uuid",
    "name": "홍길동",
    "department": null,
    "position": null,
    "email": "user@example.com",
    "phone": null
  }
}
```

### `POST /api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response data:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "companyUser",
    "companyId": "uuid"
  },
  "company": {
    "id": "uuid",
    "name": "A기업",
    "businessRegistrationNo": "123-45-67890",
    "companyType": null,
    "representativeName": null,
    "address": null,
    "contactPhone": null,
    "contactEmail": null,
    "status": "active",
    "logoUrl": null,
    "supportsBuyer": true,
    "supportsSupplier": true
  },
  "member": {
    "id": "uuid",
    "name": "홍길동",
    "department": null,
    "position": null,
    "email": "user@example.com",
    "phone": null
  }
}
```

### `GET /api/auth/invitations/accept`

초대 메일 링크로 접근한 사용자가 비밀번호를 설정하기 전에 초대 토큰을 검증한다.

Query:

```text
token=raw-invitation-token
```

Response data:

```json
{
  "email": "user@example.com",
  "name": "홍길동",
  "companyName": "A기업",
  "department": "사업개발팀",
  "position": "팀장",
  "expiresAt": "2026-07-04T00:00:00.000Z"
}
```

### `POST /api/auth/invitations/accept`

초대를 수락하고 로그인 가능한 `users` 계정을 생성한다. 성공 시 서버 세션 cookie를 발급하고 `company_members.user_id`, `company_members.status`, `user_invitations.status`를 함께 갱신한다.

Request:

```json
{
  "token": "raw-invitation-token",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

Response data는 `POST /api/auth/login`과 같은 auth session 구조를 사용한다.

## 3.1 Company Members

현재 기업의 내부 구성원과 계정 상태를 관리한다. 초대 수락이 완료된 사용자는 화면에서 `활성` 상태로 표시한다. 공급기업/발주기관 담당자 연락처는 `company_contacts`를 사용하고, 이 API에는 포함하지 않는다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/company-members` | 현재 기업 내부 구성원과 최신 초대 상태 목록 조회 |
| `GET` | `/api/company-members/invitations` | 현재 기업 사용자 초대 이력 전체 조회 |
| `PATCH` | `/api/company-members/:memberId` | 내부 구성원 연락처/소속/직책 수정 |
| `PATCH` | `/api/company-members/:memberId/cancel-invitation` | 초대 대기 구성원 초대 취소 |
| `PATCH` | `/api/company-members/:memberId/deactivate` | 활성 구성원 비활성화 |
| `PATCH` | `/api/company-members/:memberId/activate` | 비활성 구성원 재활성화 |
| `POST` | `/api/company-members/invitations` | 내부 사용자 초대 |

### `GET /api/company-members`

초대 취소된 사용자 초안은 이력 보존을 위해 DB에는 남기지만, 기본 목록 응답에서는 제외한다. 비활성화된 실제 계정은 `userId`가 연결되어 있으므로 목록에 표시된다.

Query:

```text
q=검색어
status=invited | active | inactive
```

Response data:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "홍길동",
      "department": "사업개발팀",
      "position": "팀장",
      "email": "user@example.com",
      "phone": "010-1234-5678",
      "memberType": "employee",
      "status": "invited",
      "userId": null,
      "assignedJobs": 0,
      "invitation": {
        "id": "uuid",
        "status": "pending",
        "role": "companyUser",
        "invitedAt": "2026-07-01T00:00:00.000Z",
        "sentAt": "2026-07-01T00:00:00.000Z",
        "expiresAt": "2026-07-04T00:00:00.000Z",
        "acceptedAt": null,
        "invitedBy": {
          "id": "uuid",
          "name": "관리자",
          "email": "admin@example.com"
        }
      }
    }
  ],
  "total": 1
}
```

### `GET /api/company-members/invitations`

현재 기업의 사용자 초대 이력을 조회한다. 사용자 목록에서 숨기는 초대 취소 건도 이 응답에는 포함한다.

Response data:

```json
{
  "items": [
    {
      "id": "uuid",
      "companyMemberId": "uuid",
      "name": "홍길동",
      "department": "사업개발팀",
      "position": "팀장",
      "email": "user@example.com",
      "status": "pending",
      "invitedAt": "2026-07-01T00:00:00.000Z",
      "sentAt": "2026-07-01T00:00:00.000Z",
      "expiresAt": "2026-07-04T00:00:00.000Z",
      "acceptedAt": null,
      "canceledAt": null
    }
  ],
  "total": 1
}
```

### `PATCH /api/company-members/:memberId`

현재 기업에 속한 내부 구성원의 연락처, 소속 부서, 직책을 수정한다. 이름과 이메일은 이 API에서 수정하지 않는다. 외부 담당자 연락처는 이 API가 아니라 `company_contacts` 계열 데이터를 사용한다.

Request:

```json
{
  "phone": "010-1234-5678",
  "department": "사업개발팀",
  "position": "팀장"
}
```

Response data:

```json
{
  "id": "uuid"
}
```

### `PATCH /api/company-members/:memberId/cancel-invitation`

현재 기업의 초대 대기 구성원만 대상으로 한다. `company_members.status`를 `inactive`으로 변경하고, 연결된 pending 초대는 `user_invitations.status = revoked`로 변경한다.

Response data:

```json
{
  "id": "uuid"
}
```

### `PATCH /api/company-members/:memberId/deactivate`

현재 기업의 활성 구성원을 비활성화한다. 물리 삭제하지 않고 `company_members.status = inactive`으로 변경해 이력과 연결 관계를 보존한다.

Response data:

```json
{
  "id": "uuid"
}
```

### `PATCH /api/company-members/:memberId/activate`

현재 기업의 비활성 구성원을 다시 활성화한다. 초대 취소처럼 아직 `users` 계정이 연결되지 않은 구성원은 대상이 아니며, `company_members.user_id`가 연결된 비활성 구성원만 `active`로 변경한다.

Response data:

```json
{
  "id": "uuid"
}
```

## 4. Companies

기업은 로그인과 거래 관계의 기준 단위다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/companies` | 기업 목록 조회 |
| `GET` | `/api/companies/:companyId` | 기업 상세 조회 |
| `POST` | `/api/companies` | 기업 등록 |
| `PATCH` | `/api/companies/:companyId` | 기업 수정 |
| `PATCH` | `/api/companies/me` | 내 소속 기업 정보 수정 |
| `POST` | `/api/companies/me/logo` | 내 소속 기업 로고 업로드 |

### `GET /api/companies`

Query:

- `q`
- `status`
- `companyType`
- `page`
- `pageSize`

### `PATCH /api/companies/me`

현재 로그인 사용자의 `companyId` 기준으로 소속 기업 정보를 수정한다. request body의 `companyId`는 받지 않으며, 서버 세션의 소속 기업만 수정한다.

Request:

```json
{
  "name": "A기업",
  "businessRegistrationNo": "123-45-67890",
  "companyType": "법인",
  "representativeName": "김대표",
  "address": "서울시 강남구",
  "contactPhone": "02-0000-0000",
  "contactEmail": "contact@example.com",
  "supportsBuyer": true,
  "supportsSupplier": true
}
```

Response data:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "companyUser",
    "companyId": "uuid"
  },
  "company": {
    "id": "uuid",
    "name": "A기업",
    "businessRegistrationNo": "123-45-67890",
    "companyType": "법인",
    "representativeName": "김대표",
    "address": "서울시 강남구",
    "contactPhone": "02-0000-0000",
    "contactEmail": "contact@example.com",
    "status": "active",
    "logoUrl": "http://localhost:3000/uploads/company-logos/logo.png",
    "supportsBuyer": true,
    "supportsSupplier": true
  },
  "member": {
    "id": "uuid",
    "name": "홍길동",
    "department": "사업개발팀",
    "position": "과장",
    "email": "user@example.com",
    "phone": "010-0000-0000"
  }
}
```

### `POST /api/companies/me/logo`

현재 로그인 사용자의 소속 기업 로고를 업로드한다.

Request:

```text
multipart/form-data
logo=<회사 로고 이미지>
```

Validation:

- 최대 2MB
- 허용 MIME type: `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- 서버 세션의 `companyId` 기준으로만 저장

## 5. Company Relationships

기업 관계는 명시 테이블로 관리한다. 발주/공급은 로그인 role이 아니라 관계의 관점이다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/company-relationships` | 현재 기업 기준 관계 기업 목록 |
| `POST` | `/api/company-relationships` | 관계 기업 등록 |
| `PATCH` | `/api/company-relationships/:relationshipId` | 관계 상태/메모 수정 |

### `GET /api/company-relationships`

Query:

- `perspective`: `buyer` 또는 `supplier`
- `relationshipType`
- `status`
- `q`

Response data item:

```json
{
  "id": "uuid",
  "sourceCompanyId": "uuid",
  "targetCompanyId": "uuid",
  "sourcePerspective": "supplier",
  "targetPerspective": "buyer",
  "relationshipType": "contract",
  "status": "active",
  "targetCompany": {
    "id": "uuid",
    "name": "B기관"
  }
}
```

## 6. Jobs

`jobs`는 회원이 공식 공고를 발행하는 데이터가 아니라, 외부 입찰 공고를 BERYL 내부 관리 대상으로 등록/추적하는 데이터다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/jobs` | 입찰 공고 목록 조회 |
| `GET` | `/api/jobs/:jobId` | 입찰 공고 상세 조회 |
| `POST` | `/api/jobs` | 외부 공고 내부 등록 |
| `PATCH` | `/api/jobs/:jobId` | 내부 관리 정보 수정 |
| `DELETE` | `/api/jobs/:jobId` | 내부 관리 공고 삭제 |

### `GET /api/jobs`

Query:

- `q`
- `status`: `draft`, `open`, `closingSoon`, `closed`, `awarded`
- `procurementType`: `public`, `private`
- `sourceType`: `nara`, `private_bid`, `manual`, `email`, `other`
- `perspective`: `buyer`이면 현재 회사가 발주자인 공고만 조회하고, 생략하거나 `accessible`이면 현재 회사가 접근 가능한 공고를 조회한다.
- `page`
- `pageSize`
- `sort`
- `order`

Response data:

```json
{
  "items": [
    {
      "id": "uuid",
      "noticeNumber": "2026-0001",
      "title": "차세대 시스템 구축",
      "agency": "소방청",
      "category": "Java, Spring Boot, MSA",
      "budget": 100000000,
      "publishedAt": "2026-06-01",
      "deadline": "2026-06-30",
      "status": "draft",
      "rfpScore": 0,
      "recommendedPeople": 0
    }
  ],
  "total": 1,
  "summary": {
    "open": 0,
    "closingSoon": 0,
    "awarded": 0,
    "avgRfpScore": 0
  }
}
```

조회 범위:

- 현재 로그인 사용자의 `companyId`가 발주처인 공고
- 현재 로그인 사용자의 `companyId`와 발주처 사이에 활성 `bid_participation` 관계가 있는 공고

### `POST /api/jobs`

Request:

```json
{
  "noticeNumber": "2026-0001",
  "title": "차세대 시스템 구축",
  "buyerName": "소방청",
  "procurementType": "public",
  "sourceType": "nara",
  "sourceUrl": "https://example.com/notice",
  "category": "Java, Spring Boot, MSA",
  "budget": 100000000,
  "publishedAt": "2026-06-01",
  "deadline": "2026-06-30",
  "status": "draft",
  "description": "투입 시작 예정일: 2026-07-01\n\n예상 투입 기간: 12개월\n\n인력추천 분석 기준:\nJava/Spring Boot 경력 우선"
}
```

서버 처리 기준:

- 발주기관 모드에서 등록한 공고의 `buyerCompanyId`는 현재 로그인 사용자의 `companyId`로 저장한다.
- `buyerName`은 화면 표시용 발주기관명으로만 사용하며, 권한이나 소속을 결정하는 기준으로 사용하지 않는다.
- `buyerCompanyId`, `internalOwnerMemberId`, `companyId`, `role`처럼 권한이나 소속을 결정하는 값은 클라이언트 요청값으로 받지 않는다.

### `PATCH /api/jobs/:jobId`

Request body는 `POST /api/jobs`와 동일한 필드를 사용한다.

권한 기준:

- 현재 로그인 사용자의 `companyId`가 해당 공고의 발주처인 경우 수정 가능하다.
- 또는 해당 공고의 `internalOwnerMemberId`가 현재 로그인 사용자의 회사 구성원인 경우 수정 가능하다.
- 클라이언트가 보낸 `companyId`, `role`, `internalOwnerMemberId`는 수정 권한 판단에 사용하지 않는다.

### `DELETE /api/jobs/:jobId`

권한 기준은 `PATCH /api/jobs/:jobId`와 동일하다.

Response data:

```json
{
  "ok": true
}
```

연결된 RFP, 제안, 계약 정보가 있어 DB 참조 무결성을 깨는 경우 `409 JOB_DELETE_CONFLICT`를 반환한다.

## 7. RFP Files And Analyses

RFP 원문 파일은 저장한다. 파일 본문은 DB에 직접 저장하지 않고 파일 저장소에 보관하며, DB에는 `rfp_files` 메타데이터를 저장한다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/jobs/:jobId/rfp-files` | RFP 파일 목록 조회 |
| `POST` | `/api/jobs/:jobId/rfp-files` | RFP 원문 파일 업로드 |
| `GET` | `/api/jobs/:jobId/rfp-analysis` | RFP 분석 결과 조회 |
| `POST` | `/api/jobs/:jobId/rfp-analysis` | RFP 분석 실행/저장 |

### `POST /api/jobs/:jobId/rfp-files`

Request:

```text
multipart/form-data
file=<RFP 원문 파일>
```

Validation:

- 파일 크기 제한
- 허용 확장자/MIME type 검증
- 악성 파일 검사 또는 격리 절차
- current company 기준 공고 접근 권한 검증

Response data item:

```json
{
  "id": "uuid",
  "jobId": "uuid",
  "originalFileName": "제안요청서.pdf",
  "mimeType": "application/pdf",
  "fileSize": 123456,
  "uploadedAt": "2026-06-26T00:00:00.000Z"
}
```

## 8. Offers

공급 관점 기업의 입찰 참여/제안 단위다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/offers` | 제안/참여 목록 조회 |
| `GET` | `/api/offers/:offerId` | 제안/참여 상세 조회 |
| `POST` | `/api/offers` | 공고를 현재 기업의 참여관리 대상으로 추가 |
| `PATCH` | `/api/offers/:offerId` | 참여 상태 수정 |
| `GET` | `/api/offers/:offerId/matches` | 추천 인력 매칭 목록 조회 |
| `POST` | `/api/offers/:offerId/confirm` | 참여 확정 및 선택 인력 확정 |

### `POST /api/offers`

Request:

```json
{
  "jobId": "uuid",
  "supplierCompanyId": "uuid",
  "status": "draft"
}
```

### `POST /api/offers/:offerId/confirm`

제안/참여 건을 확정 상태로 변경하고, 확정된 투입 후보 인력을 기록한다.

Request:

```json
{
  "confirmedResumeIds": ["uuid"],
  "memo": "확정 사유 또는 내부 메모"
}
```

Response data:

```json
{
  "id": "uuid",
  "status": "confirmed",
  "confirmedResumeIds": ["uuid"],
  "confirmedAt": "2026-06-26T00:00:00.000Z"
}
```

## 9. Resumes

`resumes`는 인력 현황의 개인별 상세 프로필이다. `company_members`와 분리하고, 같은 사람인 경우 `companyMemberId`로 선택 연결한다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/resumes` | 투입 가능 인력 목록 조회 |
| `GET` | `/api/resumes/:resumeId` | 인력 상세 조회 |
| `POST` | `/api/resumes` | 인력 프로필 등록 |
| `PATCH` | `/api/resumes/:resumeId` | 인력 프로필 수정 |

## 10. Contracts

계약은 MVP부터 별도 테이블로 관리한다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/contracts` | 계약 목록 조회 |
| `GET` | `/api/contracts/:contractId` | 계약 상세 조회 |
| `POST` | `/api/contracts` | 계약 등록 |
| `PATCH` | `/api/contracts/:contractId` | 계약 수정 |

Request:

```json
{
  "jobId": "uuid",
  "offerId": "uuid",
  "buyerCompanyId": "uuid",
  "supplierCompanyId": "uuid",
  "contractNo": "C-2026-001",
  "contractAmount": 100000000,
  "startedAt": "2026-07-01",
  "endedAt": "2026-12-31",
  "status": "active"
}
```

## 11. Won Projects

수주 사업은 계약에서 파생된 실제 수행 사업이다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/projects/won` | 수주 사업 목록 조회 |
| `GET` | `/api/projects/won/:projectId` | 수주 사업 상세 조회 |
| `POST` | `/api/projects/won` | 수주 사업 등록 |
| `PATCH` | `/api/projects/won/:projectId` | 수주 사업 수정 |

## 12. Project Assignments

수주 사업에 투입된 인력 목록이다. M/M는 월별 집계 테이블 없이 `project_assignments`의 기간, 투입률, 계획/실적 총합으로 관리한다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/projects/won/:projectId/assignments` | 사업별 투입 인력 조회 |
| `POST` | `/api/projects/won/:projectId/assignments` | 투입 인력 등록 |
| `PATCH` | `/api/project-assignments/:assignmentId` | 투입 인력 수정 |

Request:

```json
{
  "resumeId": "uuid",
  "role": "Backend Developer",
  "assignedFrom": "2026-07-01",
  "assignedTo": "2026-12-31",
  "allocationRate": 1.0,
  "plannedManMonths": 6.0,
  "actualManMonths": 0,
  "status": "assigned"
}
```

## 13. AI Matching

공급기업 관점의 입찰공고 상세에서 투입 후보 인력을 추천한다.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/jobs/:jobId/recommended-people` | 현재 기업의 인력 풀을 기준으로 공고 추천 인력 조회 |

Response data:

```json
{
  "items": [
    {
      "id": "match-resume-id",
      "resumeId": "uuid",
      "name": "김민수",
      "role": "Backend Developer",
      "currentProject": "대기",
      "availableFrom": "2026-07-01",
      "fitScore": 91,
      "reason": "Spring Boot, PostgreSQL 역량 보유 · 즉시 투입 가능"
    }
  ],
  "provider": "gemini"
}
```

`provider`는 Gemini 호출 성공 시 `gemini`, API key 미설정 또는 호출 실패 시 `rule-based`를 반환한다.
