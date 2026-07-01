export const shorthands = undefined;

export function up(pgm) {
  pgm.createTable('job_managements', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'cascade'
    },
    job_id: {
      type: 'uuid',
      notNull: true,
      references: 'jobs(id)',
      onDelete: 'cascade'
    },
    perspective: {
      type: 'varchar(30)',
      notNull: true
    },
    management_status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'reviewing'
    },
    is_own_procurement: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    internal_owner_member_id: {
      type: 'uuid',
      references: 'company_members(id)',
      onDelete: 'set null'
    },
    is_favorite: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    memo: {
      type: 'text'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.addConstraint('job_managements', 'job_managements_perspective_check', {
    check: "perspective in ('buyer', 'supplier')"
  });
  pgm.addConstraint('job_managements', 'job_managements_status_check', {
    check: "management_status in ('reviewing', 'registered', 'proposal_receiving', 'evaluating', 'contract_ready', 'closed')"
  });
  pgm.addConstraint('job_managements', 'job_managements_unique_company_job_perspective', {
    unique: ['company_id', 'job_id', 'perspective']
  });

  pgm.createIndex('job_managements', 'company_id');
  pgm.createIndex('job_managements', 'job_id');
  pgm.createIndex('job_managements', ['company_id', 'perspective']);
  pgm.createIndex('job_managements', ['company_id', 'perspective', 'management_status']);
  pgm.createIndex('job_managements', ['company_id', 'is_own_procurement']);
  pgm.createIndex('job_managements', 'internal_owner_member_id');

  pgm.sql(`
    insert into job_managements (
      company_id,
      job_id,
      perspective,
      management_status,
      is_own_procurement,
      internal_owner_member_id,
      created_at,
      updated_at
    )
    select
      buyer_company_id,
      id,
      'buyer',
      case
        when status = 'draft' then 'registered'
        when status = 'open' then 'proposal_receiving'
        when status = 'closingSoon' then 'proposal_receiving'
        when status = 'closed' then 'evaluating'
        when status = 'awarded' then 'contract_ready'
        else 'reviewing'
      end,
      false,
      internal_owner_member_id,
      created_at,
      updated_at
    from jobs
    on conflict (company_id, job_id, perspective) do nothing
  `);
}

export function down(pgm) {
  pgm.dropTable('job_managements');
}
