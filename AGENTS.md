# BERYL 에이전트 가이드

## 현재 단계

이 저장소는 현재 인덱싱 단계다.

아직 UI, API, 데이터 모델이 최종 확정된 프로젝트로 보지 않는다. 기존 BERYL 산출물을 읽고, 분류하고, 서로 맞춰보는 작업 공간으로 취급한다. 이미 코드가 존재하더라도 현재 구현이 최종 제품 계약이라고 가정하지 않는다.

## 먼저 읽을 문서

제품 동작, 라우팅, UI 구조, API 계약, 데이터베이스 구조를 변경하기 전에 다음 파일을 순서대로 읽는다.

1. `docs/spec.md`
2. `docs/requirements.md`
3. `docs/auth.md`
4. `docs/erd.md`
5. `docs/api.md`
6. `docs/stitch/manifest.json`
7. `docs/stitch/DESIGN.md`
8. `docs/stitch/IMPLEMENTATION_PLAN.md`
9. 관련 화면 이미지: `docs/stitch/images/`
10. 관련 Stitch HTML: `docs/stitch/code/`

`docs/stitch/IMPLEMENTATION_PLAN.md`에는 일부 깨진 한글이 있다. 화면명, slug, 이미지 경로, HTML 경로는 `docs/stitch/manifest.json`을 기준으로 판단한다.

## 제품 맥락

BERYL은 입찰 공고, RFP 분석, 발주기관, 공급기업, 투입 인력, 추천 매칭 분석, 수주 사업 관리를 위한 조달 운영 플랫폼이다.

로그인 주체는 발주기관 계정과 공급기업 계정으로 나뉘지 않는다. 한 회원은 하나의 기업에 소속되고, 그 기업이 업무 문맥에 따라 발주 관점 또는 공급 관점을 가진다.

현재 제품과 화면의 기준 자료는 `docs/stitch`의 Stitch export다. 활성 디자인 기준은 `docs/stitch/DESIGN.md`에 정의된 BERYL 에메랄드/포레스트 디자인 시스템이다. `raw` export 안에 있는 파란색 `Institutional Authority` 디자인 시스템은 사용자가 명시적으로 지시하지 않는 한 현재 로컬 기준으로 보지 않는다.

## 작업 태도

이 폴더는 인덱싱 단계이므로 다음 원칙을 따른다.

- 추측성 재구현보다 문서화, 매핑, 기준 보존을 우선한다.
- 변경은 사용자의 요청과 직접 관련된 범위로 작게 유지한다.
- Stitch 화면을 React 화면으로 바꾸거나 새 레이아웃을 만들 때는 반드시 해당 PNG와 HTML 기준을 확인한다.
- 사용자가 구현 작업을 명시하기 전에는 백엔드 도메인이나 DB 테이블을 임의로 확장하지 않는다.
- 구현이 요청되면 `docs/spec.md`와 현재 React/Express/PostgreSQL 구조에 맞춘다.

## 현재 기술 스택

- 클라이언트: React, Vite, TypeScript
- 서버: Node.js, Express, TypeScript
- 데이터베이스 대상: PostgreSQL
- API 클라이언트: Axios
- 서버 상태 관리: TanStack React Query
- 라우팅: React Router

## 라우팅 기준

현재 앱 라우트는 `client/src/App.tsx`에 정의되어 있다.

주요 라우트:

- `/login`
- `/signup`
- `/jobs`
- `/jobs/new`
- `/jobs/:jobId`
- `/resumes/:resumeId`
- `/offers/:offerId/analysis`
- `/dashboard/admin`
- `/dashboard/agency`
- `/dashboard/supplier`
- `/agencies`
- `/agencies/new`
- `/agencies/:agencyId/edit`
- `/agency-organizations`
- `/agency-staff`
- `/bid-participation`
- `/clients`
- `/suppliers`
- `/suppliers/new`
- `/suppliers/:supplierId/edit`
- `/suppliers/:supplierId`
- `/projects/won`
- `/projects/won/:projectId`
- `/manpower`

## 코드 작업 지침

- 기존 TypeScript 패턴을 따른다.
- 새 UI primitive를 만들기 전에 `client/src/components` 아래의 공통 컴포넌트를 먼저 확인한다.
- API endpoint와 응답 형태는 `docs/api.md`, `client/src/api`, `docs/spec.md`의 공통 응답 envelope에 맞춘다.
- mock/API 전환 경로는 같은 작업에서 실 backend data로 대체하는 경우가 아니라면 유지한다.
- 인덱싱 단계 작업 중에는 관련 없는 리팩터링을 하지 않는다.

## Auth 작업 지침

- 로그인/회원가입 구현 전 `docs/auth.md`를 먼저 확인한다.
- BERYL은 발주기관 계정과 공급기업 계정을 분리하지 않는다.
- 로그인 주체는 `users`이며, 사용자는 하나의 `companies`에 소속된다.
- 권한 모델은 `systemAdmin`, `companyUser`를 기준으로 한다.
- 발주/공급은 로그인 role이 아니라 current company와 거래 관계의 관점으로 판단한다.
- protected API는 client가 보낸 회사/권한 값을 그대로 신뢰하지 않고 서버에서 검증한다.
- MVP 인증 방식은 httpOnly Cookie 기반 서버 세션 인증을 사용한다.
- JWT는 MVP 인증 방식으로 사용하지 않는다.

## 문서 작업 지침

- 프로젝트 수준 문서는 `docs/` 아래에 둔다.
- 루트 문서는 진입점, 에이전트 가이드, 프로젝트 안내처럼 최소한의 기준 문서로 제한한다.
- 화면명이 충돌하면 `docs/stitch/manifest.json`을 우선한다.
- 디자인 토큰이 충돌하면 `docs/stitch/DESIGN.md`를 우선한다.
- 구현 세부사항이 충돌하면 편집 전에 현재 코드를 확인한다.
