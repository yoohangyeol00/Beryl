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
  pgm.addColumns('company_relationships', {
    internal_grade: {
      type: 'varchar(30)'
    },
    management_status: {
      type: 'varchar(30)'
    },
    tags: {
      type: 'text'
    },
    memo: {
      type: 'text'
    },
    internal_owner_member_id: {
      type: 'uuid',
      references: 'company_members(id)',
      onDelete: 'set null'
    }
  });

  pgm.addConstraint('company_relationships', 'company_relationships_management_status_check', {
    check: "management_status is null or management_status in ('preferred', 'active', 'review', 'watch')"
  });
  pgm.createIndex('company_relationships', 'internal_owner_member_id');

  pgm.createTable('company_capabilities', {
    id: uuidPrimaryKey(pgm),
    company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'cascade'
    },
    name: {
      type: 'varchar(100)',
      notNull: true
    },
    capability_type: {
      type: 'varchar(30)',
      notNull: true,
      default: 'technology'
    },
    ...timestamps(pgm)
  });
  pgm.addConstraint('company_capabilities', 'company_capabilities_type_check', {
    check: "capability_type in ('technology', 'domain', 'service')"
  });
  pgm.createIndex('company_capabilities', 'company_id');
  pgm.createIndex('company_capabilities', ['company_id', 'name'], { unique: true });

  pgm.createTable('company_certifications', {
    id: uuidPrimaryKey(pgm),
    company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'cascade'
    },
    name: {
      type: 'varchar(100)',
      notNull: true
    },
    grade: {
      type: 'varchar(100)'
    },
    file_name: {
      type: 'varchar(255)'
    },
    storage_key: {
      type: 'text'
    },
    mime_type: {
      type: 'varchar(100)'
    },
    file_size: {
      type: 'bigint'
    },
    ...timestamps(pgm)
  });
  pgm.createIndex('company_certifications', 'company_id');
  pgm.createIndex('company_certifications', ['company_id', 'name'], { unique: true });
}

export function down(pgm) {
  pgm.dropTable('company_certifications');
  pgm.dropTable('company_capabilities');
  pgm.dropConstraint('company_relationships', 'company_relationships_management_status_check');
  pgm.dropColumns('company_relationships', ['internal_grade', 'management_status', 'tags', 'memo', 'internal_owner_member_id']);
}
