# BERYL 개발 환경

## 1. 문서 목적

이 문서는 BERYL을 로컬에서 이해하고 실행하고 검증하기 위한 개발 환경 기준을 정리한다.

현재 저장소는 인덱싱 단계다. 따라서 이 문서는 최종 운영/배포 문서가 아니라, 현재 코드와 Stitch 산출물을 기준으로 개발자가 같은 환경에서 작업하기 위한 실무 기준이다.

관련 문서:

- `AGENTS.md`: 현재 단계와 작업 원칙
- `docs/spec.md`: 제품, 도메인, API, UI 기준
- `docs/requirements.md`: 제품/시스템 요구사항 초안
- `docs/auth.md`: 로그인/회원가입, 권한, 세션 기준
- `docs/erd.md`: 예상 데이터 모델과 관계
- `docs/api.md`: API endpoint 상세
- `docs/stitch/DESIGN.md`: BERYL 디자인 시스템
- `docs/stitch/manifest.json`: Stitch 화면 목록과 경로

## 2. Recommended Stack

현재 BERYL은 이미 구성된 React/Vite/Express/PostgreSQL 구조를 기준 스택으로 유지한다. 인덱싱 단계에서는 프레임워크 교체보다 현재 구조를 정리하고 안정화하는 것을 우선한다.

### Build & Package

- npm workspaces: `client`, `server` monorepo 관리
- Vite: client dev server 및 production build
- TypeScript: client/server 타입 안정성
- Root scripts: `npm run dev`, `npm run build`, `npm run typecheck`

### Frontend

- React
- React Router: route 정의와 화면 전환
- TanStack React Query: server state, loading/error/cache 관리
- Axios: API client
- Tailwind CSS: Stitch 디자인 시스템 구현
- lucide-react: 아이콘

### Routing

- React Router를 기준으로 한다.
- 라우트 정의 위치는 `client/src/App.tsx`다.
- 현재 구현 기준으로 `/`는 `/buyer/dashboard`로 redirect한다.
- 현재 구현 기준으로 `/dashboard`는 `/buyer/dashboard`로 redirect한다.
- 발주기관 모드 화면은 `/buyer/*`, 공급기관 모드 화면은 `/supplier/*` 경로를 기준으로 분리한다.
- 기존 `/jobs`, `/suppliers`, `/clients`, `/bid-participation`, `/manpower`, `/projects/won`, `/dashboard/agency`, `/dashboard/supplier` 경로는 호환을 위해 새 경로로 redirect한다.
- 기업 기준 접근 제어는 auth 도입 후 route guard로 추가한다.

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- `pg`: PostgreSQL client
- `node-pg-migrate`: migration 관리
- `helmet`: 기본 보안 헤더
- `cors`: client/server 로컬 연동
- `dotenv`: 환경 변수 로드

### Server Logic

현재 서버는 `server/src/index.ts` 중심의 초기 구조다. API가 늘어나면 다음 구조를 권장한다.

- `index.ts`: app bootstrap, middleware, error handler, server listen
- `routes`: Express route 정의
- `services`: 도메인 로직
- `repositories` 또는 `data-access`: DB query
- `types` 또는 `schemas`: API request/response 타입과 검증 스키마

route handler에 도메인 로직과 SQL query를 직접 누적하지 않는다.

### Auth

현재 auth는 구현 전 단계지만, MVP 인증 방식은 httpOnly Cookie 기반 서버 세션 인증으로 확정한다.

권장 방향:

- 서버가 session을 생성하고 브라우저에는 httpOnly cookie를 발급
- session 저장소는 PostgreSQL 기반 session store 우선 검토
- 권한 모델: `systemAdmin`, `companyUser`
- `systemAdmin`은 일반 회원가입으로 생성하지 않고, 필요 시 프로그램 초기 설정, seed, 운영 스크립트로 생성
- 발주/공급은 로그인 role이 아니라 현재 기업과 거래 관계의 관점으로 판단
- client: route guard와 current-company-aware navigation
- server: 모든 protected API에서 사용자 소속 기업과 접근 대상 기업 관계 검증
- 비밀번호 저장 시 bcrypt 또는 argon2 계열 password hashing 사용
- localStorage/sessionStorage에 access token을 저장하지 않음
- CORS는 cookie 전송을 위해 허용 origin과 `credentials: true`를 명시
- secret은 `.env`와 배포 secret으로만 관리

