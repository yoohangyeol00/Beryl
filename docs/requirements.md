# BERYL 제품/시스템 요구사항 초안

## 1. 문서 목적

이 문서는 BERYL 제품과 시스템 구현을 위한 요구사항을 정리한다.

현재 문서는 확정된 상세 설계서가 아니라, 이후 구현과 검증의 기준이 될 제품/시스템 요구사항 초안이다. 요구사항의 대상은 BERYL 제품, 화면, API, 데이터, 보안, 운영 품질이다.

이 문서는 다음 질문에 답하는 것을 목표로 한다.

- BERYL은 어떤 사용자를 대상으로 하는가?
- 기업 회원은 어떤 관점으로 데이터를 보는가?
- 어떤 화면과 기능이 MVP 범위에 포함되는가?
- API, 데이터, UI, 보안은 어떤 기준을 따라야 하는가?
- 구현 후 어떤 기준으로 검증해야 하는가?

상위 기준 문서:

- `AGENTS.md`: 프로젝트 작업 원칙
- `docs/spec.md`: 제품, 도메인, API, UI 기준
- `docs/erd.md`: 예상 데이터 모델과 관계
- `docs/api.md`: API endpoint 상세
- `docs/stitch/manifest.json`: 화면 목록과 경로 기준
- `docs/stitch/DESIGN.md`: 디자인 시스템 기준

## 2. 사용자와 기업 관점 요구사항

### REQ-ROLE-001: 로그인 주체

시스템의 일반 로그인 주체는 하나의 기업 회원이다. 한 사용자는 하나의 기업에 소속되고, 해당 기업 기준으로 화면과 데이터를 본다.

수용 기준:

- 일반 사용자 권한은 `companyUser`를 기본으로 본다.
- 시스템 운영자는 `systemAdmin`으로 구분한다.
- 발주/공급은 로그인 role이 아니라 기업 간 거래 관계와 화면 관점으로 판단한다.

### REQ-ROLE-002: 시스템 관리자 범위

시스템 관리자는 전체 기업, 입찰 공고, 인력, 계약, 수주 사업을 조회하고 관리할 수 있어야 한다.

수용 기준:

- 기업 등록 및 수정 화면 접근이 가능해야 한다.
- 입찰 공고, 인력, 수주 사업 현황을 전체 기준으로 볼 수 있어야 한다.

### REQ-ROLE-003: 기업 회원 범위

기업 회원은 본인 기업 기준으로 발주 관점과 공급 관점의 데이터를 확인할 수 있어야 한다.

수용 기준:

- `/dashboard/agency`는 현재 기업의 발주 관점 현황을 보여준다.
- `/dashboard/supplier`는 현재 기업의 공급 관점 현황을 보여준다.
- `/jobs`, `/jobs/:jobId`, `/offers/:offerId/analysis`는 현재 기업과 관련된 공고/RFP/매칭 흐름을 보여준다.
- `/suppliers`, `/projects/won`, `/manpower`는 현재 기업의 거래 관계, 수주 사업, 투입 인력 흐름과 연결되어야 한다.

### REQ-ROLE-004: 관점 전환

하나의 기업은 업무 문맥에 따라 발주 관점과 공급 관점을 모두 가질 수 있어야 한다.

수용 기준:

- A기업이 B기관에 인력을 공급하면 A기업은 공급 관점으로 B기관을 본다.
- A기업이 C기업에 사업을 발주하면 A기업은 발주 관점으로 C기업과 투입 인력을 본다.
- 관점은 사용자 로그인 종류가 아니라 `current_company_id`와 기업 간 관계 데이터로 결정되어야 한다.

## 3. 화면 요구사항

### REQ-SCR-001: 기준 화면 유지

현재 14개 Stitch 기준 화면은 MVP 화면 범위로 유지한다.

필수 화면:

- 로그인
- 회원가입
- 발주기관별 입찰공고 관리
- 입찰 공고 상세 및 RFP 분석 정보
- 추천 인력 매칭 알고리즘 상세 분석
- 인력 상세 정보 및 이력 관리
- 발주기관 관리 대시보드
- 공급기업 관리 대시보드
- 발주기관 조직 및 직원 관리
- 발주기관 등록 및 수정
- 공급기업별 계약사업 관리
- 공급기업 등록 및 수정
- 수주 사업 관리 현황
- 투입인력 관리 및 M/M 현황

