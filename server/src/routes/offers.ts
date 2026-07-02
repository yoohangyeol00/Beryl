import { type Request, type Response } from 'express';
import { pool } from '../db.js';
import { getCurrentCompanyId, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { createCompanyScopedRouter } from './companyScopedRouter.js';

export const offersRouter = createCompanyScopedRouter();

type OfferStatus = 'draft' | 'submitted' | 'awarded' | 'rejected';
type DecisionStatus = 'recommended' | 'shortlisted' | 'confirmed' | 'rejected';
type SubmissionChannel = 'nara' | 'email' | 'portal' | 'visit' | 'other';

interface OfferRow {
  id: string;
  job_id: string;
  job_title: string;
  buyer_company_id: string;
  buyer_name: string;
  supplier_company_id: string;
  supplier_name: string;
  status: OfferStatus;
  total_match_score: string | null;
  submitted_at: string | Date | null;
  proposal_title: string | null;
  proposal_manager_name: string | null;
  proposal_amount: string | null;
  technical_score: string | null;
  price_score: string | null;
  expected_start_date: string | Date | null;
  expected_duration_months: number | null;
  strategy_memo: string | null;
  proposed_people: string[] | null;
  latest_submission_id: string | null;
  latest_submitted_at: string | Date | null;
  latest_submission_channel: SubmissionChannel | null;
  latest_receipt_no: string | null;
  latest_submitted_by_name: string | null;
}

interface OfferSummaryRow {
  total: string;
  draft: string;
  submitted: string;
  awarded: string;
  rejected: string;
}

interface MatchRow {
  id: string;
  resume_id: string;
  resume_name: string;
  resume_role: string | null;
  total_score: string | null;
  required_skill_score: string | null;
  preferred_skill_score: string | null;
  project_experience_score: string | null;
  availability_score: string | null;
  reasons: unknown;
  risks: unknown;
  decision_status: DecisionStatus;
}

interface SubmissionRow {
  id: string;
  offer_id: string;
  submitted_at: string | Date;
  channel: SubmissionChannel;
  receipt_no: string | null;
  submitted_by_member_id: string | null;
  submitted_by_name: string | null;
  memo: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getNullableString(value: unknown): string | null {
  return getString(value) || null;
}

function getDate(value: unknown): string | null {
  const date = getString(value);

  if (!date) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : null;
}

function getNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const normalized = getString(value).replace(/[^\d.]/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function getInteger(value: unknown): number | null {
  const parsed = Number(getString(value) || value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function getPositiveInteger(value: unknown, fallback: number, max?: number): number {
  const parsed = Number(getString(value) || value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return max ? Math.min(parsed, max) : parsed;
}

function getOfferStatus(value: unknown, fallback: OfferStatus = 'draft'): OfferStatus {
  const status = getString(value);

  if (status === 'draft' || status === 'submitted' || status === 'awarded' || status === 'rejected') {
    return status;
  }

  return fallback;
}

function getSubmissionChannel(value: unknown): SubmissionChannel {
  const channel = getString(value);

  if (channel === 'email' || channel === 'portal' || channel === 'visit' || channel === 'other') {
    return channel;
  }

  return 'nara';
}

function getDateTime(value: unknown): string {
  const dateTime = getString(value);
  const parsed = dateTime ? new Date(dateTime) : new Date();

  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function getStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => getString(item)).filter(Boolean);
}

function formatDateValue(value: string | Date | null): string {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function formatDateTimeValue(value: string | Date | null): string {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function toOffer(row: OfferRow) {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    buyerCompanyId: row.buyer_company_id,
    buyerName: row.buyer_name,
    supplierCompanyId: row.supplier_company_id,
    supplierName: row.supplier_name,
    status: row.status,
    totalMatchScore: row.total_match_score ? Number(row.total_match_score) : 0,
    submittedAt: formatDateValue(row.submitted_at),
    proposalTitle: row.proposal_title ?? '',
    proposalManagerName: row.proposal_manager_name ?? '',
    proposalAmount: row.proposal_amount ? Number(row.proposal_amount) : 0,
    technicalScore: row.technical_score ? Number(row.technical_score) : row.total_match_score ? Number(row.total_match_score) : 0,
    priceScore: row.price_score ? Number(row.price_score) : 0,
    expectedStartDate: formatDateValue(row.expected_start_date),
    expectedDurationMonths: row.expected_duration_months ?? 0,
    strategyMemo: row.strategy_memo ?? '',
    proposedPeople: row.proposed_people ?? [],
    latestSubmission: row.latest_submission_id
      ? {
          id: row.latest_submission_id,
          submittedAt: formatDateTimeValue(row.latest_submitted_at),
          channel: row.latest_submission_channel ?? 'other',
          receiptNo: row.latest_receipt_no ?? '',
          submittedByName: row.latest_submitted_by_name ?? '',
          memo: ''
        }
      : null
  };
}

function toSubmission(row: SubmissionRow) {
  return {
    id: row.id,
    offerId: row.offer_id,
    submittedAt: formatDateTimeValue(row.submitted_at),
    channel: row.channel,
    receiptNo: row.receipt_no ?? '',
    submittedByMemberId: row.submitted_by_member_id ?? '',
    submittedByName: row.submitted_by_name ?? '',
    memo: row.memo ?? ''
  };
}

function toMatch(row: MatchRow) {
  return {
    id: row.id,
    resumeId: row.resume_id,
    resumeName: row.resume_name,
    resumeRole: row.resume_role ?? '',
    totalScore: row.total_score ? Number(row.total_score) : 0,
    requiredSkillScore: row.required_skill_score ? Number(row.required_skill_score) : 0,
    preferredSkillScore: row.preferred_skill_score ? Number(row.preferred_skill_score) : 0,
    projectExperienceScore: row.project_experience_score ? Number(row.project_experience_score) : 0,
    availabilityScore: row.availability_score ? Number(row.availability_score) : 0,
    reasons: Array.isArray(row.reasons) ? row.reasons : [],
    risks: Array.isArray(row.risks) ? row.risks : [],
    decisionStatus: row.decision_status
  };
}

function buildOfferSelect(whereSql: string) {
  return `
    select
      o.id,
      o.job_id,
      j.title as job_title,
      j.buyer_company_id,
      buyer.name as buyer_name,
      o.supplier_company_id,
      supplier.name as supplier_name,
      o.status,
      o.total_match_score,
      o.submitted_at,
      o.proposal_title,
      o.proposal_manager_name,
      o.proposal_amount,
      o.technical_score,
      o.price_score,
      o.expected_start_date,
      o.expected_duration_months,
      o.strategy_memo,
      latest_submission.id as latest_submission_id,
      latest_submission.submitted_at as latest_submitted_at,
      latest_submission.channel as latest_submission_channel,
      latest_submission.receipt_no as latest_receipt_no,
      latest_submission.submitted_by_name as latest_submitted_by_name,
      coalesce(array_remove(array_agg(distinct r.name order by r.name), null), '{}') as proposed_people
    from offers o
    join jobs j on j.id = o.job_id
    join companies buyer on buyer.id = j.buyer_company_id
    join companies supplier on supplier.id = o.supplier_company_id
    left join lateral (
      select id, submitted_at, channel, receipt_no, submitted_by_name
      from offer_submissions os
      where os.offer_id = o.id
      order by os.submitted_at desc, os.created_at desc
      limit 1
    ) latest_submission on true
    left join offer_matches om on om.offer_id = o.id
    left join resumes r on r.id = om.resume_id
    where ${whereSql}
    group by
      o.id,
      j.title,
      j.buyer_company_id,
      buyer.name,
      supplier.name,
      latest_submission.id,
      latest_submission.submitted_at,
      latest_submission.channel,
      latest_submission.receipt_no,
      latest_submission.submitted_by_name
  `;
}

async function getAccessibleOffer(offerId: string, currentCompanyId: string): Promise<OfferRow | null> {
  const result = await pool.query<OfferRow>(
    `
      ${buildOfferSelect(`o.id = $1 and (o.supplier_company_id = $2 or j.buyer_company_id = $2)`)}
      limit 1
    `,
    [offerId, currentCompanyId]
  );

  return result.rows[0] ?? null;
}

async function getManageableOffer(offerId: string, currentCompanyId: string): Promise<OfferRow | null> {
  const result = await pool.query<OfferRow>(
    `
      ${buildOfferSelect(`o.id = $1 and o.supplier_company_id = $2`)}
      limit 1
    `,
    [offerId, currentCompanyId]
  );

  return result.rows[0] ?? null;
}

async function findAccessibleJob(jobId: string, currentCompanyId: string): Promise<{ id: string; buyer_company_id: string } | null> {
  const result = await pool.query<{ id: string; buyer_company_id: string }>(
    `
      select j.id, j.buyer_company_id
      from jobs j
      where j.id = $1
        and (
          j.buyer_company_id = $2
          or (
            j.procurement_type = 'public'
            and j.source_type in ('nara', 'nipa', 'nia')
          )
          or exists (
            select 1
            from company_relationships cr
            where cr.source_company_id = $2
              and cr.target_company_id = j.buyer_company_id
              and cr.source_perspective = 'supplier'
              and cr.target_perspective = 'buyer'
              and cr.status = 'active'
          )
        )
      limit 1
    `,
    [jobId, currentCompanyId]
  );

  return result.rows[0] ?? null;
}

async function findBuyerOwnedJob(
  jobId: string,
  currentCompanyId: string
): Promise<{ id: string; buyer_company_id: string; title: string } | null> {
  const result = await pool.query<{ id: string; buyer_company_id: string; title: string }>(
    `
      select id, buyer_company_id, title
      from jobs
      where id = $1
        and buyer_company_id = $2
      limit 1
    `,
    [jobId, currentCompanyId]
  );

  return result.rows[0] ?? null;
}

async function replaceOfferMatches(offerId: string, currentCompanyId: string, resumeIds: string[]): Promise<void> {
  await pool.query('delete from offer_matches where offer_id = $1', [offerId]);

  for (const resumeId of resumeIds) {
    const resume = await pool.query<{ id: string }>(
      'select id from resumes where id = $1 and owner_company_id = $2 limit 1',
      [resumeId, currentCompanyId]
    );

    if (!resume.rowCount) {
      continue;
    }

    await pool.query(
      `
        insert into offer_matches (
          offer_id,
          resume_id,
          total_score,
          decision_status
        )
        values ($1, $2, null, 'shortlisted')
      `,
      [offerId, resumeId]
    );
  }
}

async function getOfferMatches(offerId: string): Promise<MatchRow[]> {
  const result = await pool.query<MatchRow>(
    `
      select
        om.id,
        om.resume_id,
        r.name as resume_name,
        r.role as resume_role,
        om.total_score,
        om.required_skill_score,
        om.preferred_skill_score,
        om.project_experience_score,
        om.availability_score,
        om.reasons,
        om.risks,
        om.decision_status
      from offer_matches om
      join resumes r on r.id = om.resume_id
      where om.offer_id = $1
      order by coalesce(om.total_score, 0) desc, r.name
    `,
    [offerId]
  );

  return result.rows;
}

async function getOfferSubmissions(offerId: string): Promise<SubmissionRow[]> {
  const result = await pool.query<SubmissionRow>(
    `
      select
        id,
        offer_id,
        submitted_at,
        channel,
        receipt_no,
        submitted_by_member_id,
        submitted_by_name,
        memo
      from offer_submissions
      where offer_id = $1
      order by submitted_at desc, created_at desc
    `,
    [offerId]
  );

  return result.rows;
}

offersRouter.get('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const query = asRecord(req.query);
  const page = getPositiveInteger(query.page, 1);
  const pageSize = getPositiveInteger(query.pageSize, 20, 100);
  const offset = (page - 1) * pageSize;
  const values: unknown[] = [currentCompanyId];
  const perspective = getString(query.perspective);
  const conditions =
    perspective === 'buyer'
      ? ['j.buyer_company_id = $1']
      : perspective === 'all'
        ? ['(o.supplier_company_id = $1 or j.buyer_company_id = $1)']
        : ['o.supplier_company_id = $1'];
  const q = getString(query.q);
  const status = getString(query.status);
  const jobId = getString(query.jobId);

  if (q) {
    values.push(`%${q}%`);
    conditions.push(`(j.title ilike $${values.length} or buyer.name ilike $${values.length} or supplier.name ilike $${values.length} or o.proposal_title ilike $${values.length})`);
  }

  if (status === 'draft' || status === 'submitted' || status === 'awarded' || status === 'rejected') {
    values.push(status);
    conditions.push(`o.status = $${values.length}`);
  }

  if (jobId) {
    values.push(jobId);
    conditions.push(`o.job_id = $${values.length}`);
  }

  const whereSql = conditions.join('\n and ');

  try {
    const listResult = await pool.query<OfferRow>(
      `
        ${buildOfferSelect(whereSql)}
        order by o.created_at desc, o.id desc
        limit $${values.length + 1}
        offset $${values.length + 2}
      `,
      [...values, pageSize, offset]
    );

    const summaryResult = await pool.query<OfferSummaryRow>(
      `
        select
          count(*)::text as total,
          count(*) filter (where o.status = 'draft')::text as draft,
          count(*) filter (where o.status = 'submitted')::text as submitted,
          count(*) filter (where o.status = 'awarded')::text as awarded,
          count(*) filter (where o.status = 'rejected')::text as rejected
        from offers o
        join jobs j on j.id = o.job_id
        join companies buyer on buyer.id = j.buyer_company_id
        join companies supplier on supplier.id = o.supplier_company_id
        where ${whereSql}
      `,
      values
    );
    const summary = summaryResult.rows[0] ?? { total: '0', draft: '0', submitted: '0', awarded: '0', rejected: '0' };

    sendSuccess(res, {
      items: listResult.rows.map(toOffer),
      total: Number(summary.total),
      summary: {
        total: Number(summary.total),
        draft: Number(summary.draft),
        submitted: Number(summary.submitted),
        awarded: Number(summary.awarded),
        rejected: Number(summary.rejected)
      }
    });
  } catch (error) {
    next(error);
  }
});

offersRouter.get('/:offerId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const offerId = getString(req.params.offerId);

  try {
    const offer = await getAccessibleOffer(offerId, currentCompanyId);

    if (!offer) {
      sendError(res, 404, 'OFFER_NOT_FOUND', '제안 정보를 찾을 수 없습니다.');
      return;
    }

    const matches = await getOfferMatches(offerId);
    const submissions = await getOfferSubmissions(offerId);
    sendSuccess(res, { ...toOffer(offer), matches: matches.map(toMatch), submissions: submissions.map(toSubmission) });
  } catch (error) {
    next(error);
  }
});

offersRouter.post('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const body = asRecord(req.body);
  const jobId = getString(body.jobId);
  const status = getOfferStatus(body.status);
  const resumeIds = getStringList(body.resumeIds);

  if (!jobId) {
    sendError(res, 400, 'VALIDATION_ERROR', '대상 공고가 필요합니다.');
    return;
  }

  const client = await pool.connect();

  try {
    const job = await findAccessibleJob(jobId, currentCompanyId);

    if (!job) {
      sendError(res, 403, 'JOB_FORBIDDEN', '제안서를 생성할 수 있는 공고가 아닙니다.');
      return;
    }

    const existing = await pool.query<{ id: string }>(
      'select id from offers where job_id = $1 and supplier_company_id = $2 limit 1',
      [jobId, currentCompanyId]
    );

    if (existing.rowCount) {
      sendError(res, 409, 'OFFER_ALREADY_EXISTS', '이미 이 공고에 생성한 제안서가 있습니다.');
      return;
    }

    await client.query('begin');
    const result = await client.query<OfferRow>(
      `
        insert into offers (
          job_id,
          supplier_company_id,
          status,
          submitted_at,
          proposal_title,
          proposal_manager_name,
          proposal_amount,
          expected_start_date,
          expected_duration_months,
          strategy_memo
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning
          id,
          job_id,
          (select title from jobs where id = $1) as job_title,
          (select buyer_company_id from jobs where id = $1) as buyer_company_id,
          (select c.name from jobs j join companies c on c.id = j.buyer_company_id where j.id = $1) as buyer_name,
          supplier_company_id,
          $11::varchar as supplier_name,
          status,
          total_match_score,
          submitted_at,
          proposal_title,
          proposal_manager_name,
          proposal_amount,
          expected_start_date,
          expected_duration_months,
          strategy_memo,
          '{}'::varchar[] as proposed_people
      `,
      [
        jobId,
        currentCompanyId,
        status,
        status === 'submitted' ? new Date().toISOString().slice(0, 10) : null,
        getNullableString(body.proposalTitle),
        getNullableString(body.proposalManagerName),
        getNumber(body.proposalAmount),
        getDate(body.expectedStartDate),
        getInteger(body.expectedDurationMonths),
        getNullableString(body.strategyMemo),
        authReq.auth?.company?.name ?? ''
      ]
    );

    for (const resumeId of resumeIds) {
      const resume = await client.query<{ id: string }>(
        'select id from resumes where id = $1 and owner_company_id = $2 limit 1',
        [resumeId, currentCompanyId]
      );

      if (!resume.rowCount) {
        continue;
      }

      await client.query(
        `
          insert into offer_matches (offer_id, resume_id, decision_status)
          values ($1, $2, 'shortlisted')
        `,
        [result.rows[0].id, resumeId]
      );
    }

    if (currentCompanyId !== job.buyer_company_id) {
      await client.query(
        `
          insert into company_relationships (
            source_company_id,
            target_company_id,
            source_perspective,
            target_perspective,
            relationship_type,
            status,
            first_activity_date,
            last_activity_date
          )
          values ($1, $2, 'supplier', 'buyer', 'bid_participation', 'active', current_date, current_date)
          on conflict do nothing
        `,
        [currentCompanyId, job.buyer_company_id]
      );
    }

    await client.query('commit');
    const created = await getAccessibleOffer(result.rows[0].id, currentCompanyId);
    sendSuccess(res, toOffer(created ?? result.rows[0]), 201);
  } catch (error) {
    await client.query('rollback');
    next(error);
  } finally {
    client.release();
  }
});

offersRouter.post('/received', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const body = asRecord(req.body);
  const jobId = getString(body.jobId);
  const supplierName = getString(body.supplierName);
  const status = getOfferStatus(body.status, 'submitted');

  if (!jobId || !supplierName) {
    sendError(res, 400, 'VALIDATION_ERROR', '공고와 공급기업명은 필수입니다.');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    const job = await findBuyerOwnedJob(jobId, currentCompanyId);

    if (!job) {
      await client.query('rollback');
      sendError(res, 403, 'JOB_BUYER_FORBIDDEN', '접수 제안은 본인 기업이 발주한 공고에만 등록할 수 있습니다.');
      return;
    }

    const existingCompany = await client.query<{ id: string }>('select id from companies where lower(name) = lower($1) limit 1', [
      supplierName
    ]);
    const supplierCompanyId =
      existingCompany.rows[0]?.id ??
      (
        await client.query<{ id: string }>(
          `
            insert into companies (name, company_type, supports_supplier, status)
            values ($1, 'supplier', true, 'active')
            returning id
          `,
          [supplierName]
        )
      ).rows[0].id;

    const duplicate = await client.query<{ id: string }>(
      'select id from offers where job_id = $1 and supplier_company_id = $2 limit 1',
      [jobId, supplierCompanyId]
    );

    if (duplicate.rowCount) {
      await client.query('rollback');
      sendError(res, 409, 'OFFER_ALREADY_EXISTS', '이미 등록된 공급기업 제안입니다.');
      return;
    }

    const result = await client.query<{ id: string }>(
      `
        insert into offers (
          job_id,
          supplier_company_id,
          status,
          submitted_at,
          proposal_title,
          proposal_manager_name,
          proposal_amount,
          total_match_score,
          technical_score,
          price_score,
          strategy_memo
        )
        values (
          $1::uuid,
          $2::uuid,
          $3::varchar,
          case when $3::varchar = 'draft' then null else current_date end,
          $4::varchar,
          $5::varchar,
          $6::numeric,
          $7::numeric,
          $7::numeric,
          $8::numeric,
          $9::text
        )
        returning id
      `,
      [
        jobId,
        supplierCompanyId,
        status,
        getNullableString(body.proposalTitle),
        getNullableString(body.proposalManagerName),
        getNumber(body.proposalAmount),
        getNumber(body.technicalScore),
        getNumber(body.priceScore),
        getNullableString(body.strategyMemo)
      ]
    );

    await client.query(
      `
        insert into company_relationships (
          source_company_id,
          target_company_id,
          source_perspective,
          target_perspective,
          relationship_type,
          status,
          first_activity_date,
          last_activity_date
        )
        values ($1, $2, 'buyer', 'supplier', 'bid_participation', 'active', current_date, current_date)
        on conflict do nothing
      `,
      [currentCompanyId, supplierCompanyId]
    );

    await client.query('commit');

    sendSuccess(
      res,
      {
        id: result.rows[0].id,
        jobId: job.id,
        jobTitle: job.title,
        buyerCompanyId: job.buyer_company_id,
        buyerName: authReq.auth?.company?.name ?? '',
        supplierCompanyId: supplierCompanyId,
        supplierName,
        status,
        totalMatchScore: getNumber(body.technicalScore) ?? 0,
        submittedAt: status === 'draft' ? '' : new Date().toISOString().slice(0, 10),
        proposalTitle: getNullableString(body.proposalTitle) ?? '',
        proposalManagerName: getNullableString(body.proposalManagerName) ?? '',
        proposalAmount: getNumber(body.proposalAmount) ?? 0,
        technicalScore: getNumber(body.technicalScore) ?? 0,
        priceScore: getNumber(body.priceScore) ?? 0,
        expectedStartDate: '',
        expectedDurationMonths: 0,
        strategyMemo: getNullableString(body.strategyMemo) ?? '',
        proposedPeople: [],
        latestSubmission: null
      },
      201
    );
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    next(error);
  } finally {
    client.release();
  }
});

offersRouter.patch('/:offerId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const offerId = getString(req.params.offerId);
  const body = asRecord(req.body);
  const status = getOfferStatus(body.status);
  const resumeIds = 'resumeIds' in body ? getStringList(body.resumeIds) : null;

  try {
    const existing = await getManageableOffer(offerId, currentCompanyId);

    if (!existing) {
      sendError(res, 403, 'OFFER_FORBIDDEN', '제안서를 수정할 권한이 없습니다.');
      return;
    }

    await pool.query(
      `
        update offers
        set
          status = $1,
          submitted_at = case when $1 = 'submitted' and submitted_at is null then current_date else submitted_at end,
          proposal_title = $2,
          proposal_manager_name = $3,
          proposal_amount = $4,
          expected_start_date = $5,
          expected_duration_months = $6,
          strategy_memo = $7,
          updated_at = now()
        where id = $8
          and supplier_company_id = $9
      `,
      [
        status,
        getNullableString(body.proposalTitle),
        getNullableString(body.proposalManagerName),
        getNumber(body.proposalAmount),
        getDate(body.expectedStartDate),
        getInteger(body.expectedDurationMonths),
        getNullableString(body.strategyMemo),
        offerId,
        currentCompanyId
      ]
    );

    if (resumeIds) {
      await replaceOfferMatches(offerId, currentCompanyId, resumeIds);
    }

    const updated = await getAccessibleOffer(offerId, currentCompanyId);
    sendSuccess(res, toOffer(updated ?? existing));
  } catch (error) {
    next(error);
  }
});

offersRouter.post('/:offerId/submissions', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const offerId = getString(req.params.offerId);
  const body = asRecord(req.body);
  const submittedAt = getDateTime(body.submittedAt);
  const submittedByName =
    getNullableString(body.submittedByName) ??
    authReq.auth?.member?.name ??
    authReq.auth?.user.name ??
    null;

  try {
    const existing = await getManageableOffer(offerId, currentCompanyId);

    if (!existing) {
      sendError(res, 403, 'OFFER_FORBIDDEN', '제출 기록을 남길 권한이 없습니다.');
      return;
    }

    const result = await pool.query<SubmissionRow>(
      `
        insert into offer_submissions (
          offer_id,
          submitted_at,
          channel,
          receipt_no,
          submitted_by_member_id,
          submitted_by_name,
          memo
        )
        values ($1, $2, $3, $4, $5, $6, $7)
        returning
          id,
          offer_id,
          submitted_at,
          channel,
          receipt_no,
          submitted_by_member_id,
          submitted_by_name,
          memo
      `,
      [
        offerId,
        submittedAt,
        getSubmissionChannel(body.channel),
        getNullableString(body.receiptNo),
        authReq.auth?.member?.id ?? null,
        submittedByName,
        getNullableString(body.memo)
      ]
    );

    await pool.query(
      `
        update offers
        set status = 'submitted',
            submitted_at = $1::timestamptz::date,
            updated_at = now()
        where id = $2
          and supplier_company_id = $3
      `,
      [submittedAt, offerId, currentCompanyId]
    );

    sendSuccess(res, toSubmission(result.rows[0]), 201);
  } catch (error) {
    next(error);
  }
});

