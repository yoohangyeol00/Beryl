export const shorthands = undefined;

export function up(pgm) {
  pgm.createTable('company_contacts', {
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
    contact_type: {
      type: 'varchar(30)',
      notNull: true,
      default: 'business'
    },
    is_primary: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'active'
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

  pgm.addConstraint('company_contacts', 'company_contacts_type_check', {
    check: "contact_type in ('business', 'technical', 'contract', 'other')"
  });
  pgm.addConstraint('company_contacts', 'company_contacts_status_check', {
    check: "status in ('active', 'inactive')"
  });
  pgm.createIndex('company_contacts', 'company_id');
  pgm.createIndex('company_contacts', ['company_id', 'email']);
  pgm.createIndex('company_contacts', ['company_id', 'name']);

  pgm.addColumns('company_relationships', {
    contact_id: {
      type: 'uuid',
      references: 'company_contacts(id)',
      onDelete: 'set null'
    }
  });
  pgm.createIndex('company_relationships', 'contact_id');

  pgm.sql(`
    insert into company_contacts (
      company_id,
      name,
      department,
      position,
      email,
      phone,
      contact_type,
      is_primary,
      status,
      created_at,
      updated_at
    )
    select
      company_id,
      name,
      department,
      position,
      email,
      phone,
      'business',
      true,
      case when status = 'active' then 'active' else 'inactive' end,
      created_at,
      updated_at
    from company_members
    where member_type = 'contact'
  `);

  pgm.sql(`
    with selected_contacts as (
      select
        cr.id as relationship_id,
        (
          select contact.id
          from company_contacts contact
          where contact.company_id = cr.target_company_id
            and contact.status = 'active'
          order by contact.is_primary desc, contact.updated_at desc, contact.created_at desc
          limit 1
        ) as contact_id
      from company_relationships cr
      where cr.contact_id is null
    )
    update company_relationships cr
    set contact_id = selected_contacts.contact_id
    from selected_contacts
    where cr.id = selected_contacts.relationship_id
      and selected_contacts.contact_id is not null
  `);

  pgm.dropConstraint('company_members', 'company_members_status_check');
  pgm.addConstraint('company_members', 'company_members_status_check', {
    check: "status in ('invited', 'active', 'inactive')"
  });
}

export function down(pgm) {
  pgm.sql("update company_members set status = 'inactive' where status = 'invited'");
  pgm.dropConstraint('company_members', 'company_members_status_check');
  pgm.addConstraint('company_members', 'company_members_status_check', {
    check: "status in ('active', 'inactive')"
  });
  pgm.dropColumns('company_relationships', ['contact_id']);
  pgm.dropTable('company_contacts');
}
