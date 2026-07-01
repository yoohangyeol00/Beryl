# BERYL Auth

## 1. 문서 목적

이 문서는 BERYL 로그인/회원가입 구현 기준을 정리한다.

로그인/회원가입은 화면, API, DB, 권한, 보안 정책이 함께 연결되므로 구현 전 이 문서를 먼저 확인한다. 상세 endpoint는 `docs/api.md`, 데이터 모델은 `docs/erd.md`, 제품 요구사항은 `docs/requirements.md`와 함께 갱신한다.

## 2. 핵심 전제

BERYL은 발주기관 계정과 공급기업 계정을 분리하지 않는다.

한 사용자는 하나의 기업에 소속된다. 사용자의 기업이 어떤 업무에서는 발주 관점, 다른 업무에서는 공급 관점을 가질 수 있다. 발주/공급은 로그인 role이 아니라 current company와 거래 관계 데이터로 판단한다.

권한 모델:

- `systemAdmin`: 전체 기업, 공고, 계약, 수주 사업, 인력 데이터를 관리하는 시스템 운영자
- `companyUser`: 본인 소속 기업 기준으로 데이터에 접근하는 일반 기업 사용자

`systemAdmin`은 일반 회원가입으로 생성하지 않는다. 서비스 관리자 계정이 필요할 경우 프로그램 초기 설정, seed, 운영 스크립트 등을 통해 별도로 생성한다.

## 3. MVP 범위

MVP 로그인/회원가입 범위:

- 로그인 화면 `/login`
- 회원가입 화면 `/signup`
- 로그인 API
- 회원가입 API
- 로그아웃 API
- 현재 사용자 조회 API
- 로그인 상태에 따른 route guard
- 사용자 소속 기업 기준 접근 제어의 기본 구조

MVP에서 제외:

- 소셜 로그인
- SSO/SAML/OIDC
- 이메일 인증
- 비밀번호 재설정 메일 발송
- 2단계 인증
- 다중 기업 소속 전환
- 세부 조직/부서별 권한 matrix

위 항목은 인증 기본 흐름과 company-based access control이 안정화된 뒤 별도 요구사항으로 확장한다.

## 4. 사용자와 기업 모델

### users

로그인 가능한 계정이다.

필수 필드 후보:

- `id`
- `company_id`
- `email`
- `name`
- `password_hash`
- `role`
- `status`
- `last_login_at`
- `created_at`
- `updated_at`

`role`은 `systemAdmin`, `companyUser`를 기준으로 한다. 일반 회원가입으로 생성되는 사용자는 항상 `companyUser`다.

회원가입 request에서는 `role`을 받지 않는다. 클라이언트가 `role: systemAdmin` 같은 값을 보내더라도 서버는 이를 무시하거나 요청을 거부해야 한다.

### companies

로그인 사용자가 소속되는 기업이다.

회원가입 단계에서 신규 기업을 함께 생성할 수 있다. 이미 존재하는 기업에 가입 요청하는 흐름은 MVP 이후 승인 workflow로 분리한다.

### company_members

기업 내부 구성원 프로필이다. `users`와 완전히 같은 개념이 아니다.

모든 `company_members`가 로그인 계정을 가져야 하는 것은 아니다. 초대받은 사용자는 초대 수락 전 `user_id = null`, `status = invited` 상태로 둘 수 있고, 수락 후 `company_members.user_id`에 `users.id`를 연결한다.

공급기업/발주기관 등록에서 입력하는 외부 담당자 연락처는 `company_members`가 아니라 `company_contacts`에 저장한다.

## 5. 회원가입 플로우

현재 `/signup` 화면은 계정 기본 정보 입력 후 조직 정보 입력으로 이어지는 흐름을 전제로 한다.

권장 MVP 흐름:

1. 사용자가 이름, 업무 이메일, 비밀번호, 비밀번호 확인을 입력한다.
2. 다음 단계에서 기업명, 사업자등록번호, 대표 연락처 등 기업 기본 정보를 입력한다.
3. 서버는 이메일 중복과 기업 식별값 중복을 검증한다.
4. 서버는 `companies`를 생성한다.
5. 서버는 `users`를 `companyUser` role로 생성하고 생성된 `company_id`에 연결한다.
6. 필요하면 `company_members`에 기본 내부 구성원 프로필을 생성하거나, 이후 마이페이지/관리 화면에서 별도 등록한다.
7. 회원가입 성공 후 로그인 상태로 전환하거나 `/login`으로 이동한다. MVP에서는 둘 중 하나로 통일한다.

회원가입 API는 `systemAdmin` 생성을 지원하지 않는다. 관리자 계정 생성은 일반 API가 아니라 프로그램 초기 설정, seed, 운영 스크립트 같은 별도 경로에서만 수행한다.

입력 검증 기준:

- 이메일은 표준 이메일 형식이어야 한다.
- 비밀번호와 비밀번호 확인은 일치해야 한다.
- 비밀번호는 최소 길이와 복잡도 기준을 가져야 한다.
- 기업명은 필수다.
- 사업자등록번호를 받는 경우 중복 검사를 수행한다.

## 6. 로그인 플로우

로그인 기준 입력:

- 업무 이메일
- 비밀번호
- 로그인 상태 유지 여부

권장 MVP 흐름:

1. 사용자가 이메일과 비밀번호를 입력한다.
2. 서버는 이메일로 사용자를 조회한다.
3. 서버는 저장된 `password_hash`와 입력 비밀번호를 비교한다.
4. 사용자 상태가 비활성/잠금이면 로그인하지 않는다.
5. 서버는 인증 session을 생성하고 httpOnly cookie를 발급한다.
6. 클라이언트는 `GET /api/auth/me`로 현재 사용자와 기업 정보를 확인한다.
7. 로그인 후 현재 구현 기준 기본 진입점인 `/buyer/dashboard` 또는 권한별 기본 화면으로 이동한다.

