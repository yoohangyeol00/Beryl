export const shorthands = undefined;

const timestamps = (pgm) => ({
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

const uuidPrimaryKey = (pgm) => ({
  type: 'uuid',
  primaryKey: true,
  default: pgm.func('gen_random_uuid()')
});

export function up(pgm) {
  pgm.addColumns('companies', {
    company_type: {
      type: 'varchar(30)'
    },
    representative_name: {
      type: 'varchar(100)'
    },
    address: {
      type: 'text'
    },
    contact_phone: {
      type: 'varchar(50)'
    },
    contact_email: {
      type: 'varchar(255)'
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'active'
    }
  });
  pgm.addConstraint('companies', 'companies_status_check', {
    check: "status in ('active', 'inactive', 'pending')"
  });

  pgm.createTable('company_members', {
    id: uuidPrimaryKey(pgm),
    company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    user_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'set null',
      unique: true
    },
    name: {
      type: 'varchar(100)',
      notNull: true
    },
    department: {
      type: 'varchar(100)'
    },
    position: {
      type: 'varchar(100)'
    },
    email: {
      type: 'varchar(255)'
    },
    phone: {
      type: 'varchar(50)'
    },
    member_type: {
      type: 'varchar(30)',
      notNull: true,
      default: 'employee'
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'active'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('company_members', 'company_members_member_type_check', {
    check: "member_type in ('employee', 'manager', 'contact', 'external')"
  });
  pgm.addConstraint('company_members', 'company_members_status_check', {
    check: "status in ('active', 'inactive')"
  });
  pgm.createIndex('company_members', 'company_id');
  pgm.createIndex('company_members', 'user_id');

  pgm.createTable('company_relationships', {
    id: uuidPrimaryKey(pgm),
    source_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    target_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    source_perspective: {
      type: 'varchar(30)',
      notNull: true
    },
    target_perspective: {
      type: 'varchar(30)',
      notNull: true
    },
    relationship_type: {
      type: 'varchar(50)',
      notNull: true
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'active'
    },
    first_activity_date: {
      type: 'date'
    },
    last_activity_date: {
      type: 'date'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('company_relationships', 'company_relationships_source_perspective_check', {
    check: "source_perspective in ('buyer', 'supplier')"
  });
  pgm.addConstraint('company_relationships', 'company_relationships_target_perspective_check', {
    check: "target_perspective in ('buyer', 'supplier')"
  });
  pgm.addConstraint('company_relationships', 'company_relationships_type_check', {
    check: "relationship_type in ('bid_participation', 'contract', 'won_project', 'preferred_partner')"
  });
  pgm.addConstraint('company_relationships', 'company_relationships_status_check', {
    check: "status in ('active', 'inactive', 'pending')"
  });
  pgm.addConstraint('company_relationships', 'company_relationships_distinct_companies_check', {
    check: 'source_company_id <> target_company_id'
  });
  pgm.createIndex('company_relationships', ['source_company_id', 'target_company_id']);

  pgm.createTable('jobs', {
    id: uuidPrimaryKey(pgm),
    buyer_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    internal_owner_member_id: {
      type: 'uuid',
      references: 'company_members(id)',
      onDelete: 'set null'
    },
    notice_number: {
      type: 'varchar(100)',
      unique: true
    },
    title: {
      type: 'varchar(255)',
      notNull: true
    },
    category: {
      type: 'varchar(100)'
    },
    procurement_type: {
      type: 'varchar(30)',
      notNull: true,
      default: 'public'
    },
    source_type: {
      type: 'varchar(30)',
      notNull: true,
      default: 'manual'
    },
    source_url: {
      type: 'text'
    },
    budget: {
      type: 'numeric(18,2)'
    },
    published_at: {
      type: 'date'
    },
    deadline: {
      type: 'date'
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'draft'
    },
    rfp_score: {
      type: 'numeric(5,2)'
    },
    recommended_people_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    description: {
      type: 'text'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('jobs', 'jobs_procurement_type_check', {
    check: "procurement_type in ('public', 'private')"
  });
  pgm.addConstraint('jobs', 'jobs_source_type_check', {
    check: "source_type in ('nara', 'private_bid', 'manual', 'email', 'other')"
  });
  pgm.addConstraint('jobs', 'jobs_status_check', {
    check: "status in ('draft', 'open', 'closingSoon', 'closed', 'awarded')"
  });
  pgm.createIndex('jobs', 'buyer_company_id');
  pgm.createIndex('jobs', 'internal_owner_member_id');
  pgm.createIndex('jobs', 'deadline');
  pgm.createIndex('jobs', 'status');

  pgm.createTable('job_requirements', {
    id: uuidPrimaryKey(pgm),
    job_id: {
      type: 'uuid',
      notNull: true,
      references: 'jobs(id)',
      onDelete: 'cascade'
    },
    requirement_type: {
      type: 'varchar(30)',
      notNull: true
    },
    title: {
      type: 'varchar(255)',
      notNull: true
    },
    description: {
      type: 'text'
    },
    priority: {
      type: 'integer'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('job_requirements', 'job_requirements_type_check', {
    check: "requirement_type in ('required', 'preferred', 'technical', 'business', 'schedule', 'risk')"
  });
  pgm.createIndex('job_requirements', 'job_id');

  pgm.createTable('rfp_analyses', {
    id: uuidPrimaryKey(pgm),
    job_id: {
      type: 'uuid',
      notNull: true,
      references: 'jobs(id)',
      onDelete: 'cascade',
      unique: true
    },
    score: {
      type: 'numeric(5,2)'
    },
    summary: {
      type: 'text'
    },
    required_skills: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func("'[]'::jsonb")
    },
    preferred_skills: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func("'[]'::jsonb")
    },
    risks: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func("'[]'::jsonb")
    },
    keywords: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func("'[]'::jsonb")
    },
    analyzed_at: {
      type: 'timestamptz'
    },
    ...timestamps(pgm)
  });

  pgm.createTable('rfp_files', {
    id: uuidPrimaryKey(pgm),
    job_id: {
      type: 'uuid',
      notNull: true,
      references: 'jobs(id)',
      onDelete: 'cascade'
    },
    original_file_name: {
      type: 'varchar(255)',
      notNull: true
    },
    storage_key: {
      type: 'text',
      notNull: true
    },
    mime_type: {
      type: 'varchar(100)',
      notNull: true
    },
    file_size: {
      type: 'bigint',
      notNull: true
    },
    checksum: {
      type: 'varchar(255)'
    },
    uploaded_by: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'set null'
    },
    uploaded_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    ...timestamps(pgm)
  });
  pgm.createIndex('rfp_files', 'job_id');
  pgm.createIndex('rfp_files', 'uploaded_by');

  pgm.createTable('resumes', {
    id: uuidPrimaryKey(pgm),
    owner_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    company_member_id: {
      type: 'uuid',
      references: 'company_members(id)',
      onDelete: 'set null'
    },
    name: {
      type: 'varchar(100)',
      notNull: true
    },
    role: {
      type: 'varchar(100)'
    },
    career_years: {
      type: 'integer'
    },
    available_from: {
      type: 'date'
    },
    availability_status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'available'
    },
    employment_status: {
      type: 'varchar(30)'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('resumes', 'resumes_availability_status_check', {
    check: "availability_status in ('available', 'assigned', 'partiallyAssigned', 'unavailable')"
  });
  pgm.createIndex('resumes', 'owner_company_id');
  pgm.createIndex('resumes', 'company_member_id');

  pgm.createTable('resume_skills', {
    id: uuidPrimaryKey(pgm),
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: 'resumes(id)',
      onDelete: 'cascade'
    },
    skill_name: {
      type: 'varchar(100)',
      notNull: true
    },
    skill_level: {
      type: 'varchar(30)'
    },
    years_experience: {
      type: 'integer'
    },
    ...timestamps(pgm)
  });
  pgm.createIndex('resume_skills', 'resume_id');
  pgm.createIndex('resume_skills', 'skill_name');

  pgm.createTable('resume_projects', {
    id: uuidPrimaryKey(pgm),
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: 'resumes(id)',
      onDelete: 'cascade'
    },
    project_name: {
      type: 'varchar(255)',
      notNull: true
    },
    client_name: {
      type: 'varchar(255)'
    },
    role: {
      type: 'varchar(100)'
    },
    started_at: {
      type: 'date'
    },
    ended_at: {
      type: 'date'
    },
    man_months: {
      type: 'numeric(8,2)'
    },
    description: {
      type: 'text'
    },
    ...timestamps(pgm)
  });
  pgm.createIndex('resume_projects', 'resume_id');

  pgm.createTable('offers', {
    id: uuidPrimaryKey(pgm),
    job_id: {
      type: 'uuid',
      notNull: true,
      references: 'jobs(id)',
      onDelete: 'cascade'
    },
    supplier_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'draft'
    },
    total_match_score: {
      type: 'numeric(5,2)'
    },
    submitted_at: {
      type: 'date'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('offers', 'offers_status_check', {
    check: "status in ('draft', 'submitted', 'awarded', 'rejected')"
  });
  pgm.createIndex('offers', 'job_id');
  pgm.createIndex('offers', 'supplier_company_id');

  pgm.createTable('offer_matches', {
    id: uuidPrimaryKey(pgm),
    offer_id: {
      type: 'uuid',
      notNull: true,
      references: 'offers(id)',
      onDelete: 'cascade'
    },
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: 'resumes(id)',
      onDelete: 'cascade'
    },
    total_score: {
      type: 'numeric(5,2)'
    },
    required_skill_score: {
      type: 'numeric(5,2)'
    },
    preferred_skill_score: {
      type: 'numeric(5,2)'
    },
    project_experience_score: {
      type: 'numeric(5,2)'
    },
    availability_score: {
      type: 'numeric(5,2)'
    },
    reasons: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func("'[]'::jsonb")
    },
    risks: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func("'[]'::jsonb")
    },
    decision_status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'recommended'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('offer_matches', 'offer_matches_decision_status_check', {
    check: "decision_status in ('recommended', 'shortlisted', 'confirmed', 'rejected')"
  });
  pgm.createIndex('offer_matches', 'offer_id');
  pgm.createIndex('offer_matches', 'resume_id');

  pgm.createTable('contracts', {
    id: uuidPrimaryKey(pgm),
    job_id: {
      type: 'uuid',
      references: 'jobs(id)',
      onDelete: 'set null'
    },
    offer_id: {
      type: 'uuid',
      references: 'offers(id)',
      onDelete: 'set null'
    },
    buyer_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    supplier_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    contract_no: {
      type: 'varchar(100)',
      unique: true
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'draft'
    },
    contract_amount: {
      type: 'numeric(18,2)'
    },
    started_at: {
      type: 'date'
    },
    ended_at: {
      type: 'date'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('contracts', 'contracts_status_check', {
    check: "status in ('draft', 'active', 'completed', 'cancelled')"
  });
  pgm.createIndex('contracts', 'job_id');
  pgm.createIndex('contracts', 'offer_id');
  pgm.createIndex('contracts', ['buyer_company_id', 'supplier_company_id']);

  pgm.createTable('won_projects', {
    id: uuidPrimaryKey(pgm),
    contract_id: {
      type: 'uuid',
      references: 'contracts(id)',
      onDelete: 'set null'
    },
    job_id: {
      type: 'uuid',
      references: 'jobs(id)',
      onDelete: 'set null'
    },
    buyer_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    supplier_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    name: {
      type: 'varchar(255)',
      notNull: true
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'preparing'
    },
    started_at: {
      type: 'date'
    },
    ended_at: {
      type: 'date'
    },
    planned_man_months: {
      type: 'numeric(8,2)'
    },
    actual_man_months: {
      type: 'numeric(8,2)'
    },
    risks: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func("'[]'::jsonb")
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('won_projects', 'won_projects_status_check', {
    check: "status in ('preparing', 'inProgress', 'atRisk', 'completed', 'cancelled')"
  });
  pgm.createIndex('won_projects', 'contract_id');
  pgm.createIndex('won_projects', 'job_id');
  pgm.createIndex('won_projects', ['buyer_company_id', 'supplier_company_id']);

  pgm.createTable('project_assignments', {
    id: uuidPrimaryKey(pgm),
    won_project_id: {
      type: 'uuid',
      notNull: true,
      references: 'won_projects(id)',
      onDelete: 'cascade'
    },
    resume_id: {
      type: 'uuid',
      notNull: true,
      references: 'resumes(id)',
      onDelete: 'restrict'
    },
    buyer_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    supplier_company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    role: {
      type: 'varchar(100)'
    },
    assigned_from: {
      type: 'date'
    },
    assigned_to: {
      type: 'date'
    },
    allocation_rate: {
      type: 'numeric(5,2)',
      notNull: true,
      default: 1
    },
    planned_man_months: {
      type: 'numeric(8,2)'
    },
    actual_man_months: {
      type: 'numeric(8,2)'
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'assigned'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('project_assignments', 'project_assignments_status_check', {
    check: "status in ('planned', 'assigned', 'completed', 'cancelled')"
  });
  pgm.addConstraint('project_assignments', 'project_assignments_allocation_rate_check', {
    check: 'allocation_rate >= 0 and allocation_rate <= 1'
  });
  pgm.createIndex('project_assignments', 'won_project_id');
  pgm.createIndex('project_assignments', 'resume_id');
  pgm.createIndex('project_assignments', ['buyer_company_id', 'supplier_company_id']);
}

export function down(pgm) {
  pgm.dropTable('project_assignments');
  pgm.dropTable('won_projects');
  pgm.dropTable('contracts');
  pgm.dropTable('offer_matches');
  pgm.dropTable('offers');
  pgm.dropTable('resume_projects');
  pgm.dropTable('resume_skills');
  pgm.dropTable('resumes');
  pgm.dropTable('rfp_files');
  pgm.dropTable('rfp_analyses');
  pgm.dropTable('job_requirements');
  pgm.dropTable('jobs');
  pgm.dropTable('company_relationships');
  pgm.dropTable('company_members');
  pgm.dropConstraint('companies', 'companies_status_check');
  pgm.dropColumns('companies', [
    'company_type',
    'representative_name',
    'address',
    'contact_phone',
    'contact_email',
    'status'
  ]);
}

