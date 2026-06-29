import { type Request, type Response } from 'express';
import { pool } from '../db.js';
import { getCurrentCompanyId, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { createCompanyScopedRouter } from './companyScopedRouter.js';

export const jobsRouter = createCompanyScopedRouter();

type JobStatus = 'draft' | 'open' | 'closingSoon' | 'closed' | 'awarded';
type ProcurementType = 'public' | 'private';
type SourceType = 'nara' | 'private_bid' | 'manual' | 'email' | 'other';

interface JobRow {
  id: string;
  notice_number: string | null;
  title: string;
  buyer_company_id: string;
  buyer_company_name: string;
  category: string | null;
  procurement_type: ProcurementType;
  source_type: SourceType;
  source_url: string | null;
  budget: string | null;
  published_at: string | Date | null;
  deadline: string | Date | null;
  status: JobStatus;
  rfp_score: string | null;
  recommended_people_count: number;
  description: string | null;
}

interface JobSummaryRow {
  total: string;
  open: string;
  closing_soon: string;
  awarded: string;
  avg_rfp_score: string | null;
}

interface JobAccessRow {
  id: string;
  buyer_company_id: string;
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

function getSourceType(value: unknown): SourceType {
  const sourceType = getString(value);

  if (sourceType === 'nara' || sourceType === 'private_bid' || sourceType === 'manual' || sourceType === 'email') {
    return sourceType;
  }

  return 'other';
}

function getProcurementType(value: unknown): ProcurementType {
  return getString(value) === 'private' ? 'private' : 'public';
}

function getJobStatus(value: unknown): JobStatus {
  const status = getString(value);

  if (status === 'open' || status === 'closingSoon' || status === 'closed' || status === 'awarded') {
    return status;
  }

  return 'draft';
}

function getBudget(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const normalized = getString(value).replace(/[^\d.]/g, '');
  const budget = Number(normalized);

  return Number.isFinite(budget) && budget > 0 ? budget : null;
}

function getDate(value: unknown): string | null {
  const date = getString(value);

  if (!date) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : null;
}

function getPositiveInteger(value: unknown, fallback: number, max?: number): number {
  const parsed = Number(getString(value) || value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return max ? Math.min(parsed, max) : parsed;
}

function getSortColumn(value: unknown): string {
  const sort = getString(value);

  if (sort === 'deadline') {
    return 'j.deadline';
  }

  if (sort === 'publishedAt') {
    return 'j.published_at';
  }

  if (sort === 'title') {
    return 'j.title';
  }

  return 'j.created_at';
}

function getSortOrder(value: unknown): 'asc' | 'desc' {
  return getString(value).toLowerCase() === 'asc' ? 'asc' : 'desc';
}

function toJobListItem(row: JobRow) {
  return {
    id: row.id,
    noticeNumber: row.notice_number ?? '',
    title: row.title,
    agency: row.buyer_company_name,
    category: row.category ?? '',
    budget: row.budget ? Number(row.budget) : 0,
    publishedAt: formatDateValue(row.published_at),
    deadline: formatDateValue(row.deadline),
    status: row.status,
    procurementType: row.procurement_type,
    sourceType: row.source_type,
    sourceUrl: row.source_url ?? '',
    rfpScore: row.rfp_score ? Number(row.rfp_score) : 0,
    recommendedPeople: row.recommended_people_count
  };
}

function toJobDetail(row: JobRow) {
  return {
    id: row.id,
    noticeNumber: row.notice_number ?? '',
    title: row.title,
    agency: row.buyer_company_name,
    category: row.category ?? '',
    budget: row.budget ? Number(row.budget) : 0,
    publishedAt: formatDateValue(row.published_at),
    deadline: formatDateValue(row.deadline),
    status: row.status,
    rfpScore: row.rfp_score ? Number(row.rfp_score) : 0,
    recommendedPeople: row.recommended_people_count,
    description: row.description ?? '',
    requirements: row.category ? [row.category] : []
  };
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

function buildJobsFilter(req: Request, currentCompanyId: string) {
  const query = asRecord(req.query);
  const values: unknown[] = [currentCompanyId];
  const perspective = getString(query.perspective);
  const conditions =
    perspective === 'buyer'
      ? [
          `(
            j.buyer_company_id = $1
            or exists (
              select 1
              from company_members cm
              where cm.id = j.internal_owner_member_id
                and cm.company_id = $1
            )
          )`
        ]
      : [
          `(
            j.buyer_company_id = $1
            or exists (
              select 1
              from company_relationships cr
              where cr.source_company_id = $1
                and cr.target_company_id = j.buyer_company_id
                and cr.source_perspective = 'supplier'
                and cr.target_perspective = 'buyer'
                and cr.status = 'active'
            )
          )`
        ];

  const q = getString(query.q);
  const status = getString(query.status);
  const procurementType = getString(query.procurementType);
  const sourceType = getString(query.sourceType);

  if (q) {
    values.push(`%${q}%`);
    conditions.push(`(j.title ilike $${values.length} or j.notice_number ilike $${values.length} or c.name ilike $${values.length})`);
  }

  if (status === 'draft' || status === 'open' || status === 'closingSoon' || status === 'closed' || status === 'awarded') {
    values.push(status);
    conditions.push(`j.status = $${values.length}`);
  }

  if (procurementType === 'public' || procurementType === 'private') {
    values.push(procurementType);
    conditions.push(`j.procurement_type = $${values.length}`);
  }

  if (sourceType === 'nara' || sourceType === 'private_bid' || sourceType === 'manual' || sourceType === 'email' || sourceType === 'other') {
    values.push(sourceType);
    conditions.push(`j.source_type = $${values.length}`);
  }

  return {
    whereSql: conditions.join('\n and '),
    values
  };
}

async function findOrCreateBuyerCompany(name: string): Promise<{ id: string; name: string }> {
  const existing = await pool.query<{ id: string; name: string }>(
    'select id, name from companies where lower(name) = lower($1) limit 1',
    [name]
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const created = await pool.query<{ id: string; name: string }>(
    `
      insert into companies (name, company_type, status)
      values ($1, 'buyer', 'active')
      returning id, name
    `,
    [name]
  );

  return created.rows[0];
}

async function ensureBidRelationship(currentCompanyId: string, buyerCompanyId: string): Promise<void> {
  if (currentCompanyId === buyerCompanyId) {
    return;
  }

  const existing = await pool.query(
    `
      select id
      from company_relationships
      where source_company_id = $1
        and target_company_id = $2
        and source_perspective = 'supplier'
        and target_perspective = 'buyer'
      limit 1
    `,
    [currentCompanyId, buyerCompanyId]
  );

  if (existing.rowCount) {
    return;
  }

  await pool.query(
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
    `,
    [currentCompanyId, buyerCompanyId]
  );
}

async function findAccessibleJob(jobId: string, currentCompanyId: string): Promise<JobAccessRow | null> {
  const result = await pool.query<JobAccessRow>(
    `
      select j.id, j.buyer_company_id
      from jobs j
      where j.id = $1
        and (
          j.buyer_company_id = $2
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

async function findManageableJob(jobId: string, currentCompanyId: string): Promise<JobAccessRow | null> {
  const result = await pool.query<JobAccessRow>(
    `
      select j.id, j.buyer_company_id
      from jobs j
      where j.id = $1
        and (
          j.buyer_company_id = $2
          or exists (
            select 1
            from company_members cm
            where cm.id = j.internal_owner_member_id
              and cm.company_id = $2
          )
        )
      limit 1
    `,
    [jobId, currentCompanyId]
  );

  return result.rows[0] ?? null;
}

async function getJobDetailById(jobId: string, currentCompanyId: string): Promise<JobRow | null> {
  const result = await pool.query<JobRow>(
    `
      select
        j.id,
        j.notice_number,
        j.title,
        j.buyer_company_id,
        c.name as buyer_company_name,
        j.category,
        j.procurement_type,
        j.source_type,
        j.source_url,
        j.budget,
        j.published_at,
        j.deadline,
        j.status,
        j.rfp_score,
        j.recommended_people_count,
        j.description
      from jobs j
      join companies c on c.id = j.buyer_company_id
      where j.id = $1
        and (
          j.buyer_company_id = $2
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

jobsRouter.get('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const query = asRecord(req.query);
  const page = getPositiveInteger(query.page, 1);
  const pageSize = getPositiveInteger(query.pageSize, 20, 100);
  const offset = (page - 1) * pageSize;
  const sortColumn = getSortColumn(query.sort);
  const sortOrder = getSortOrder(query.order);
  const { whereSql, values } = buildJobsFilter(req, currentCompanyId);

  try {
    const listValues = [...values, pageSize, offset];
    const listResult = await pool.query<JobRow>(
      `
        select
          j.id,
          j.notice_number,
          j.title,
          j.buyer_company_id,
          c.name as buyer_company_name,
          j.category,
          j.procurement_type,
          j.source_type,
          j.source_url,
          j.budget,
          j.published_at,
          j.deadline,
          j.status,
          j.rfp_score,
          j.recommended_people_count,
          j.description
        from jobs j
        join companies c on c.id = j.buyer_company_id
        where ${whereSql}
        order by ${sortColumn} ${sortOrder}, j.id desc
        limit $${values.length + 1}
        offset $${values.length + 2}
      `,
      listValues
    );

    const summaryResult = await pool.query<JobSummaryRow>(
      `
        select
          count(*)::text as total,
          count(*) filter (where j.status = 'open')::text as open,
          count(*) filter (where j.status = 'closingSoon')::text as closing_soon,
          count(*) filter (where j.status = 'awarded')::text as awarded,
          avg(coalesce(j.rfp_score, 0))::text as avg_rfp_score
        from jobs j
        join companies c on c.id = j.buyer_company_id
        where ${whereSql}
      `,
      values
    );

    const summary = summaryResult.rows[0] ?? {
      total: '0',
      open: '0',
      closing_soon: '0',
      awarded: '0',
      avg_rfp_score: null
    };

    sendSuccess(res, {
      items: listResult.rows.map(toJobListItem),
      total: Number(summary.total),
      summary: {
        open: Number(summary.open),
        closingSoon: Number(summary.closing_soon),
        awarded: Number(summary.awarded),
        avgRfpScore: summary.avg_rfp_score ? Math.round(Number(summary.avg_rfp_score)) : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

jobsRouter.get('/:jobId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const jobId = getString(req.params.jobId);

  try {
    const job = await getJobDetailById(jobId, currentCompanyId);

    if (!job) {
      sendError(res, 404, 'JOB_NOT_FOUND', '공고 정보를 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, toJobDetail(job));
  } catch (error) {
    next(error);
  }
});

jobsRouter.post('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const body = asRecord(req.body);
  const title = getString(body.title);
  const currentCompanyName = authReq.auth?.company?.name ?? '';
  const buyerName = currentCompanyName || getString(body.buyerName);
  const noticeNumber = getNullableString(body.noticeNumber);
  const category = getNullableString(body.category);
  const budget = getBudget(body.budget);
  const procurementType = getProcurementType(body.procurementType);
  const sourceType = getSourceType(body.sourceType);
  const sourceUrl = getNullableString(body.sourceUrl);
  const publishedAt = getDate(body.publishedAt);
  const deadline = getDate(body.deadline);
  const status = getJobStatus(body.status);
  const description = getNullableString(body.description);

  if (!title || !buyerName) {
    sendError(res, 400, 'VALIDATION_ERROR', '공고명과 고객사/발주처는 필수입니다.');
    return;
  }

  try {
    if (noticeNumber) {
      const existingJob = await pool.query('select id from jobs where notice_number = $1 limit 1', [noticeNumber]);

      if (existingJob.rowCount) {
        sendError(res, 409, 'JOB_ALREADY_EXISTS', '이미 등록된 공고번호입니다.');
        return;
      }
    }

    const result = await pool.query<JobRow>(
      `
        insert into jobs (
          buyer_company_id,
          internal_owner_member_id,
          notice_number,
          title,
          category,
          procurement_type,
          source_type,
          source_url,
          budget,
          published_at,
          deadline,
          status,
          description
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        returning
          id,
          notice_number,
          title,
          buyer_company_id,
          $14::varchar as buyer_company_name,
          category,
          procurement_type,
          source_type,
          source_url,
          budget,
          published_at,
          deadline,
          status,
          rfp_score,
          recommended_people_count,
          description
      `,
      [
        currentCompanyId,
        authReq.auth?.member?.id ?? null,
        noticeNumber,
        title,
        category,
        procurementType,
        sourceType,
        sourceUrl,
        budget,
        publishedAt,
        deadline,
        status,
        description,
        buyerName
      ]
    );
    sendSuccess(res, toJobDetail(result.rows[0]), 201);
  } catch (error) {
    next(error);
  }
});

jobsRouter.patch('/:jobId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const jobId = getString(req.params.jobId);
  const body = asRecord(req.body);
  const title = getString(body.title);
  const buyerName = getString(body.buyerName);
  const noticeNumber = getNullableString(body.noticeNumber);
  const category = getNullableString(body.category);
  const budget = getBudget(body.budget);
  const procurementType = getProcurementType(body.procurementType);
  const sourceType = getSourceType(body.sourceType);
  const sourceUrl = getNullableString(body.sourceUrl);
  const publishedAt = getDate(body.publishedAt);
  const deadline = getDate(body.deadline);
  const status = getJobStatus(body.status);
  const description = getNullableString(body.description);

  if (!title || !buyerName) {
    sendError(res, 400, 'VALIDATION_ERROR', '공고명과 고객사/발주처는 필수입니다.');
    return;
  }

  try {
    const currentJob = await findManageableJob(jobId, currentCompanyId);

    if (!currentJob) {
      sendError(res, 403, 'JOB_FORBIDDEN', '공고를 수정할 권한이 없습니다.');
      return;
    }

    if (noticeNumber) {
      const existingJob = await pool.query('select id from jobs where notice_number = $1 and id <> $2 limit 1', [
        noticeNumber,
        jobId
      ]);

      if (existingJob.rowCount) {
        sendError(res, 409, 'JOB_ALREADY_EXISTS', '이미 등록된 공고번호입니다.');
        return;
      }
    }

    const buyerCompany = await findOrCreateBuyerCompany(buyerName);
    await ensureBidRelationship(currentCompanyId, buyerCompany.id);

    const result = await pool.query<JobRow>(
      `
        update jobs
        set
          buyer_company_id = $1,
          notice_number = $2,
          title = $3,
          category = $4,
          procurement_type = $5,
          source_type = $6,
          source_url = $7,
          budget = $8,
          published_at = $9,
          deadline = $10,
          status = $11,
          description = $12,
          updated_at = now()
        where id = $13
        returning
          id,
          notice_number,
          title,
          buyer_company_id,
          $14::varchar as buyer_company_name,
          category,
          procurement_type,
          source_type,
          source_url,
          budget,
          published_at,
          deadline,
          status,
          rfp_score,
          recommended_people_count,
          description
      `,
      [
        buyerCompany.id,
        noticeNumber,
        title,
        category,
        procurementType,
        sourceType,
        sourceUrl,
        budget,
        publishedAt,
        deadline,
        status,
        description,
        jobId,
        buyerCompany.name
      ]
    );

    await pool.query(
      `
        update company_relationships
        set last_activity_date = current_date,
            updated_at = now()
        where source_company_id = $1
          and target_company_id = $2
          and source_perspective = 'supplier'
          and target_perspective = 'buyer'
      `,
      [currentCompanyId, buyerCompany.id]
    );

    sendSuccess(res, toJobDetail(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

jobsRouter.delete('/:jobId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const jobId = getString(req.params.jobId);

  try {
    const currentJob = await findManageableJob(jobId, currentCompanyId);

    if (!currentJob) {
      sendError(res, 403, 'JOB_FORBIDDEN', '공고를 삭제할 권한이 없습니다.');
      return;
    }

    await pool.query('delete from jobs where id = $1', [jobId]);
    sendSuccess(res, { ok: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
      sendError(res, 409, 'JOB_DELETE_CONFLICT', '연결된 RFP, 제안, 계약 정보가 있어 공고를 삭제할 수 없습니다.');
      return;
    }

    next(error);
  }
});