인덱싱 단계에서는 auth 라이브러리를 먼저 추가하지 말고 역할 모델과 보호 대상 route/API를 문서화한다.

### Data & API

- REST API 우선
- API prefix: `/api`
- MVP API는 조회, 등록, 수정, RFP 파일 업로드, 참여 확정 흐름을 같은 범위로 본다.
- 목록 API는 pagination/filter/sort 규칙을 공유
- DB schema 변경은 migration으로만 수행
- API 응답은 `{ success, data, error }` envelope을 사용

### Validation & Testing

- 현재 우선 검증: `npm run typecheck`, `npm run build`
- 테스트 스크립트는 아직 정의되어 있지 않다.
- API 입력 검증은 추후 Zod 같은 schema validation 도입을 검토한다.
- 테스트 확장 시 Vitest, React Testing Library, API integration test를 우선 후보로 둔다.

## 3. 현재 저장소 구조

```text
.
├─ client/                 React + Vite + TypeScript frontend
├─ server/                 Node.js + Express + TypeScript backend
├─ server/migrations/      PostgreSQL migrations
├─ docs/                   project documentation
├─ docs/stitch/            Stitch screen, image, HTML, design exports
├─ package.json            root workspace scripts
└─ README.md               short setup entry point
```

프로젝트 수준 문서는 `docs/` 아래에 둔다. 루트에는 `README.md`, `AGENTS.md`처럼 진입점 성격의 문서만 둔다.

## 4. 사전 준비

필요 도구:

- Node.js: 현재 repo는 `@types/node` 22.x를 사용하므로 Node 22.x 계열을 우선 기준으로 둔다.
- npm
- PostgreSQL
- Git
- Windows PowerShell

Docker Compose 파일은 현재 저장소에 없다. Docker 기반 DB 실행은 별도 요청이나 별도 문서가 생기기 전까지 필수 개발 경로로 보지 않는다.

## 5. 설치

루트에서 설치한다.

```powershell
npm install
```

PowerShell 실행 정책 때문에 `npm` 실행이 막히면 다음처럼 `npm.cmd`를 사용한다.

```powershell
npm.cmd install
```

`client`와 `server`는 npm workspaces로 관리하므로, 일반적인 개발에서는 각 폴더에서 따로 설치하지 않는다.

## 6. 환경 변수

환경 변수 예시 파일:

- `server/.env.example`
- `client/.env.example`

로컬 파일 생성:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

### Server Env

현재 `server/.env.example`:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/beryl
CLIENT_ORIGIN=http://localhost:5173
SERVER_PUBLIC_BASE_URL=http://localhost:3000
SESSION_COOKIE_NAME=beryl.sid
SESSION_TTL_HOURS=24
RESEND_API_KEY=re_xxxxxxxxx
INVITATION_FROM_EMAIL=BERYL <onboarding@resend.dev>
INVITATION_TTL_HOURS=72
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza_xxxxxxxxx
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_TIMEOUT_MS=15000
```

서버 기본값은 `server/src/config.ts`에도 정의되어 있다.

- `PORT`: 기본 `3000`
- `DATABASE_URL`: 기본 `postgres://postgres:postgres@localhost:5432/beryl`

### Client Env

현재 `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_MODE=auto
```

API mode:

- `mock`: 항상 mock data 사용
- `api`: API 요청 실패 시 mock fallback 없이 실패
- `auto`: API 요청 후 실패하면 개발 환경에서 mock fallback 사용

주의:

- 현재 Express server는 기본적으로 `http://localhost:3000`에서 실행된다.
- 현재 client API 기준값은 `VITE_API_BASE_URL=http://localhost:3000/api`이다.
- `client/src/api/axios.ts`의 fallback 기본값도 `http://localhost:3000/api`이다.
- 현재 Vite proxy는 브라우저에서 상대 경로 `/api`로 요청할 때만 `http://localhost:3000`으로 전달한다.
- `VITE_API_BASE_URL`이 절대 URL인 `http://localhost:3000/api`이면 해당 요청은 Vite proxy를 거치지 않고 Express server를 직접 호출한다.
- 아직 server read API가 구현되지 않은 endpoint는 `auto` mode에서 mock fallback으로 동작할 수 있다.

