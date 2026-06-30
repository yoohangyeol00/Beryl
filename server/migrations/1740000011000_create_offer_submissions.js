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
  pgm.createTable('offer_submissions', {
    id: uuidPrimaryKey(pgm),
    offer_id: {
      type: 'uuid',
      notNull: true,
      references: 'offers(id)',
      onDelete: 'cascade'
    },
    submitted_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    channel: {
      type: 'varchar(30)',
      notNull: true
    },
    receipt_no: {
      type: 'varchar(100)'
    },
    submitted_by_member_id: {
      type: 'uuid',
      references: 'company_members(id)',
      onDelete: 'set null'
    },
    submitted_by_name: {
      type: 'varchar(100)'
    },
    memo: {
      type: 'text'
    },
    ...timestamps(pgm)
  });

  pgm.addConstraint('offer_submissions', 'offer_submissions_channel_check', {
    check: "channel in ('nara', 'email', 'portal', 'visit', 'other')"
  });
  pgm.createIndex('offer_submissions', 'offer_id');
  pgm.createIndex('offer_submissions', 'submitted_at');
}

export function down(pgm) {
  pgm.dropTable('offer_submissions');
}