offersRouter.get('/:offerId/matches', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const offerId = getString(req.params.offerId);

  try {
    const offer = await getAccessibleOffer(offerId, currentCompanyId);

    if (!offer) {
      sendError(res, 404, 'OFFER_NOT_FOUND', '제안 정보를 찾을 수 없습니다.');
      return;
    }

    const matches = await getOfferMatches(offerId);
    sendSuccess(res, { items: matches.map(toMatch), total: matches.length });
  } catch (error) {
    next(error);
  }
});

offersRouter.post('/:offerId/confirm', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const offerId = getString(req.params.offerId);
  const body = asRecord(req.body);
  const confirmedResumeIds = getStringList(body.confirmedResumeIds);

  try {
    const offer = await getAccessibleOffer(offerId, currentCompanyId);

    if (!offer || offer.buyer_company_id !== currentCompanyId) {
      sendError(res, 403, 'OFFER_CONFIRM_FORBIDDEN', '제안 확정 권한이 없습니다.');
      return;
    }

    await pool.query(
      `
        update offer_matches
        set decision_status = case when resume_id = any($1::uuid[]) then 'confirmed' else 'rejected' end,
            updated_at = now()
        where offer_id = $2
      `,
      [confirmedResumeIds, offerId]
    );
    await pool.query("update offers set status = 'awarded', updated_at = now() where id = $1", [offerId]);

    sendSuccess(res, {
      id: offerId,
      status: 'awarded',
      confirmedResumeIds,
      confirmedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
