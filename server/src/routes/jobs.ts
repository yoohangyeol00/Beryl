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
  published_at: string | null;
  deadline: string | null;
  status: JobStatus;
  rfp_score: string | null;
  recommended_people_count: number;
  description: string | null;
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

function toJobDetail(row: JobRow) {
  return {
    id: row.id,
    noticeNumber: row.notice_number ?? '',
    title: row.title,
    agency: row.buyer_company_name,
    category: row.category ?? '',
    budget: row.budget ? Number(row.budget) : 0,
    publishedAt: row.published_at ?? '',
    deadline: row.deadline ?? '',
    status: row.status,
    rfpScore: row.rfp_score ? Number(row.rfp_score) : 0,
    recommendedPeople: row.recommended_people_count,
    description: row.description ?? '',
    requirements: row.category ? [row.category] : []
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

jobsRouter.post('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
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
    if (noticeNumber) {
      const existingJob = await pool.query('select id from jobs where notice_number = $1 limit 1', [noticeNumber]);

      if (existingJob.rowCount) {
        sendError(res, 409, 'JOB_ALREADY_EXISTS', '이미 등록된 공고번호입니다.');
        return;
      }
    }

    const buyerCompany = await findOrCreateBuyerCompany(buyerName);
    await ensureBidRelationship(currentCompanyId, buyerCompany.id);

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
        buyerCompany.id,
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
    sendSuccess(res, toJobDetail(result.rows[0]), 201);
  } catch (error) {
    next(error);
  }
});
