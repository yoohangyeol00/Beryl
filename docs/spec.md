# BERYL Specification

## 1. Product Overview

BERYL(Business E-bidding & Resource Yield Link)은 공공/민간 입찰 공고, RFP 분석, 공급기업, 발주기관, 투입 인력, 수주 사업을 한 곳에서 관리하는 입찰 운영 플랫폼이다.

제품의 핵심 목적은 다음과 같다.

- 발주기관과 공급기업의 입찰 운영 정보를 구조화한다.
- RFP 분석 결과와 추천 인력 매칭 근거를 함께 제공한다.
- 입찰 공고부터 수주 사업, 계약, 투입 인력 현황까지 이어지는 운영 흐름을 추적한다.
- 데이터가 많은 업무 화면에서도 신뢰감 있고 일관된 관리 경험을 제공한다.

현재 MVP는 Stitch 산출물을 기준으로 한 웹 관리 화면, 실데이터 저장, 핵심 CRUD API, 파일 업로드, 참여 확정 흐름을 포함한다. 인증/권한 고도화와 외부 조달 시스템 연동은 단계적으로 확장한다.

## 2. Source Of Truth

현재 제품/화면 기준은 `docs/stitch` 아래 산출물이다.

- `docs/stitch/DESIGN.md`: BERYL 디자인 시스템의 기준 문서
- `docs/stitch/manifest.json`: 화면 ID, 정상 한글 화면명, slug, 이미지/HTML 경로의 기준
- `docs/stitch/images/*.png`: 화면별 시각 기준
- `docs/stitch/code/*.html`: 화면별 HTML 구현 참고
- `docs/stitch/IMPLEMENTATION_PLAN.md`: Stitch MCP 연결 결과, 라우트, 구현 우선순위 참고

`IMPLEMENTATION_PLAN.md` 일부 한글은 인코딩이 깨져 있으므로 화면명과 slug는 `manifest.json`을 우선한다.

`docs/stitch/raw`에는 Stitch 원본 응답과 대체 디자인 시스템이 포함되어 있으나, 현재 제품 테마는 `DESIGN.md`의 BERYL 에메랄드/포레스트 계열 디자인 시스템을 우선한다.

## 3. Technology Baseline

현재 저장소는 다음 구조를 기준으로 한다.

- `client`: React, Vite, TypeScript
- `server`: Node.js, Express, TypeScript
- `server/migrations`: PostgreSQL migration
- API 호출: Axios 기반 client API 모듈
- 서버 상태: TanStack React Query
- 라우팅: React Router

개발 명령은 README의 루트 npm workspace 스크립트를 따른다.

## 4. Users, Companies, And Business Perspectives

BERYL의 로그인 주체는 발주기관 계정과 공급기업 계정으로 분리하지 않는다. 한 회원은 하나의 기업에 소속되고, 그 기업이 업무 문맥에 따라 발주 관점 또는 공급 관점을 가진다.

예:

```text
A기업 로그인
→ A기업 기준 대시보드
→ A기업이 공급 관점에서 관계 맺은 발주기관 목록 확인
→ A기업이 발주 관점에서 관계 맺은 공급기업/인력/사업 확인
```

### System Admin

전체 기업, 공고, 인력, 계약, 수주 사업을 관리한다.

주요 권한:

- 기업 등록 및 수정
- 입찰 공고와 수주 사업 전체 조회
- 인력 풀과 투입 현황 관리
- RFP 분석 및 추천 인력 결과 확인

### Company User

특정 기업에 소속된 일반 사용자다.

주요 권한:

- 본인 기업 기준의 대시보드 조회
- 본인 기업이 발주 관점으로 생성/관리하는 공고와 수주 흐름 확인
- 본인 기업이 공급 관점으로 참여한 공고, 계약, 투입 인력 확인
- 거래 관계가 있는 기업, 기관, 인력, 프로젝트 이력 확인

### Business Perspectives

발주기관과 공급기업은 로그인 역할이 아니라 거래 관계에서 생기는 관점이다.

- 발주 관점: 현재 기업이 공고를 만들거나 사업을 발주하는 입장
- 공급 관점: 현재 기업이 다른 발주처의 공고에 참여하거나 인력을 공급하는 입장