수용 기준:

- 모든 기준 화면은 React 라우트에 대응되어야 한다.
- 라우트명과 화면 목적은 `docs/spec.md`와 충돌하지 않아야 한다.
- 화면 구현 변경 시 해당 PNG/HTML reference를 확인해야 한다.

### REQ-SCR-002: 라우팅 유지

현재 주요 라우트는 유지한다.

필수 라우트:

- `/login`
- `/signup`
- `/jobs`
- `/jobs/:jobId`
- `/resumes/:resumeId`
- `/offers/:offerId/analysis`
- `/dashboard/agency`
- `/dashboard/supplier`
- `/agencies`
- `/agencies/new`
- `/agencies/:agencyId/edit`
- `/suppliers`
- `/suppliers/new`
- `/suppliers/:supplierId/edit`
- `/projects/won`
- `/manpower`

수용 기준:

- `/`는 `/jobs`로 이동한다.
- `/dashboard`는 `/dashboard/agency`로 이동한다.
- 라우트 변경은 관련 문서와 함께 갱신되어야 한다.

### REQ-SCR-003: 상태 화면

모든 데이터 화면은 loading, empty, error 상태를 가져야 한다.

수용 기준:

- 데이터 요청 중에는 loading 상태를 표시한다.
- 결과가 없으면 empty 상태를 표시한다.
- 요청 실패 시 error 상태와 재시도 가능성을 제공한다.
- 일부 영역만 실패한 경우 전체 화면을 깨지 않고 partial 상태를 허용한다.

## 4. 기능 요구사항

### REQ-FN-001: 입찰 공고 목록

사용자는 입찰 공고 목록을 조회할 수 있어야 한다.

필수 정보:

- 공고번호
- 제목
- 발주기관
- 분류
- 예산
- 게시일
- 마감일
- 상태
- RFP 분석 점수
- 추천 인력 수

수용 기준:

- 목록은 검색, 상태 필터, 정렬, 페이지네이션을 지원해야 한다.
- 상태는 `JobStatus` enum과 일치해야 한다.

### REQ-FN-002: 입찰 공고 상세

사용자는 입찰 공고 상세와 RFP 분석 요약을 확인할 수 있어야 한다.

수용 기준:

- 공고 기본 정보와 요구사항이 표시되어야 한다.
- RFP 분석 점수와 주요 근거가 표시되어야 한다.
- 추천 인력 또는 매칭 분석 화면으로 이동할 수 있어야 한다.

### REQ-FN-003: RFP 분석

시스템은 RFP 분석 정보를 사용자가 이해할 수 있는 구조로 제공해야 한다.

필수 항목:

- 주요 사업 목표
- 필수 요구사항
- 우대 요구사항
- 기술/역량 키워드
- 일정 및 위험 요소
- 추천 매칭에 사용된 근거

수용 기준:

- 분석 결과는 확정된 법적/계약적 해석처럼 표현하지 않는다.
- 분석 점수만 단독으로 보여주지 않고 근거를 함께 제공한다.

### REQ-FN-004: 추천 인력 매칭 분석

사용자는 추천 인력 매칭의 점수와 근거를 확인할 수 있어야 한다.

필수 평가 항목:

- 필수 기술 일치도
- 우대 기술 일치도
- 유사 프로젝트 경험
- 공공/기관 사업 경험
- 투입 가능일
- 현재 M/M 여유
- 경력 연차
- 위험 요소

수용 기준:

- 시스템은 사람의 검토 없이 인력을 자동 확정하지 않는다.
- 사용자가 최종 확정하는 구조를 유지한다.

### REQ-FN-005: 인력 상세 및 이력

사용자는 인력 상세 정보와 이력을 확인할 수 있어야 한다.

필수 정보:

- 이름
- 역할
- 기술 스택
- 투입 가능일
- 경력
- 프로젝트 이력
- 자격/교육
- 현재 투입 상태

수용 기준:

- 인력 상세는 추천 매칭 및 M/M 현황과 연결될 수 있어야 한다.
- 기업 구성원 정보와 투입 인력 프로필은 분리되어야 한다.
- 같은 사람이 기업 구성원이면서 투입 인력인 경우 선택 연결 필드로 연결할 수 있어야 한다.

### REQ-FN-006: 관계 발주처 관리

사용자는 현재 기업이 공급 관점에서 관계 맺은 발주처/기관 정보를 관리할 수 있어야 한다.

