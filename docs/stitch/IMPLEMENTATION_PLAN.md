# Stitch Implementation Plan

## Stitch MCP Connection Result

Connected.

- Project: `Remix of Smart Public Procurement System`
- Project ID: `12282738876199046513`
- MCP endpoint: `https://stitch.googleapis.com/mcp`
- Retrieved through local Codex MCP configuration. No API key value is stored in this repository.

## API Key And Authentication Check

- Codex `stitch` MCP config: present locally.
- API header config: present locally.
- Repository secret policy: `.env`, `.env.*`, and local config files must not be committed.
- Current repo `.gitignore`: covers `.env` and `.env.*`.

## Stitch Screen List

| No. | Screen | ID | Local image | Local code |
| --- | --- | --- | --- | --- |
| 1 | BERYL - 투입인력 관리 및 M/M 현황 | `104be3535eb74b3488729d0ac7ecf59e` | `docs/stitch/images/01-manpower-mm-status.png` | `docs/stitch/code/01-manpower-mm-status.html` |
| 2 | BERYL - 추천 인력 매칭 알고리즘 상세 분석 | `ec43ebf33f22417eaa9cb921e2277124` | `docs/stitch/images/02-matching-algorithm-analysis.png` | `docs/stitch/code/02-matching-algorithm-analysis.html` |
| 3 | BERYL - 인력 상세 정보 및 이력 관리 | `3e341e4941ff4fb2ab1ed78dd19fc81e` | `docs/stitch/images/03-person-detail-history.png` | `docs/stitch/code/03-person-detail-history.html` |
| 4 | BERYL - 공급기업별 계약사업 관리 | `4bc69bda45274fd0b2bf48cc9ca5cadc` | `docs/stitch/images/04-supplier-contract-projects.png` | `docs/stitch/code/04-supplier-contract-projects.html` |
| 5 | BERYL - 로그인 | `7bbfd413a6cd4ffc9298a643c9369f45` | `docs/stitch/images/05-login.png` | `docs/stitch/code/05-login.html` |
| 6 | BERYL - 발주기관 조직 및 직원 관리 | `e114164f28014c37b9cabaf8bb8f8922` | `docs/stitch/images/06-agency-organization-staff.png` | `docs/stitch/code/06-agency-organization-staff.html` |
| 7 | BERYL - 발주기관 등록 및 수정 | `ea7eb4e38a1f4549a8432c7077892b93` | `docs/stitch/images/07-agency-form.png` | `docs/stitch/code/07-agency-form.html` |
| 8 | BERYL - 회원가입 | `a82ef1f661d34e33a9039e139264fd39` | `docs/stitch/images/08-signup.png` | `docs/stitch/code/08-signup.html` |
| 9 | BERYL - 공급기업 등록 및 수정 | `5e3baf426c3b4079a7fa5542e570ce48` | `docs/stitch/images/09-supplier-form.png` | `docs/stitch/code/09-supplier-form.html` |
| 10 | BERYL - 입찰 공고 상세 및 RFP 분석 정보 | `bad1c361d193465fabba1ef78dfe2e91` | `docs/stitch/images/10-bid-detail-rfp-analysis.png` | `docs/stitch/code/10-bid-detail-rfp-analysis.html` |
| 11 | BERYL - 발주기관별 입찰공고 관리 | `099bab0b71154bf08c664887938ec0bb` | `docs/stitch/images/11-agency-bid-management.png` | `docs/stitch/code/11-agency-bid-management.html` |
| 12 | BERYL - 수주 사업 관리 현황 | `f5f14d8c9c9d4bc08fa6ce2d2e87bdbd` | `docs/stitch/images/12-won-project-status.png` | `docs/stitch/code/12-won-project-status.html` |
| 13 | BERYL - 공급기업 관리 대시보드 | `b7ab51d69aa44cf48da8dba1cefe5910` | `docs/stitch/images/13-supplier-dashboard.png` | `docs/stitch/code/13-supplier-dashboard.html` |
| 14 | BERYL - 발주기관 관리 대시보드 | `9543d3c334da49559fab03c2285ccef1` | `docs/stitch/images/14-agency-dashboard.png` | `docs/stitch/code/14-agency-dashboard.html` |

## React Pages And Routes