같은 기업이 어떤 프로젝트에서는 발주 관점, 다른 프로젝트에서는 공급 관점을 가질 수 있다. 권한 모델은 계정 role보다 `current_company_id`와 거래 관계를 기준으로 설계한다.

## 5. Routes And Screens

현재 React 라우트는 Stitch 화면 14개를 기준으로 한다.

| Route | Screen | Purpose |
| --- | --- | --- |
| `/login` | 로그인 | 사용자 인증 진입 |
| `/signup` | 회원가입 | 사용자/기업 등록 신청 |
| `/jobs` | 발주기관별 입찰공고 관리 | 현재 기업 기준 입찰 공고 목록, 필터, 상태 관리 |
| `/jobs/:jobId` | 입찰 공고 상세 및 RFP 분석 정보 | 공고 상세, RFP 요건, 추천 인력 요약 |
| `/resumes/:resumeId` | 인력 상세 정보 및 이력 관리 | 인력 프로필, 기술, 프로젝트 이력 |
| `/offers/:offerId/analysis` | 추천 인력 매칭 알고리즘 상세 분석 | 추천 근거, 점수, 매칭 항목 분석 |
| `/dashboard/agency` | 발주기관 관리 대시보드 | 현재 기업의 발주 관점 운영 현황 요약 |
| `/dashboard/supplier` | 공급기업 관리 대시보드 | 현재 기업의 공급 관점 운영 현황 요약 |
| `/agencies` | 발주기관 조직 및 직원 관리 | 현재 기업과 관계 있는 발주처/기관 목록 관리 |
| `/agencies/new` | 발주기관 등록 | 관계 기업/기관 입력 |
| `/agencies/:agencyId/edit` | 발주기관 수정 | 관계 기업/기관 정보 수정 |
| `/suppliers` | 공급기업별 계약사업 관리 | 현재 기업과 관계 있는 공급사별 계약/사업 현황 |
| `/suppliers/new` | 공급기업 등록 | 관계 공급기업 입력 |
| `/suppliers/:supplierId/edit` | 공급기업 수정 | 관계 공급기업 정보 수정 |
| `/projects/won` | 수주 사업 관리 현황 | 낙찰 이후 사업/투입/위험 관리 |
| `/manpower` | 투입인력 관리 및 M/M 현황 | 인력 가용성, 투입률, M/M 관리 |

`/`는 `/jobs`로 이동한다. `/dashboard`는 `/dashboard/agency`로 이동한다.

## 6. Core Domains

### Bid Notice / Job

입찰 공고를 나타내는 핵심 객체다.

기본 필드:

- ID
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

현재 client 타입은 `Job`, `JobList`, `JobDetail`을 기준으로 한다.

### RFP Analysis

입찰 상세 화면에서 제공되는 요구사항 분석 결과다.

포함해야 할 정보:

- 주요 사업 목표
- 필수 요구사항
- 우대 요구사항
- 기술/역량 키워드
- 일정 및 위험 요소
- 추천 인력 매칭에 사용된 근거
- 분석 점수와 해석

RFP 분석은 의사결정 지원 정보이며, 최종 입찰/인력 확정은 사용자가 수행한다.

RFP 원문 파일은 저장한다. 원문 파일은 파일 저장소에 보관하고, DB에는 파일명, 저장 키, MIME type, 크기, 업로드 사용자, 업로드 시각 같은 메타데이터를 저장한다.

### Person / Resume

투입 가능한 인력과 이력 정보를 나타낸다.

기본 필드:

- ID
- 이름
- 역할
- 기술 스택
- 투입 가능일
- 경력
- 프로젝트 이력
- 자격/교육
- 현재 투입 상태

현재 client 타입은 `Resume`을 기준으로 한다.

`Resume`은 기업 구성원 정보와 분리된 투입 인력 상세 프로필이다. 같은 사람이 기업 구성원이면서 투입 가능 인력인 경우에는 선택 연결 필드로 연결한다.

### Offer / Matching Analysis

입찰 공고와 추천 인력/공급기업의 매칭 결과를 나타낸다.

기본 필드:

- ID
- 공고 ID
- 공급기업명
- 상태
- 추천 점수
- 추천 사유
- 기술 매칭
- 경력 매칭
- 가용성 매칭
- 위험/보완 항목