필수 정보:

- 기업/기관명
- 기업/기관 유형
- 식별번호
- 주소
- 대표 연락처
- 담당자 목록
- 활성 상태

수용 기준:

- 목록 화면과 등록/수정 화면이 분리되어야 한다.
- 향후 권한 적용 시 현재 기업이 접근 가능한 관계 기업만 조회/수정할 수 있어야 한다.

### REQ-FN-007: 관계 공급기업 관리

사용자는 현재 기업이 발주 관점에서 관계 맺은 공급기업과 계약사업 정보를 관리할 수 있어야 한다.

필수 정보:

- 기업명
- 사업자등록번호
- 대표자
- 연락처
- 보유 기술/전문 영역
- 계약사업 목록
- 인력 보유 현황
- 활성 상태

수용 기준:

- 목록 화면과 등록/수정 화면이 분리되어야 한다.
- 계약사업과 수주 사업 흐름이 연결될 수 있어야 한다.

### REQ-FN-008: 수주 사업 관리

사용자는 낙찰 이후 사업 현황을 확인할 수 있어야 한다.

필수 정보:

- 원 입찰 공고
- 사업명
- 발주 관점 기업
- 공급 관점 기업
- 계약 기간
- 계약 금액
- 투입 인력
- M/M 계획 및 실적
- 진행 상태
- 위험 요소

수용 기준:

- 사업 상태와 위험 요소가 명확히 표시되어야 한다.
- 인력 투입 현황과 연결될 수 있어야 한다.
- 계약 정보는 별도 계약 데이터로 관리하고 수주 사업과 연결되어야 한다.

### REQ-FN-009: 투입 인력 및 M/M 현황

사용자는 인력 가용성, 투입률, M/M 현황을 확인할 수 있어야 한다.

수용 기준:

- 현재 투입 인력과 가용 인력이 구분되어야 한다.
- 인력별 투입 상태와 투입 가능일을 확인할 수 있어야 한다.
- 수주 사업과 연결 가능한 구조를 유지해야 한다.
- M/M는 `project_assignments`의 투입 기간과 투입률로 계산할 수 있어야 한다.
- 계획/실적 M/M 총합은 화면 표시와 요약을 위해 저장할 수 있어야 한다.
- 월별 집계 테이블은 MVP 범위에 포함하지 않는다.

## 5. API 요구사항

API endpoint 상세, request/response, query parameter, status code는 `docs/api.md`를 기준으로 한다. 이 문서에서는 제품/시스템 요구 수준만 정의한다.

### REQ-API-001: 공통 응답 형식

모든 신규 API는 공통 응답 envelope을 사용해야 한다.

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

수용 기준:

- 클라이언트 API 타입과 서버 응답 형태가 일치해야 한다.
- 내부 오류 상세는 사용자에게 직접 노출하지 않는다.

### REQ-API-002: MVP API 범위

MVP API는 조회 API만으로 제한하지 않는다. 화면에서 수행하는 핵심 업무 흐름에 필요한 조회, 등록, 수정, 파일 업로드, 참여 확정 API를 같은 MVP 범위로 구현한다.

필수 endpoint:

- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `POST /api/jobs`
- `PATCH /api/jobs/:jobId`
- `GET /api/jobs/:jobId/rfp-files`
- `POST /api/jobs/:jobId/rfp-files`
- `GET /api/jobs/:jobId/rfp-analysis`
- `POST /api/jobs/:jobId/rfp-analysis`
- `GET /api/companies`
- `GET /api/companies/:companyId`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `GET /api/company-relationships`
- `POST /api/company-relationships`
- `PATCH /api/company-relationships/:relationshipId`
- `GET /api/resumes`
- `GET /api/resumes/:resumeId`
- `POST /api/resumes`
- `PATCH /api/resumes/:resumeId`
- `GET /api/offers`
- `GET /api/offers/:offerId`
- `POST /api/offers`
- `PATCH /api/offers/:offerId`
- `GET /api/offers/:offerId/matches`
- `POST /api/offers/:offerId/confirm`
- `GET /api/contracts`
- `GET /api/contracts/:contractId`
- `POST /api/contracts`
- `PATCH /api/contracts/:contractId`
- `GET /api/projects/won`
- `GET /api/projects/won/:projectId`
- `POST /api/projects/won`
- `PATCH /api/projects/won/:projectId`
- `GET /api/projects/won/:projectId/assignments`
- `POST /api/projects/won/:projectId/assignments`
- `PATCH /api/project-assignments/:assignmentId`

