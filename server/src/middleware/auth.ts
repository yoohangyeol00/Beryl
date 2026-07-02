import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import { pool } from '../db.js';
import { getCookieValue, hashSessionToken } from '../auth/session.js';
import { sendError } from '../utils/apiResponse.js';

export type AuthRole = 'systemAdmin' | 'companyUser';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  companyId: string | null;
}

export interface AuthenticatedCompany {
  id: string;
  name: string;
  businessRegistrationNo: string | null;
  companyType: string | null;
  representativeName: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: string | null;
  logoUrl: string | null;
  supportsBuyer: boolean;
  supportsSupplier: boolean;
}

export interface AuthenticatedMember {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  memberType: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
  company: AuthenticatedCompany | null;
  member: AuthenticatedMember | null;
}

export interface AuthSessionData {
  userId?: string;
}

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
  session?: AuthSessionData;
};

export type CompanyScopedRequest = AuthenticatedRequest & {
  auth: AuthContext & {
    user: AuthenticatedUser & {
      companyId: string;
    };
    company: AuthenticatedCompany;
  };
};

interface AuthSessionRow {
  user_id: string;
  email: string;
  name: string;
  role: AuthRole;
  company_id: string | null;
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
  member_type: string | null;
}

export async function attachAuthContext(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = getCookieValue(req.headers.cookie, config.sessionCookieName);

    if (!token) {
      next();
      return;
    }

    const tokenHash = hashSessionToken(token);
    const result = await pool.query<AuthSessionRow>(
      `
        select
          u.id as user_id,
          u.email,
          u.name,
          u.role,
          u.company_id,
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
          cm.phone as member_phone,
          cm.member_type
        from auth_sessions s
        join users u on u.id = s.user_id
        left join companies c on c.id = u.company_id
        left join company_members cm on cm.user_id = u.id
        where s.token_hash = $1
          and s.expires_at > now()
          and u.status = 'active'
        limit 1
      `,
      [tokenHash]
    );

    const row = result.rows[0];

    if (!row) {
      next();
      return;
    }

    req.session = {
      userId: row.user_id
    };
    req.auth = {
      user: {
        id: row.user_id,
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
            phone: row.member_phone,
            memberType: row.member_type ?? 'employee'
          }
        : null
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.session?.userId && !req.auth?.user.id) {
    sendError(res, 401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
    return;
  }

  next();
}

export function requireRole(...allowedRoles: AuthRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const role = req.auth?.user.role;

    if (!role) {
      sendError(res, 401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
      return;
    }

    if (!allowedRoles.includes(role)) {
      sendError(res, 403, 'FORBIDDEN', '접근 권한이 없습니다.');
      return;
    }

    next();
  };
}

export function requireSystemAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  return requireRole('systemAdmin')(req, res, next);
}

export function requireCompanyUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  return requireRole('companyUser')(req, res, next);
}

export function requireCurrentCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const companyId = req.auth?.user.companyId;

  if (!req.auth?.user.id) {
    sendError(res, 401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
    return;
  }

  if (!companyId) {
    sendError(res, 403, 'COMPANY_REQUIRED', '소속 기업 정보가 필요합니다.');
    return;
  }

  next();
}

export function getCurrentUserId(req: AuthenticatedRequest): string {
  const userId = req.auth?.user.id;

  if (!userId) {
    throw new Error('Authenticated user context is required.');
  }

  return userId;
}

export function getCurrentCompanyId(req: AuthenticatedRequest): string {
  const companyId = req.auth?.user.companyId;

  if (!companyId) {
    throw new Error('Current company context is required.');
  }

  return companyId;
}

export function hasCurrentCompanyAccess(req: AuthenticatedRequest, companyId: string | null | undefined): boolean {
  return !!companyId && req.auth?.user.companyId === companyId;
}

export function sendCompanyScopeError(res: Response): void {
  sendError(res, 403, 'COMPANY_SCOPE_FORBIDDEN', '현재 소속 기업으로 접근할 수 없는 데이터입니다.');
}