현재 client 타입은 `Offer`를 기준으로 한다.

### Company

로그인과 거래 관계의 기준이 되는 기업이다.

필요 필드:

- ID
- 기업명
- 기업 유형
- 사업자등록번호 또는 기관 식별번호
- 대표자
- 주소
- 대표 연락처
- 담당자 목록
- 보유 기술/전문 영역
- 활성 상태

### Company Relationship

두 기업 사이의 발주/공급 관계를 나타낸다. 발주기관과 공급기업은 별도 로그인 역할이 아니라, 관계 안에서 정해지는 관점이다.

필요 필드:

- ID
- 기준 기업 ID
- 상대 기업 ID
- 기준 기업 관점
- 상대 기업 관점
- 관계 유형
- 최초 거래일
- 최근 활동일
- 활성 상태

예:

- A기업이 B기관에 인력을 공급하면 A의 관점은 `supplier`, B의 관점은 `buyer`다.
- A기업이 C기업에 사업을 발주하면 A의 관점은 `buyer`, C의 관점은 `supplier`다.

### Won Project

낙찰 이후 수행 중인 사업을 나타낸다.

필요 필드:

- ID
- 원 입찰 공고 ID
- 계약 ID
- 사업명
- 발주 관점 기업
- 공급 관점 기업
- 계약 기간
- 계약 금액
- 투입 인력
- M/M 계획 및 실적
- 진행 상태
- 위험 요소

계약 정보는 `won_projects`에 포함하지 않고 별도 계약 테이블로 분리한다.

## 7. Status Rules

### JobStatus

현재 client 타입 기준:

- `draft`: 작성 중
- `open`: 진행 중
- `closingSoon`: 마감 임박
- `closed`: 마감
- `awarded`: 낙찰

### OfferStatus

현재 client 타입 기준:

- `draft`: 작성 중
- `submitted`: 제출
- `awarded`: 선정
- `rejected`: 미선정

### Additional Status Candidates

향후 도메인 확장 시 다음 상태를 별도 enum으로 정의한다.

- 인력 투입 상태: `available`, `assigned`, `partiallyAssigned`, `unavailable`
- 계약 상태: `planned`, `active`, `completed`, `cancelled`
- 수주 사업 상태: `preparing`, `inProgress`, `atRisk`, `completed`
- 기관/기업 상태: `active`, `inactive`, `pending`

상태값은 API, DB, UI badge가 같은 enum을 공유해야 한다.

## 8. API Specification

BERYL API의 상세 endpoint, request/response, query parameter, status code는 `docs/api.md`를 기준으로 한다.

이 문서에서는 API의 상위 원칙만 정의한다.

### API Principles

- Base path는 `/api`를 사용한다.
- 모든 API는 공통 응답 envelope을 사용한다.
- 목록 API는 pagination, filtering, sorting을 지원한다.
- 인증 이후 protected API는 current company 기준 접근 범위를 검증한다.
- route handler에 비즈니스 로직을 누적하지 않고 service/repository 계층으로 분리한다.

### Common Response Envelope

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

### API Scope

MVP API 범위는 다음 도메인을 포함한다.

- Auth
- Companies
- Company Relationships
- Jobs
- RFP Files
- RFP Analyses
- Offers
- Offer Confirmations
- Resumes
- Contracts
- Won Projects
- Project Assignments

MVP API는 조회 전용이 아니며, 각 도메인의 조회, 등록, 수정, 파일 업로드, 상태 확정 endpoint를 포함한다. 상세 endpoint, query parameter, request/response 예시는 `docs/api.md`를 따른다.

## 9. Matching And Analysis Principles

추천 인력 매칭은 설명 가능해야 한다.

매칭 점수는 최소한 다음 요소를 분리해서 보여준다.

- 필수 기술 일치도
- 우대 기술 일치도
- 유사 프로젝트 경험
- 공공/기관 사업 경험
- 투입 가능일
- 현재 M/M 여유
- 경력 연차
- 위험 요소

사용자는 추천 결과를 그대로 확정하지 않고, 상세 근거를 확인한 뒤 최종 확정한다.

시스템은 다음을 하지 않는다.

- 사람의 검토 없이 자동으로 인력을 확정하지 않는다.
- 추천 사유 없이 점수만 표시하지 않는다.
- RFP 분석 결과를 확정된 법적/계약적 해석으로 표현하지 않는다.