수용 기준:

- 목록 API는 pagination, filtering, sorting을 지원해야 한다.
- 상세 API는 존재하지 않는 ID에 대해 명확한 404 오류를 반환해야 한다.
- 등록/수정 API는 입력값 검증, current company 기준 접근 권한 검증, 명확한 오류 응답을 제공해야 한다.
- 상태 변경 API는 같은 요청이 중복 호출되어도 데이터가 비정상적으로 중복 생성되지 않도록 처리해야 한다.

### REQ-API-003: Health Check

서버는 health check endpoint를 제공해야 한다.

필수 endpoint:

- `GET /api/health`

수용 기준:

- 서버 상태와 DB 연결 상태를 확인할 수 있어야 한다.

### REQ-API-004: RFP 파일과 계약 API

RFP 원문 파일 저장과 계약 분리를 지원하는 API를 제공해야 한다.

MVP 포함 endpoint:

- `POST /api/jobs/:jobId/rfp-files`
- `GET /api/jobs/:jobId/rfp-files`
- `POST /api/contracts`
- `PATCH /api/contracts/:contractId`
- `POST /api/offers/:offerId/confirm`

수용 기준:

- RFP 파일 업로드 API는 파일 검증과 접근 권한 검사를 수행해야 한다.
- 계약 API는 발주 관점 기업, 공급 관점 기업, 공고, 수주 사업과 연결될 수 있어야 한다.
- 참여 확정 API는 확정 대상 제안, 선택 인력, 후속 계약/수주 사업 생성 여부를 추적할 수 있어야 한다.

## 6. 데이터 요구사항

### REQ-DATA-001: 주요 도메인 모델

시스템은 다음 도메인을 기준으로 데이터를 모델링해야 한다.

- User
- Company
- Company Member
- Company Relationship
- Job
- Job Requirement
- RFP File
- RFP Analysis
- Resume
- Resume Skill
- Resume Project
- Offer
- Offer Match
- Contract
- Won Project
- Project Assignment

수용 기준:

- DB 스키마를 만들 때 `docs/spec.md`의 Data Persistence Plan을 우선한다.
- 도메인 간 관계는 입찰 공고, 추천 매칭, 인력 투입, 수주 사업 흐름을 설명할 수 있어야 한다.

### REQ-DATA-002: 상태 enum 일관성

상태값은 API, DB, UI badge가 같은 의미로 사용해야 한다.

수용 기준:

- `JobStatus`와 `OfferStatus`는 client 타입과 일치해야 한다.
- 새 상태값을 추가하면 타입, API, UI 문서를 함께 갱신해야 한다.

### REQ-DATA-003: Audit 필드

주요 영속 테이블은 audit 필드를 가져야 한다.

필수 필드:

- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

수용 기준:

- 생성/수정 시각은 서버 기준으로 기록한다.
- 삭제 정책은 기본적으로 soft delete를 우선 검토한다.

## 7. UI 요구사항

### REQ-UI-001: 디자인 시스템 준수

UI는 `docs/stitch/DESIGN.md`의 BERYL 디자인 시스템을 따른다.

수용 기준:

- Primary color는 에메랄드 계열을 사용한다.
- 카드와 테이블은 흰색 surface와 emerald-tinted border를 사용한다.
- 영구적인 heavy shadow를 사용하지 않는다.
- 데이터 테이블은 정보 밀도와 가독성을 함께 유지한다.

### REQ-UI-002: 공통 컴포넌트 우선

새 화면은 기존 공통 컴포넌트를 우선 사용해야 한다.

대상 컴포넌트:

- `MainLayout`
- `AuthLayout`
- `Header`
- `Sidebar`
- `PageTitle`
- `PageToolbar`
- `Button`
- `Card`
- `Input`
- `DataTable`
- `Badge`
- `StatusBadge`
- `MetricCard`
- `EmptyState`
- `LoadingState`
- `Modal`

수용 기준:

- 반복되는 테이블/카드/상태 UI는 화면 안에 중복 구현하지 않는다.
- 새 primitive 추가는 기존 컴포넌트로 표현하기 어려운 경우로 제한한다.

### REQ-UI-003: Stitch 기준 검증

