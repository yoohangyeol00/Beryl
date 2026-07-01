import { randomUUID } from 'crypto';
import express, { type Request, type Response } from 'express';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { pool } from '../db.js';
import { getCurrentCompanyId, getCurrentUserId, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { parseMultipartFile } from '../utils/multipart.js';
import { createCompanyScopedRouter } from './companyScopedRouter.js';

export const companyRelationshipsRouter = createCompanyScopedRouter();

type ManagementStatus = 'preferred' | 'active' | 'review' | 'watch';

const certificationUpload = express.raw({
  type: (req) => (req.headers['content-type'] ?? '').startsWith('multipart/form-data'),
  limit: '10mb'
});

const allowedCertificationTypes = new Map([
  ['application/pdf', 'pdf'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png']
]);

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
  contact_id: string | null;
  contact_name: string | null;
  contact_department: string | null;
  contact_position: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  capabilities: string[] | null;
  certifications: string[] | null;
  certification_files: Array<{
    id: string;
    name: string;
    fileName: string | null;
    url: string | null;
    mimeType: string | null;
    fileSize: string | number | null;
  }> | null;
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

function getCertificationExtension(mimeType: string): string | null {
  return allowedCertificationTypes.get(mimeType) ?? null;
}

function getRelationshipPayload(bodyValue: unknown) {
  const body = asRecord(bodyValue);
  const company = asRecord(body.company);
  const contact = asRecord(body.contact);
  const relationship = asRecord(body.relationship);

  return {
    companyName: getString(company.name),
    businessRegistrationNo: getString(company.businessRegistrationNo) || null,
    companyType: getString(company.companyType) || null,
    representativeName: getString(company.representativeName) || null,
    websiteUrl: getString(company.websiteUrl) || null,
    address: getString(company.address) || null,
    contactName: getString(contact.name),
    contactDepartment: getString(contact.department) || null,
    contactPosition: getString(contact.position) || null,
    contactEmail: getString(contact.email) || null,
    contactPhone: getString(contact.phone) || null,
    capabilities: getStringArray(body.capabilities),
    certifications: getStringArray(body.certifications),
    internalGrade: getString(relationship.internalGrade) || null,
    managementStatus: getManagementStatus(relationship.managementStatus) ?? 'active',
    tags: getString(relationship.tags) || null,
    memo: getString(relationship.memo) || null,
    relationshipType: getString(relationship.relationshipType) || 'preferred_partner'
  };
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
    contact: row.contact_id
      ? {
          id: row.contact_id,
          name: row.contact_name,
          department: row.contact_department,
          position: row.contact_position,
          email: row.contact_email,
          phone: row.contact_phone
        }
      : null,
    capabilities: row.capabilities ?? [],
    certifications: row.certifications ?? [],
    certificationFiles: row.certification_files ?? []
  };
}

async function upsertCompanyContact(
  client: { query: typeof pool.query },
  {
    companyId,
    name,
    department,
    position,
    email,
    phone
  }: {
    companyId: string;
    name: string;
    department: string | null;
    position: string | null;
    email: string | null;
    phone: string | null;
  }
) {
  if (!name) {
    return null;
  }

  const existingContact = await client.query<{ id: string }>(
    `
      select id
      from company_contacts
      where company_id = $1
        and lower(name) = lower($2)
      limit 1
    `,
    [companyId, name]
  );

  if (existingContact.rows[0]) {
    const updatedContact = await client.query<{ id: string }>(
      `
        update company_contacts
        set department = $1,
            position = $2,
            email = $3,
            phone = $4,
            is_primary = true,
            status = 'active',
            updated_at = now()
        where id = $5
        returning id
      `,
      [department, position, email, phone, existingContact.rows[0].id]
    );

    return updatedContact.rows[0].id;
  }

  const createdContact = await client.query<{ id: string }>(
    `
      insert into company_contacts (
        company_id,
        name,
        department,
        position,
        email,
        phone,
        contact_type,
        is_primary,
        status
      )
      values ($1, $2, $3, $4, $5, $6, 'business', true, 'active')
      returning id
    `,
    [companyId, name, department, position, email, phone]
  );

  return createdContact.rows[0].id;
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
        ct.id as contact_id,
        ct.name as contact_name,
        ct.department as contact_department,
        ct.position as contact_position,
        ct.email as contact_email,
        ct.phone as contact_phone,
        coalesce(array_agg(distinct cc.name) filter (where cc.name is not null), '{}') as capabilities,
        coalesce(array_agg(distinct cert.name) filter (where cert.name is not null), '{}') as certifications,
        coalesce(
          jsonb_agg(
            distinct jsonb_build_object(
              'id', cert.id,
              'name', cert.name,
              'fileName', cert.file_name,
              'url', concat('/api/company-relationships/', cr.id, '/certification-files/', cert.id, '/download'),
              'mimeType', cert.mime_type,
              'fileSize', cert.file_size
            )
          ) filter (where cert.storage_key is not null),
          '[]'::jsonb
        ) as certification_files
      from company_relationships cr
      join companies c on c.id = cr.target_company_id
      left join company_contacts ct
        on ct.id = cr.contact_id
       and ct.status = 'active'
      left join company_capabilities cc on cc.company_id = c.id
      left join company_certifications cert on cert.company_id = c.id
      where cr.id = $1
        and cr.source_company_id = $2
      group by cr.id, c.id, ct.id, ct.name, ct.department, ct.position, ct.email, ct.phone
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
  const {
    companyName,
    businessRegistrationNo,
    companyType,
    representativeName,
    websiteUrl,
    address,
    contactName,
    contactDepartment,
    contactPosition,
    contactEmail,
    contactPhone,
    capabilities,
    certifications,
    internalGrade,
    managementStatus,
    tags,
    memo,
    relationshipType
  } = getRelationshipPayload(req.body);

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

    const contactId = await upsertCompanyContact(client, {
      companyId: targetCompanyId,
      name: contactName,
      department: contactDepartment,
      position: contactPosition,
      email: contactEmail,
      phone: contactPhone
    });

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

    await client.query('delete from company_certifications where company_id = $1 and storage_key is null', [targetCompanyId]);
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
              contact_id = $7,
              updated_at = now()
          where id = $8
        `,
        [relationshipType, internalGrade, managementStatus, tags, memo, internalOwnerMemberId, contactId, relationshipId]
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
            internal_owner_member_id,
            contact_id
          )
          values ($1, $2, 'buyer', 'supplier', $3, 'active', current_date, current_date, $4, $5, $6, $7, $8, $9)
          returning id
        `,
        [currentCompanyId, targetCompanyId, relationshipType, internalGrade, managementStatus, tags, memo, internalOwnerMemberId, contactId]
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

companyRelationshipsRouter.get('/:relationshipId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const relationshipId = getString(req.params.relationshipId);

  if (!relationshipId) {
    sendError(res, 400, 'VALIDATION_ERROR', '공급기업 관계 ID가 필요합니다.');
    return;
  }

  try {
    const relationship = await findRelationship(relationshipId, currentCompanyId);

    if (!relationship) {
      sendError(res, 404, 'RELATIONSHIP_NOT_FOUND', '공급기업 관계 정보를 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, toRelationshipResponse(relationship));
  } catch (error) {
    next(error);
  }
});

companyRelationshipsRouter.patch('/:relationshipId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const currentUserId = getCurrentUserId(authReq);
  const relationshipId = getString(req.params.relationshipId);
  const {
    companyName,
    businessRegistrationNo,
    companyType,
    representativeName,
    websiteUrl,
    address,
    contactName,
    contactDepartment,
    contactPosition,
    contactEmail,
    contactPhone,
    capabilities,
    certifications,
    internalGrade,
    managementStatus,
    tags,
    memo,
    relationshipType
  } = getRelationshipPayload(req.body);

  if (!relationshipId) {
    sendError(res, 400, 'VALIDATION_ERROR', '공급기업 관계 ID가 필요합니다.');
    return;
  }

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

    const relationshipResult = await client.query<{ target_company_id: string }>(
      `
        select target_company_id
        from company_relationships
        where id = $1
          and source_company_id = $2
          and source_perspective = 'buyer'
          and target_perspective = 'supplier'
          and status = 'active'
        limit 1
      `,
      [relationshipId, currentCompanyId]
    );

    const targetCompanyId = relationshipResult.rows[0]?.target_company_id;

    if (!targetCompanyId) {
      await client.query('rollback');
      sendError(res, 404, 'RELATIONSHIP_NOT_FOUND', '공급기업 관계 정보를 찾을 수 없습니다.');
      return;
    }

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

    const contactId = await upsertCompanyContact(client, {
      companyId: targetCompanyId,
      name: contactName,
      department: contactDepartment,
      position: contactPosition,
      email: contactEmail,
      phone: contactPhone
    });

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

    await client.query('delete from company_certifications where company_id = $1 and storage_key is null', [targetCompanyId]);
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

    await client.query(
      `
        update company_relationships
        set relationship_type = $1,
            last_activity_date = current_date,
            internal_grade = $2,
            management_status = $3,
            tags = $4,
            memo = $5,
            internal_owner_member_id = $6,
            contact_id = $7,
            updated_at = now()
        where id = $8
          and source_company_id = $9
      `,
      [relationshipType, internalGrade, managementStatus, tags, memo, internalOwnerMemberId, contactId, relationshipId, currentCompanyId]
    );

    await client.query('commit');

    const savedRelationship = await findRelationship(relationshipId, currentCompanyId);

    if (!savedRelationship) {
      sendError(res, 404, 'RELATIONSHIP_NOT_FOUND', '수정된 공급기업 정보를 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, toRelationshipResponse(savedRelationship));
  } catch (error) {
    await client.query('rollback');
    next(error);
  } finally {
    client.release();
  }
});

companyRelationshipsRouter.delete('/:relationshipId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const relationshipId = getString(req.params.relationshipId);

  if (!relationshipId) {
    sendError(res, 400, 'VALIDATION_ERROR', '공급기업 관계 ID가 필요합니다.');
    return;
  }

  try {
    const result = await pool.query(
      `
        update company_relationships
        set status = 'inactive',
            updated_at = now()
        where id = $1
          and source_company_id = $2
          and source_perspective = 'buyer'
          and target_perspective = 'supplier'
          and status = 'active'
      `,
      [relationshipId, currentCompanyId]
    );

    if ((result.rowCount ?? 0) === 0) {
      sendError(res, 404, 'RELATIONSHIP_NOT_FOUND', '공급기업 관계 정보를 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, { id: relationshipId });
  } catch (error) {
    next(error);
  }
});

companyRelationshipsRouter.post(
  '/:relationshipId/certification-files',
  certificationUpload,
  async (req: Request, res: Response, next) => {
    const authReq = req as AuthenticatedRequest;
    const currentCompanyId = getCurrentCompanyId(authReq);
    const relationshipId = req.params.relationshipId;

    if (!Buffer.isBuffer(req.body)) {
      sendError(res, 400, 'INVALID_UPLOAD', '업로드할 인증서 파일이 필요합니다.');
      return;
    }

    const relationship = await pool.query<{ target_company_id: string }>(
      `
        select target_company_id
        from company_relationships
        where id = $1
          and source_company_id = $2
          and source_perspective = 'buyer'
          and target_perspective = 'supplier'
        limit 1
      `,
      [relationshipId, currentCompanyId]
    );

    const targetCompanyId = relationship.rows[0]?.target_company_id;

    if (!targetCompanyId) {
      sendError(res, 404, 'RELATIONSHIP_NOT_FOUND', '공급기업 관계 정보를 찾을 수 없습니다.');
      return;
    }

    const file = parseMultipartFile(req.body, req.headers['content-type'] ?? '');

    if (!file) {
      sendError(res, 400, 'INVALID_UPLOAD', '업로드할 인증서 파일이 필요합니다.');
      return;
    }

    const extension = getCertificationExtension(file.mimeType);

    if (!extension) {
      sendError(res, 400, 'UNSUPPORTED_FILE_TYPE', 'PDF, JPG, PNG 파일만 업로드할 수 있습니다.');
      return;
    }

    const fileName = `${targetCompanyId}-${Date.now()}-${randomUUID()}.${extension}`;
    const storageKey = path.join('company-certifications', fileName);
    const uploadDir = path.resolve(process.cwd(), 'private-uploads', 'company-certifications');
    const storagePath = path.join(uploadDir, fileName);

    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(storagePath, file.data);

      const result = await pool.query(
        `
          insert into company_certifications (
            company_id,
            name,
            file_name,
            storage_key,
            mime_type,
            file_size
          )
          values ($1, $2, $3, $4, $5, $6)
          on conflict (company_id, name)
          do update set
            file_name = excluded.file_name,
            storage_key = excluded.storage_key,
            mime_type = excluded.mime_type,
            file_size = excluded.file_size,
            updated_at = now()
          returning id, name, file_name, storage_key, mime_type, file_size
        `,
        [targetCompanyId, file.originalName, file.originalName, storageKey, file.mimeType, file.data.length]
      );

      sendSuccess(res, result.rows[0], 201);
    } catch (error) {
      next(error);
    }
  }
);

companyRelationshipsRouter.get(
  '/:relationshipId/certification-files/:fileId/download',
  async (req: Request, res: Response, next) => {
    const authReq = req as AuthenticatedRequest;
    const currentCompanyId = getCurrentCompanyId(authReq);
    const { relationshipId, fileId } = req.params;

    try {
      const result = await pool.query<{
        name: string;
        file_name: string | null;
        storage_key: string | null;
        mime_type: string | null;
      }>(
        `
          select cert.name, cert.file_name, cert.storage_key, cert.mime_type
          from company_certifications cert
          join company_relationships cr on cr.target_company_id = cert.company_id
          where cert.id = $1
            and cr.id = $2
            and cr.source_company_id = $3
            and cr.source_perspective = 'buyer'
            and cr.target_perspective = 'supplier'
          limit 1
        `,
        [fileId, relationshipId, currentCompanyId]
      );

      const file = result.rows[0];

      if (!file?.storage_key) {
        sendError(res, 404, 'CERTIFICATION_FILE_NOT_FOUND', '첨부 파일을 찾을 수 없습니다.');
        return;
      }

      const privateRoot = path.resolve(process.cwd(), 'private-uploads');
      const filePath = path.resolve(privateRoot, file.storage_key);

      if (!filePath.startsWith(privateRoot + path.sep)) {
        sendError(res, 400, 'INVALID_FILE_PATH', '첨부 파일 경로가 올바르지 않습니다.');
        return;
      }

      if (file.mime_type) {
        res.setHeader('Content-Type', file.mime_type);
      }

      res.download(filePath, file.file_name ?? file.name, (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

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
    conditions.push(`
      (
        c.name ilike $${values.length}
        or c.business_registration_no ilike $${values.length}
        or cr.tags ilike $${values.length}
        or cr.memo ilike $${values.length}
        or exists (
          select 1
          from company_contacts search_contact
          where search_contact.company_id = c.id
            and search_contact.status = 'active'
            and (
              search_contact.name ilike $${values.length}
              or search_contact.department ilike $${values.length}
              or search_contact.position ilike $${values.length}
              or search_contact.email ilike $${values.length}
              or search_contact.phone ilike $${values.length}
            )
        )
        or exists (
          select 1
          from company_capabilities search_cc
          where search_cc.company_id = c.id
            and search_cc.name ilike $${values.length}
        )
        or exists (
          select 1
          from company_certifications search_cert
          where search_cert.company_id = c.id
            and search_cert.name ilike $${values.length}
        )
      )
    `);
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
          ct.id as contact_id,
          ct.name as contact_name,
          ct.department as contact_department,
          ct.position as contact_position,
          ct.email as contact_email,
          ct.phone as contact_phone,
          coalesce(array_agg(distinct cc.name) filter (where cc.name is not null), '{}') as capabilities,
          coalesce(array_agg(distinct cert.name) filter (where cert.name is not null), '{}') as certifications,
          coalesce(
            jsonb_agg(
              distinct jsonb_build_object(
                'id', cert.id,
                'name', cert.name,
                'fileName', cert.file_name,
                'url', concat('/api/company-relationships/', cr.id, '/certification-files/', cert.id, '/download'),
                'mimeType', cert.mime_type,
                'fileSize', cert.file_size
              )
            ) filter (where cert.storage_key is not null),
            '[]'::jsonb
          ) as certification_files
        from company_relationships cr
        join companies c on c.id = cr.target_company_id
        left join lateral (
          select *
          from company_contacts ct
          where ct.id = cr.contact_id
            and ct.status = 'active'
          order by ct.is_primary desc, ct.updated_at desc
          limit 1
        ) ct on true
        left join company_capabilities cc on cc.company_id = c.id
        left join company_certifications cert on cert.company_id = c.id
        where ${conditions.join('\n          and ')}
        group by cr.id, c.id, ct.id, ct.name, ct.department, ct.position, ct.email, ct.phone
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