## 10. UI And Design Rules

UI는 `docs/stitch/DESIGN.md`를 기준으로 한다.

주요 규칙:

- Primary color는 Emerald Green 계열을 사용한다.
- Sidebar, header, data-heavy area는 안정감 있는 forest/neutral 계열을 사용한다.
- 카드와 테이블은 흰색 surface와 emerald-tinted border를 사용한다.
- 영구적인 heavy shadow는 사용하지 않는다.
- 데이터 테이블은 정보 밀도를 유지하되 행/열 정렬과 상태 badge를 명확히 한다.
- 모바일에서는 주요 레이아웃을 단일 컬럼으로 접고, 큰 테이블은 horizontal scroll을 허용한다.

공통 컴포넌트:

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

화면별 React DOM 구현은 Stitch PNG와 비교하면서 진행한다.

## 11. Implementation Policy

현재 구현 정책:

- Stitch 화면은 제품의 시각적 기준이다.
- `manifest.json`의 slug와 화면명을 기준으로 라우트/페이지명을 유지한다.
- mock data, API client, React Query 구조는 실 API 전환을 위해 유지한다.
- 화면을 새로 만들 때는 기존 공통 컴포넌트를 우선 사용한다.
- 반복 테이블/카드 UI는 화면 안에 중복 구현하지 않고 공통 컴포넌트로 흡수한다.
- TypeScript 타입은 API 응답과 UI 사용처가 공유할 수 있게 명확히 유지한다.

구현 순서:

1. 현재 14개 라우트와 화면 구조 유지
2. PostgreSQL schema와 seed data 추가
3. MVP API 연결: 조회, 등록, 수정, RFP 파일 업로드, 참여 확정
4. 인증/권한 도입
5. 등록/수정/확정 workflow의 화면 폼과 상태 전환 정리
6. RFP 분석/추천 매칭 로직을 mock에서 실제 서비스로 전환

## 12. Data Persistence Plan

PostgreSQL 도입 시 우선 테이블 후보:

- `users`
- `companies`
- `company_members`
- `company_relationships`
- `jobs`
- `job_requirements`
- `rfp_files`
- `rfp_analyses`
- `resumes`
- `resume_skills`
- `resume_projects`
- `offers`
- `offer_matches`
- `contracts`
- `won_projects`
- `project_assignments`

모든 주요 테이블은 다음 audit 필드를 갖는다.

- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

삭제는 기본적으로 soft delete를 우선 검토한다.

## 13. Empty, Loading, And Error States

모든 데이터 화면은 다음 상태를 가진다.

- Loading: 데이터 요청 중
- Empty: 조건에 맞는 데이터 없음
- Error: 요청 실패 또는 권한 없음
- Partial: 일부 위젯 또는 표만 실패

목록 화면의 빈 상태는 사용자가 다음 행동을 할 수 있도록 검색어 초기화, 필터 해제, 신규 등록 버튼 중 하나를 제공한다.

오류 메시지는 사용자에게 내부 구현 오류를 노출하지 않고, 재시도 또는 관리자 문의에 필요한 최소 정보를 제공한다.

## 14. Security And Privacy

MVP 이후 인증/인가 도입 시 다음 원칙을 따른다.

- 기업 회원 권한과 현재 기업 기준 접근 범위를 서버와 클라이언트 양쪽에서 검증한다.
- 개인정보와 인력 이력 정보는 필요한 사용자에게만 노출한다.
- 서버는 클라이언트가 보낸 역할/권한/current company 값을 그대로 신뢰하지 않는다.
- 외부 RFP 문서 업로드가 추가되면 파일 크기, 형식, 악성 파일 검사를 수행한다.
- 민감한 설정값은 `.env` 또는 배포 환경 secret에 둔다.

## 15. Non-Goals For MVP

MVP에서 제외한다.

- 실시간 나라장터/조달청 자동 연동
- 전자계약/전자서명
- 결제/정산
- AI 자동 입찰 결정
- AI 자동 인력 확정
- 복잡한 조직별 승인 workflow
- 모바일 전용 앱

위 항목은 제품 흐름과 데이터 모델이 안정화된 뒤 별도 spec으로 확장한다.