로그인 실패 응답은 이메일 존재 여부나 비밀번호 오류 원인을 과도하게 노출하지 않는다.

## 7. API Endpoint

Auth API는 공통 응답 envelope을 사용한다.

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

권장 endpoint:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/auth/me` | 현재 사용자와 소속 기업 조회 |
| `GET` | `/api/auth/invitations/accept` | 초대 수락 전 토큰 검증 |
| `POST` | `/api/auth/invitations/accept` | 초대 수락, 비밀번호 설정, 계정 활성화 |

### `POST /api/auth/signup`

Request 후보:

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

Response data 후보:

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
    "supportsBuyer": true,
    "supportsSupplier": true
  }
}
```

### `POST /api/auth/login`

Request 후보:

```json
{
  "email": "user@example.com",
  "password": "password",
  "rememberMe": false
}
```

Response data 후보:

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

### `GET /api/auth/me`

Response data 후보:

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

### 초대 수락 흐름

관리자가 사용자를 초대하면 `company_members`에 구성원 프로필을 만들고 `user_invitations`에 초대 토큰 해시를 저장한다.

초대 링크는 `/invitations/accept?token=...` 프론트 라우트로 연결한다. 클라이언트는 `GET /api/auth/invitations/accept?token=...`로 토큰을 검증한 뒤 비밀번호 입력 폼을 보여준다.

사용자가 비밀번호를 설정하면 `POST /api/auth/invitations/accept`가 `users` 계정을 생성하고, `company_members.user_id`를 연결하며, `user_invitations.status`를 `accepted`로 변경한다. 성공 시 일반 로그인과 동일하게 서버 세션 cookie를 발급한다.

## 8. 세션과 Token 기준

MVP 인증 방식은 httpOnly Cookie 기반 서버 세션 인증을 사용한다.

기준:

- 로그인 성공 시 서버가 session을 생성한다.
- 브라우저에는 session id가 담긴 cookie만 전달한다.
- 인증 cookie는 `httpOnly`로 설정해 client JavaScript에서 접근하지 못하게 한다.
- production에서는 `secure: true`를 사용해 HTTPS에서만 cookie가 전송되게 한다.
- `sameSite`는 로컬 개발과 배포 도메인 구조에 맞춰 명시적으로 설정한다.
- session 저장소는 PostgreSQL 기반 session store를 우선 검토한다.
- 클라이언트는 token을 localStorage/sessionStorage에 저장하지 않는다.
- 클라이언트는 `GET /api/auth/me` 응답을 현재 로그인 사용자와 기업 정보의 기준으로 삼는다.
- 로그아웃 시 서버 session을 파기하고 session cookie를 만료시킨다.

로컬 개발 기준:

- API 서버: `http://localhost:3000`
- 클라이언트: `http://localhost:5173`
- CORS는 `origin: 'http://localhost:5173'`, `credentials: true`를 사용한다.
- Axios 요청은 cookie 전송을 위해 `withCredentials: true`를 사용한다.

JWT는 MVP 인증 방식으로 사용하지 않는다. 모바일 앱, 외부 API client, 다중 서비스 연동이 필요해질 때 별도 인증 전략으로 재검토한다.

## 9. 접근 제어 기준

서버는 클라이언트가 보낸 `role`, `companyId`, current company 값을 그대로 신뢰하지 않는다.

protected API 처리 기준:

- 인증 정보를 서버에서 검증한다.
- 사용자 `role`을 서버 저장값 기준으로 확인한다.
- `companyUser`는 본인 `company_id` 기준 데이터만 접근한다.
- `systemAdmin`은 전체 데이터 접근이 가능하되, 감사 로그나 운영 정책을 고려한다.
- 발주/공급 관점은 `company_relationships`, `jobs`, `offers`, `contracts`, `won_projects`, `project_assignments`의 관계로 검증한다.

## 10. 보안 기준

- 비밀번호는 평문 저장하지 않는다.
- 비밀번호는 bcrypt 또는 argon2 계열로 hash한다.
- 로그인 실패 메시지는 계정 존재 여부를 직접 노출하지 않는다.
- 인증 cookie를 사용할 경우 httpOnly, secure, sameSite 정책을 적용한다.
- session 만료 시간과 갱신 정책을 명확히 둔다.
- 민감 설정값은 `.env`와 배포 secret으로만 관리한다.
- auth API는 rate limit 또는 로그인 시도 제한을 고려한다.
- 사용자 목록/상세 API는 개인정보 노출 범위를 제한한다.

## 11. Frontend 구현 기준

- `/login`, `/signup`은 `AuthLayout` 기준 화면이다.
- 로그인 성공 후 `GET /api/auth/me` 결과를 client auth state의 기준으로 삼는다.
- route guard는 인증 여부와 role을 기준으로 분기한다.
- 화면에 표시하는 role/current company 값은 서버 응답을 기준으로 한다.
- 로그인/회원가입 form validation은 client에서 1차 검증하고, server에서 반드시 다시 검증한다.

## 12. 구현 체크리스트

- `docs/api.md`에 signup endpoint 반영
- `docs/erd.md`의 `users`, `companies`, `company_members` 연결 방식 확정
- auth 관련 migration 작성
- password hash 라이브러리 선택
- httpOnly Cookie 기반 서버 세션 인증 설정
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` 구현
- auth middleware 구현
- protected route guard 구현
- 로그인/회원가입 form submit 연결
- 실패/로딩/성공 상태 UI 연결
- typecheck와 build 통과 확인