민감한 값은 `.env` 또는 배포 secret에만 둔다. `.env`, `.env.*`는 commit하지 않는다.

## 7. 데이터베이스 준비

PostgreSQL에 `beryl` DB를 준비한다.

기본 DB 연결 정보는 다음 값을 기준으로 한다.

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/beryl
```

예시:

```powershell
createdb -U postgres -h localhost -p 5432 beryl
```

환경에 따라 `createdb` 명령이 없거나 PATH에 잡혀 있지 않으면 pgAdmin에서 `beryl` DB를 만들거나, `psql`로 생성한다.

```powershell
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE beryl;"
```

Migration 실행:

```powershell
npm run migrate
```

Rollback:

```powershell
npm run migrate:down
```

현재 저장소 기준 migration은 `health_checks` 테이블을 생성한다. seed data는 아직 정의되어 있지 않다.

## 8. 로컬 실행

전체 실행:

```powershell
npm run dev
```

개별 실행:

```powershell
npm run dev -w client
npm run dev -w server
```

기본 URL:

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`
- Server health check: `http://localhost:3000/api/health`

Client의 Vite proxy는 상대 경로 `/api` 요청을 `http://localhost:3000`으로 전달한다. 현재 `client/.env.example`은 절대 URL `http://localhost:3000/api`를 사용하므로, 기본 API 요청은 Express server를 직접 호출하는 값으로 문서화한다.

## 9. Build And Verification

TypeScript 검증:

```powershell
npm run typecheck
```

Production build:

```powershell
npm run build
```

현재 루트에는 test script가 없다. 인덱싱 단계에서는 변경 후 최소 검증 기준을 typecheck와 build로 둔다.

## 10. 개발 작업 순서

기능 또는 화면을 수정하기 전 다음 순서로 확인한다.

1. `AGENTS.md`
2. `docs/spec.md`
3. `docs/requirements.md`
4. `docs/erd.md`
5. `docs/api.md`
6. `docs/stitch/manifest.json`
7. `docs/stitch/DESIGN.md`
8. 관련 `docs/stitch/images/*.png`
9. 관련 `docs/stitch/code/*.html`
10. 현재 React route/page/component/API 파일

화면명은 `manifest.json`을 우선한다. 디자인 토큰은 `DESIGN.md`를 우선한다.

## 11. Troubleshooting

### npm 실행이 막히는 경우

PowerShell 실행 정책 때문에 `npm`이 막히면 `npm.cmd`를 사용한다.

```powershell
npm.cmd run dev
```

### PostgreSQL 연결 실패

확인할 것:

- PostgreSQL service가 실행 중인지
- `DATABASE_URL`의 user/password/host/port/db name이 맞는지
- `beryl` DB가 존재하는지
- migration이 실행되었는지

### 포트 충돌

기본 포트:

- client: `5173`
- server: `3000`

서버 포트는 `server/.env`의 `PORT`로 변경할 수 있다. 포트를 바꾸면 client API base URL 또는 proxy 설정도 같이 확인한다.

### Client가 mock data만 보이는 경우

확인할 것:

- `VITE_API_MODE`가 `mock`인지
- `VITE_API_BASE_URL`이 현재 기준값인 `http://localhost:3000/api`인지
- Vite proxy를 기대하고 있다면 요청 URL이 상대 경로 `/api`인지
- server에 해당 endpoint가 구현되어 있는지
- `auto` mode에서 API 실패 후 mock fallback이 발생한 것은 아닌지

### 한글이 터미널에서 깨져 보이는 경우

PowerShell 출력 인코딩 문제일 수 있다. 파일 자체가 UTF-8인지 확인하고, 깨진 문서는 `docs/stitch/manifest.json`처럼 정상 한글이 들어 있는 기준 파일과 대조한다.

## 12. 주의사항

- `.env` 파일을 commit하지 않는다.
- Stitch 기준 화면을 확인하지 않고 UI를 새로 만들지 않는다.
- 인덱싱 단계에서 DB/API를 임의로 확장하지 않는다.
- route handler에 비즈니스 로직과 SQL을 계속 누적하지 않는다.
- API 응답 envelope과 TypeScript 타입이 어긋나지 않게 유지한다.
- `docs/stitch/raw`의 대체 디자인 시스템을 현재 기준으로 착각하지 않는다.
