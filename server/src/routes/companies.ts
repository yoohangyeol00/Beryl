import { randomUUID } from 'crypto';
import express, { type Request, type Response } from 'express';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { config } from '../config.js';
import { pool } from '../db.js';
import { getCurrentCompanyId, getCurrentUserId, type AuthenticatedRequest, type AuthRole } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { parseMultipartFile } from '../utils/multipart.js';
import { createCompanyScopedRouter } from './companyScopedRouter.js';

export const companiesRouter = createCompanyScopedRouter();

const companyLogoUpload = express.raw({
  type: (req) => (req.headers['content-type'] ?? '').startsWith('multipart/form-data'),
  limit: '2mb'
});
const allowedLogoTypes = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif']
]);

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  company_id: string | null;
  password_hash: string;
  status: string;
  company_name: string | null;
  company_business_registration_no: string | null;
  company_type: string | null;
  company_representative_name: string | null;
  company_address: string | null;
  company_contact_phone: string | null;
  company_contact_email: string | null;
  company_status: string | null;
  company_logo_url: string | null;
  company_supports_buyer: boolean | null;
  company_supports_supplier: boolean | null;
  member_id: string | null;
  member_name: string | null;
  member_department: string | null;
  member_position: string | null;
  member_email: string | null;
  member_phone: string | null;
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

function toAuthResponse(row: UserRow) {
  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      companyId: row.company_id
    },
    company:
      row.company_id && row.company_name
        ? {
            id: row.company_id,
            name: row.company_name,
            businessRegistrationNo: row.company_business_registration_no,
            companyType: row.company_type,
            representativeName: row.company_representative_name,
            address: row.company_address,
            contactPhone: row.company_contact_phone,
            contactEmail: row.company_contact_email,
            status: row.company_status,
            logoUrl: row.company_logo_url,
            supportsBuyer: row.company_supports_buyer ?? true,
            supportsSupplier: row.company_supports_supplier ?? true
          }
        : null,
    member: row.member_id
      ? {
          id: row.member_id,
          name: row.member_name ?? row.name,
          department: row.member_department,
          position: row.member_position,
          email: row.member_email,
          phone: row.member_phone
        }
      : null
  };
}

async function findUserForAuthResponse(userId: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `
      select
        u.id,
        u.email,
        u.name,
        u.role,
        u.company_id,
        u.password_hash,
        u.status,
        c.name as company_name,
        c.business_registration_no as company_business_registration_no,
        c.company_type,
        c.representative_name as company_representative_name,
        c.address as company_address,
        c.contact_phone as company_contact_phone,
        c.contact_email as company_contact_email,
        c.status as company_status,
        c.logo_url as company_logo_url,
        c.supports_buyer as company_supports_buyer,
        c.supports_supplier as company_supports_supplier,
        cm.id as member_id,
        cm.name as member_name,
        cm.department as member_department,
        cm.position as member_position,
        cm.email as member_email,
        cm.phone as member_phone
      from users u
      left join companies c on c.id = u.company_id
      left join company_members cm on cm.user_id = u.id
      where u.id = $1
      limit 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

function getLogoExtension(mimeType: string): string | null {
  return allowedLogoTypes.get(mimeType) ?? null;
}

function getCompanyLogoUrl(fileName: string): string {
  return `${config.publicBaseUrl.replace(/\/$/, '')}/uploads/company-logos/${fileName}`;
}

companiesRouter.patch('/me', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const body = asRecord(req.body);
  const companyId = getCurrentCompanyId(authReq);
  const userId = getCurrentUserId(authReq);
  const name = getString(body.name);
  const businessRegistrationNo = getString(body.businessRegistrationNo) || null;
  const companyType = getString(body.companyType) || null;
  const representativeName = getString(body.representativeName) || null;
  const address = getString(body.address) || null;
  const contactPhone = getString(body.contactPhone) || null;
  const contactEmail = getString(body.contactEmail) || null;
  const supportsBuyer = typeof body.supportsBuyer === 'boolean' ? body.supportsBuyer : authReq.auth?.company?.supportsBuyer ?? true;
  const supportsSupplier = typeof body.supportsSupplier === 'boolean' ? body.supportsSupplier : authReq.auth?.company?.supportsSupplier ?? true;

  if (!name) {
    sendError(res, 400, 'VALIDATION_ERROR', '기업명은 필수입니다.');
    return;
  }

  if (!supportsBuyer && !supportsSupplier) {
    sendError(res, 400, 'COMPANY_PERSPECTIVE_REQUIRED', '발주기관 또는 공급기관 중 하나 이상을 선택해주세요.');
    return;
  }

  try {
    if (businessRegistrationNo) {
      const existingCompany = await pool.query(
        'select id from companies where business_registration_no = $1 and id <> $2 limit 1',
        [businessRegistrationNo, companyId]
      );

      if (existingCompany.rowCount) {
        sendError(res, 409, 'COMPANY_ALREADY_EXISTS', '이미 등록된 기업 식별값입니다.');
        return;
      }
    }

    await pool.query(
      `
        update companies
        set name = $1,
            business_registration_no = $2,
            company_type = $3,
            representative_name = $4,
            address = $5,
            contact_phone = $6,
            contact_email = $7,
            supports_buyer = $8,
            supports_supplier = $9,
            updated_at = now()
        where id = $10
      `,
      [
        name,
        businessRegistrationNo,
        companyType,
        representativeName,
        address,
        contactPhone,
        contactEmail,
        supportsBuyer,
        supportsSupplier,
        companyId
      ]
    );

    const nextUser = await findUserForAuthResponse(userId);

    if (!nextUser) {
      sendError(res, 404, 'USER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, toAuthResponse(nextUser));
  } catch (error) {
    next(error);
  }
});

companiesRouter.post(
  '/me/logo',
  companyLogoUpload,
  async (req: Request, res: Response, next) => {
    const authReq = req as AuthenticatedRequest;
    const companyId = getCurrentCompanyId(authReq);
    const userId = getCurrentUserId(authReq);

    if (!Buffer.isBuffer(req.body)) {
      sendError(res, 400, 'INVALID_UPLOAD', '업로드할 이미지 파일이 필요합니다.');
      return;
    }

    const file = parseMultipartFile(req.body, req.headers['content-type'] ?? '');

    if (!file) {
      sendError(res, 400, 'INVALID_UPLOAD', '업로드할 이미지 파일이 필요합니다.');
      return;
    }

    const extension = getLogoExtension(file.mimeType);

    if (!extension) {
      sendError(res, 400, 'UNSUPPORTED_FILE_TYPE', 'PNG, JPG, WEBP, GIF 이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const fileName = `${companyId}-${Date.now()}-${randomUUID()}.${extension}`;
    const uploadDir = path.resolve(process.cwd(), 'uploads', 'company-logos');
    const storagePath = path.join(uploadDir, fileName);
    const logoUrl = getCompanyLogoUrl(fileName);

    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(storagePath, file.data);

      await pool.query('update companies set logo_url = $1, updated_at = now() where id = $2', [logoUrl, companyId]);

      const nextUser = await findUserForAuthResponse(userId);

      if (!nextUser) {
        sendError(res, 404, 'USER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다.');
        return;
      }

      sendSuccess(res, toAuthResponse(nextUser));
    } catch (error) {
      next(error);
    }
  }
);
