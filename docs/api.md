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
| `POST` | `/api/auth/login` | 로그인 |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/auth/me` | 현재 사용자와 소속 기업 조회 |

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
    "name": "A기업"
  }
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

### `GET /api/companies`

Query:

- `q`
- `status`
- `companyType`
- `page`
- `pageSize`

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

### `GET /api/jobs`

Query:

- `q`
- `status`: `draft`, `open`, `closingSoon`, `closed`, `awarded`
- `procurementType`: `public`, `private`
- `sourceType`: `nara`, `private_bid`, `manual`, `email`, `other`
- `buyerCompanyId`
- `page`
- `pageSize`
- `sort`
- `order`

### `POST /api/jobs`

Request:

```json
{
  "noticeNumber": "2026-0001",
  "title": "차세대 시스템 구축",
  "buyerCompanyId": "uuid",
  "internalOwnerMemberId": "uuid",
  "procurementType": "public",
  "sourceType": "nara",
  "sourceUrl": "https://example.com/notice",
  "category": "IT",
  "budget": 100000000,
  "publishedAt": "2026-06-01",
  "deadline": "2026-06-30",
  "description": "공고 설명"
}
```

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