| Screen | Purpose | React page | Route |
| --- | --- | --- | --- |
| 로그인 | 인증 진입 | `StitchScreenPage(login)` | `/login` |
| 회원가입 | 사용자 등록 | `StitchScreenPage(signup)` | `/signup` |
| 발주기관별 입찰공고 관리 | 공고 목록 관리 | `StitchScreenPage(agencyBidManagement)` | `/jobs` |
| 입찰 공고 상세 및 RFP 분석 정보 | 공고 상세와 RFP 분석 정보 | `StitchScreenPage(bidDetail)` | `/jobs/:jobId` |
| 인력 상세 정보 및 이력 관리 | 인력 프로필 및 이력 관리 | `StitchScreenPage(personDetail)` | `/resumes/:resumeId` |
| 추천 인력 매칭 알고리즘 상세 분석 | 추천 근거와 점수 분석 | `StitchScreenPage(matchingAnalysis)` | `/offers/:offerId/analysis` |
| 발주기관 관리 대시보드 | 발주기관 현황 | `StitchScreenPage(agencyDashboard)` | `/dashboard/agency` |
| 공급기업 관리 대시보드 | 공급기업 현황 | `StitchScreenPage(supplierDashboard)` | `/dashboard/supplier` |
| 발주기관 조직 및 직원 관리 | 기관/직원 관리 | `StitchScreenPage(agencyStaff)` | `/agencies` |
| 발주기관 등록 및 수정 | 기관 입력 폼 | `StitchScreenPage(agencyForm)` | `/agencies/new`, `/agencies/:agencyId/edit` |
| 공급기업별 계약사업 관리 | 공급기업 계약 관리 | `StitchScreenPage(supplierContracts)` | `/suppliers` |
| 공급기업 등록 및 수정 | 공급기업 입력 폼 | `StitchScreenPage(supplierForm)` | `/suppliers/new`, `/suppliers/:supplierId/edit` |
| 수주 사업 관리 현황 | 수주 사업 관리 | `StitchScreenPage(wonProjects)` | `/projects/won` |
| 투입인력 관리 및 M/M 현황 | 인력 투입률 관리 | `StitchScreenPage(manpower)` | `/manpower` |

## Common Layout Structure

- Fixed left sidebar using BERYL brand mark and primary navigation.
- Sticky top header with global search and account summary.
- Main scroll region with max width `1280px`.
- Desktop-first data layout, with horizontally scrollable tables on smaller screens.

## Common Components

- `MainLayout`
- `AuthLayout`
- `Header`
- `Sidebar`
- `PageTitle`
- `Button`
- `Card`
- `Input`
- `DataTable`
- `Badge`
- `StatusBadge`
- `EmptyState`
- `LoadingState`
- `Modal`

## Domain Components

Current domain component scope:

- Routes render exact Stitch screen assets through `StitchScreenPage`.
- Do not create inferred dashboard, form, or table layouts until each screen is converted from the Stitch reference one at a time.
- Future componentization must be checked against the downloaded screen image for each route.

## Tailwind Theme Tokens

Use `docs/stitch/DESIGN.md` as the source of truth.

- Colors: BERYL emerald/forest/aquamarine palette.
- Typography: Manrope headlines, Work Sans body, IBM Plex Sans labels.
- Spacing: 8px rhythm, 24px gutter, 1280px container max.
- Rounded: 4px base radius, 8px cards.
- Data tables: forest/emerald header, zebra surface tint rows.
- Cards: white surface, emerald-tinted outline, no persistent heavy shadow.
- Inputs: 1px outline, emerald focus ring.

## API Integration Data

Initial `/jobs` data:

- notice number
- title
- agency
- category
- budget
- published date
- deadline
- bid status
- RFP score
- recommended people count

## Mock Data Domains

- Jobs: implemented.
- Resumes: placeholder mock response.
- Offers: placeholder mock response.

## Implementation Priority

1. Keep Stitch image/code exports as the current visual source of truth.
2. Route all requested pages to the exact downloaded Stitch screen assets.
3. Convert screens into React DOM components only after pixel-checking against each Stitch reference.
4. Preserve API client with `api/mock/auto` mode for later data wiring.

## Backend API Specification Items

- `GET /jobs`
- `GET /jobs/:jobId`
- `GET /resumes`
- `GET /offers`
- Common response envelope: `{ success, data, error }`
- Pagination format for tables.
- Filtering and sorting parameters.
- Status enum mapping.
- Error code catalog.
