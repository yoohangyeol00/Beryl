import type { Request, Response } from 'express';
import { pool } from '../db.js';
import { getCurrentCompanyId, getCurrentUserId, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { createCompanyScopedRouter } from './companyScopedRouter.js';

export const companyRelationshipsRouter = createCompanyScopedRouter();

type ManagementStatus = 'preferred' | 'active' | 'review' | 'watch';

interface CompanyRelationshipRow {
  id: string;
  source_company_id: string;
  target_company_id: string;
  source_perspective: string;
  target_perspective: string;
  relationship_type: string;
  status: string;
  internal_grade: string | null;
  management_status: ManagementStatus | null;
  tags: string | null;
  memo: string | null;
  target_company_name: string;
  target_company_business_registration_no: string | null;
  target_company_type: string | null;
  target_representative_name: string | null;
  target_website_url: string | null;
  target_address: string | null;
  target_contact_phone: string | null;
  target_contact_email: string | null;
  contact_member_id: string | null;
  contact_member_name: string | null;
  contact_member_department: string | null;
  contact_member_position: string | null;
  contact_member_email: string | null;
  contact_member_phone: string | null;
  capabilities: string[] | null;
  certifications: string[] | null;
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

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => getString(item)).filter(Boolean);
}

function getManagementStatus(value: unknown): ManagementStatus | null {
  if (value === 'preferred' || value === 'active' || value === 'review' || value === 'watch') {
    return value;
  }

  return null;
}

function toRelationshipResponse(row: CompanyRelationshipRow) {
  return {
    id: row.id,
    sourceCompanyId: row.source_company_id,
    targetCompanyId: row.target_company_id,
    sourcePerspective: row.source_perspective,
    targetPerspective: row.target_perspective,
    relationshipType: row.relationship_type,
    status: row.status,
    internalGrade: row.internal_grade,
    managementStatus: row.management_status,
    tags: row.tags,
    memo: row.memo,
    targetCompany: {
      id: row.target_company_id,
      name: row.target_company_name,
      businessRegistrationNo: row.target_company_business_registration_no,
      companyType: row.target_company_type,
      representativeName: row.target_representative_name,
      websiteUrl: row.target_website_url,
      address: row.target_address,
      contactPhone: row.target_contact_phone,
      contactEmail: row.target_contact_email
    },
    contact: row.contact_member_id
      ? {
          id: row.contact_member_id,
          name: row.contact_member_name,
          department: row.contact_member_department,
          position: row.contact_member_position,
          email: row.contact_member_email,
          phone: row.contact_member_phone
        }
      : null,
    capabilities: row.capabilities ?? [],
    certifications: row.certifications ?? []
  };
}

async function findRelationship(relationshipId: string, currentCompanyId: string) {
  const result = await pool.query<CompanyRelationshipRow>(
    `
      select
        cr.id,
        cr.source_company_id,
        cr.target_company_id,
        cr.source_perspective,
        cr.target_perspective,
        cr.relationship_type,
        cr.status,
        cr.internal_grade,
        cr.management_status,
        cr.tags,
        cr.memo,
        c.name as target_company_name,
        c.business_registration_no as target_company_business_registration_no,
        c.company_type as target_company_type,
        c.representative_name as target_representative_name,
        c.website_url as target_website_url,
        c.address as target_address,
        c.contact_phone as target_contact_phone,
        c.contact_email as target_contact_email,
        cm.id as contact_member_id,
        cm.name as contact_member_name,
        cm.department as contact_member_department,
        cm.position as contact_member_position,
        cm.email as contact_member_email,
        cm.phone as contact_member_phone,
        coalesce(array_agg(distinct cc.name) filter (where cc.name is not null), '{}') as capabilities,
        coalesce(array_agg(distinct cert.name) filter (where cert.name is not null), '{}') as certifications
      from company_relationships cr
      join companies c on c.id = cr.target_company_id
      left join company_members cm
        on cm.company_id = cr.target_company_id
       and cm.member_type = 'contact'
       and cm.status = 'active'
      left join company_capabilities cc on cc.company_id = c.id
      left join company_certifications cert on cert.company_id = c.id
      where cr.id = $1
        and cr.source_company_id = $2
      group by cr.id, c.id, cm.id
      limit 1
    `,
    [relationshipId, currentCompanyId]
  );

  return result.rows[0] ?? null;
}