Stitch 화면을 React DOM으로 전환할 때는 PNG와 HTML을 기준으로 검증해야 한다.

수용 기준:

- 화면 목적과 정보 구조가 기준 화면과 일치해야 한다.
- 색상, spacing, typography는 `DESIGN.md`와 충돌하지 않아야 한다.
- 데이터가 없거나 길어져도 레이아웃이 깨지지 않아야 한다.

## 8. 보안 및 개인정보 요구사항

### REQ-SEC-001: 기업 기준 접근 제어

인증/인가 도입 시 서버와 클라이언트 양쪽에서 사용자 소속 기업과 현재 기업 기준 접근 범위를 검증해야 한다.

수용 기준:

- 서버는 클라이언트가 보낸 역할 값이나 current company 값을 그대로 신뢰하지 않는다.
- 권한 없는 접근에는 명확한 오류 응답을 반환한다.

### REQ-SEC-002: 민감 정보 보호

인력 이력, 담당자 연락처, 기업/기관 식별정보는 필요한 사용자에게만 노출해야 한다.

수용 기준:

- 개인정보성 필드는 화면과 API에서 노출 범위를 제한할 수 있어야 한다.
- 민감 설정값은 `.env` 또는 배포 secret으로 관리한다.

### REQ-SEC-003: RFP 원문 파일 저장

RFP/제안요청서/과업지시서 원문 파일은 저장 대상이다. 파일 업로드와 보관 시 보안 검사를 수행해야 한다.

수용 기준:

- 파일 크기 제한이 있어야 한다.
- 허용 확장자와 MIME type을 검증해야 한다.
- 악성 파일 검사 또는 격리 절차를 고려해야 한다.
- 파일 본문은 DB에 직접 저장하지 않고 파일 저장소에 보관해야 한다.
- DB에는 파일명, 저장 키, MIME type, 크기, 업로드 사용자, 업로드 시각 같은 메타데이터를 저장해야 한다.

## 9. 비기능 요구사항

### REQ-NF-001: 사용성

데이터가 많은 화면에서도 사용자가 현재 위치와 다음 행동을 이해할 수 있어야 한다.

수용 기준:

- 화면 제목과 주요 액션이 명확해야 한다.
- 목록 화면은 검색, 필터, 정렬, 페이지네이션을 제공해야 한다.
- 빈 상태는 다음 행동을 안내해야 한다.

### REQ-NF-002: 유지보수성

도메인 타입, API 호출, UI 컴포넌트는 재사용 가능한 구조를 유지해야 한다.

수용 기준:

- TypeScript 타입은 중복 정의를 피한다.
- API 호출은 `client/src/api` 구조를 따른다.
- 화면별 mock 데이터는 실 API 전환 가능성을 해치지 않아야 한다.

### REQ-NF-003: 확장성

MVP 이후 인증, DB, 외부 조달 시스템 연동, RFP 분석 서비스를 추가할 수 있어야 한다.

수용 기준:

- API endpoint는 `/api` prefix를 유지한다.
- DB 모델은 입찰 공고에서 수주 사업까지 이어지는 흐름을 확장할 수 있어야 한다.
- RFP 분석과 추천 매칭은 mock에서 실제 서비스로 교체 가능한 경계를 가져야 한다.

## 10. MVP 제외 범위

MVP에서는 다음을 제외한다.

- 실시간 나라장터/조달청 자동 연동
- 전자계약/전자서명
- 결제/정산
- AI 자동 입찰 결정
- AI 자동 인력 확정
- 복잡한 조직별 승인 workflow
- 모바일 전용 앱

위 항목은 제품 흐름과 데이터 모델이 안정화된 후 별도 요구사항으로 분리한다.

## 11. 검증 체크리스트

구현 작업 전 확인:

- 관련 화면이 `manifest.json`에 존재하는가?
- 관련 PNG/HTML reference를 확인했는가?
- `docs/spec.md`와 충돌하지 않는가?
- 현재 React 라우트와 컴포넌트 구조를 확인했는가?

구현 작업 후 확인:

- TypeScript typecheck가 통과하는가?
- 기존 라우트가 유지되는가?
- loading, empty, error 상태가 있는가?
- API 응답 형태가 문서와 일치하는가?
- 새 문서나 코드가 제품 요구사항과 핵심 도메인 전제를 깨지 않는가?