companyRelationshipsRouter.post('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const currentUserId = getCurrentUserId(authReq);
  const body = asRecord(req.body);
  const company = asRecord(body.company);
  const contact = asRecord(body.contact);
  const relationship = asRecord(body.relationship);

  const companyName = getString(company.name);
  const businessRegistrationNo = getString(company.businessRegistrationNo) || null;
  const companyType = getString(company.companyType) || null;
  const representativeName = getString(company.representativeName) || null;
  const websiteUrl = getString(company.websiteUrl) || null;
  const address = getString(company.address) || null;
  const contactName = getString(contact.name);
  const contactDepartment = getString(contact.department) || null;
  const contactPosition = getString(contact.position) || null;
  const contactEmail = getString(contact.email) || null;
  const contactPhone = getString(contact.phone) || null;
  const capabilities = getStringArray(body.capabilities);
  const certifications = getStringArray(body.certifications);
  const internalGrade = getString(relationship.internalGrade) || null;
  const managementStatus = getManagementStatus(relationship.managementStatus) ?? 'active';
  const tags = getString(relationship.tags) || null;
  const memo = getString(relationship.memo) || null;
  const relationshipType = getString(relationship.relationshipType) || 'preferred_partner';

  if (!companyName) {
    sendError(res, 400, 'VALIDATION_ERROR', '공급기업명은 필수입니다.');
    return;
  }

  if (relationshipType !== 'preferred_partner' && relationshipType !== 'bid_participation' && relationshipType !== 'contract' && relationshipType !== 'won_project') {
    sendError(res, 400, 'VALIDATION_ERROR', '지원하지 않는 관계 유형입니다.');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    let targetCompanyId: string | null = null;

    if (businessRegistrationNo) {
      const existingByBusinessNo = await client.query<{ id: string }>(
        'select id from companies where business_registration_no = $1 limit 1',
        [businessRegistrationNo]
      );
      targetCompanyId = existingByBusinessNo.rows[0]?.id ?? null;
    }

    if (!targetCompanyId) {
      const existingByName = await client.query<{ id: string }>('select id from companies where lower(name) = lower($1) limit 1', [
        companyName
      ]);
      targetCompanyId = existingByName.rows[0]?.id ?? null;
    }

    if (targetCompanyId === currentCompanyId) {
      await client.query('rollback');
      sendError(res, 400, 'INVALID_RELATIONSHIP_TARGET', '본인 회사는 공급기업으로 등록할 수 없습니다.');
      return;
    }

    if (targetCompanyId) {
      await client.query(
        `
          update companies
          set name = $1,
              business_registration_no = coalesce($2, business_registration_no),
              company_type = $3,
              representative_name = $4,
              website_url = $5,
              address = $6,
              contact_phone = $7,
              contact_email = $8,
              supports_supplier = true,
              updated_at = now()
          where id = $9
        `,
        [companyName, businessRegistrationNo, companyType, representativeName, websiteUrl, address, contactPhone, contactEmail, targetCompanyId]
      );
    } else {
      const createdCompany = await client.query<{ id: string }>(
        `
          insert into companies (
            name,
            business_registration_no,
            company_type,
            representative_name,
            website_url,
            address,
            contact_phone,
            contact_email,
            supports_buyer,
            supports_supplier,
            status
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, false, true, 'active')
          returning id
        `,
        [companyName, businessRegistrationNo, companyType, representativeName, websiteUrl, address, contactPhone, contactEmail]
      );
      targetCompanyId = createdCompany.rows[0].id;
    }

    if (contactName) {
      const existingContact = await client.query<{ id: string }>(
        `
          select id
          from company_members
          where company_id = $1
            and member_type = 'contact'
            and lower(name) = lower($2)
          limit 1
        `,
        [targetCompanyId, contactName]
      );

      if (existingContact.rows[0]) {
        await client.query(
          `
            update company_members
            set department = $1,
                position = $2,
                email = $3,
                phone = $4,
                status = 'active',
                updated_at = now()
            where id = $5
          `,
          [contactDepartment, contactPosition, contactEmail, contactPhone, existingContact.rows[0].id]
        );
      } else {
        await client.query(
          `
            insert into company_members (
              company_id,
              name,
              department,
              position,
              email,
              phone,
              member_type,
              status
            )
            values ($1, $2, $3, $4, $5, $6, 'contact', 'active')
          `,
          [targetCompanyId, contactName, contactDepartment, contactPosition, contactEmail, contactPhone]
        );
      }
    }

    await client.query('delete from company_capabilities where company_id = $1', [targetCompanyId]);
    for (const capability of capabilities) {
      await client.query(
        `
          insert into company_capabilities (company_id, name, capability_type)
          values ($1, $2, 'technology')
          on conflict (company_id, name) do nothing
        `,
        [targetCompanyId, capability]
      );
    }

    await client.query('delete from company_certifications where company_id = $1', [targetCompanyId]);
    for (const certification of certifications) {
      await client.query(
        `
          insert into company_certifications (company_id, name)
          values ($1, $2)
          on conflict (company_id, name) do nothing
        `,
        [targetCompanyId, certification]
      );
    }

    const ownerMember = await client.query<{ id: string }>('select id from company_members where user_id = $1 limit 1', [currentUserId]);
    const internalOwnerMemberId = ownerMember.rows[0]?.id ?? null;

    const existingRelationship = await client.query<{ id: string }>(
      `
        select id
        from company_relationships
        where source_company_id = $1
          and target_company_id = $2
          and source_perspective = 'buyer'
          and target_perspective = 'supplier'
        limit 1
      `,
      [currentCompanyId, targetCompanyId]
    );

    let relationshipId: string;

    if (existingRelationship.rows[0]) {
      relationshipId = existingRelationship.rows[0].id;
      await client.query(
        `
          update company_relationships
          set relationship_type = $1,
              status = 'active',
              last_activity_date = current_date,
              internal_grade = $2,
              management_status = $3,
              tags = $4,
              memo = $5,
              internal_owner_member_id = $6,
              updated_at = now()
          where id = $7
        `,
        [relationshipType, internalGrade, managementStatus, tags, memo, internalOwnerMemberId, relationshipId]
      );
    } else {
      const createdRelationship = await client.query<{ id: string }>(
        `
          insert into company_relationships (
            source_company_id,
            target_company_id,
            source_perspective,
            target_perspective,
            relationship_type,
            status,
            first_activity_date,
            last_activity_date,
            internal_grade,
            management_status,
            tags,
            memo,
            internal_owner_member_id
          )
          values ($1, $2, 'buyer', 'supplier', $3, 'active', current_date, current_date, $4, $5, $6, $7, $8)
          returning id
        `,
        [currentCompanyId, targetCompanyId, relationshipType, internalGrade, managementStatus, tags, memo, internalOwnerMemberId]
      );
      relationshipId = createdRelationship.rows[0].id;
    }

    await client.query('commit');

    const savedRelationship = await findRelationship(relationshipId, currentCompanyId);

    if (!savedRelationship) {
      sendError(res, 404, 'RELATIONSHIP_NOT_FOUND', '등록된 공급기업 정보를 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, toRelationshipResponse(savedRelationship), existingRelationship.rows[0] ? 200 : 201);
  } catch (error) {
    await client.query('rollback');
    next(error);
  } finally {
    client.release();
  }
});

companyRelationshipsRouter.get('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const query = asRecord(req.query);
  const perspective = getString(query.perspective) || 'buyer';
  const q = getString(query.q);

  if (perspective !== 'buyer' && perspective !== 'supplier') {
    sendError(res, 400, 'VALIDATION_ERROR', '지원하지 않는 관계 관점입니다.');
    return;
  }

  const values: unknown[] = [currentCompanyId, perspective];
  const conditions = ['cr.source_company_id = $1', 'cr.source_perspective = $2', "cr.status = 'active'"];

  if (perspective === 'buyer') {
    conditions.push("cr.target_perspective = 'supplier'");
  }

  if (perspective === 'supplier') {
    conditions.push("cr.target_perspective = 'buyer'");
  }

  if (q) {
    values.push(`%${q}%`);
    conditions.push(`(c.name ilike $${values.length} or c.business_registration_no ilike $${values.length})`);
  }

  try {
    const result = await pool.query<CompanyRelationshipRow>(
      `
        select
          cr.id,
          cr.source_company_id,
          cr.target_company_id,
          cr.source_perspective,
          cr.target_perspective,
          cr.relationship_type,
          cr.status,
          cr.internal_grade,
          cr.management_status,
          cr.tags,
          cr.memo,
          c.name as target_company_name,
          c.business_registration_no as target_company_business_registration_no,
          c.company_type as target_company_type,
          c.representative_name as target_representative_name,
          c.website_url as target_website_url,
          c.address as target_address,
          c.contact_phone as target_contact_phone,
          c.contact_email as target_contact_email,
          cm.id as contact_member_id,
          cm.name as contact_member_name,
          cm.department as contact_member_department,
          cm.position as contact_member_position,
          cm.email as contact_member_email,
          cm.phone as contact_member_phone,
          coalesce(array_agg(distinct cc.name) filter (where cc.name is not null), '{}') as capabilities,
          coalesce(array_agg(distinct cert.name) filter (where cert.name is not null), '{}') as certifications
        from company_relationships cr
        join companies c on c.id = cr.target_company_id
        left join lateral (
          select *
          from company_members cm
          where cm.company_id = cr.target_company_id
            and cm.member_type = 'contact'
            and cm.status = 'active'
          order by cm.created_at desc
          limit 1
        ) cm on true
        left join company_capabilities cc on cc.company_id = c.id
        left join company_certifications cert on cert.company_id = c.id
        where ${conditions.join('\n          and ')}
        group by cr.id, c.id, cm.id
        order by cr.updated_at desc
      `,
      values
    );

    sendSuccess(res, {
      items: result.rows.map(toRelationshipResponse),
      total: result.rowCount ?? result.rows.length
    });
  } catch (error) {
    next(error);
  }
});
