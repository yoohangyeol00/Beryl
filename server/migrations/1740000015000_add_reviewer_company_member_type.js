export const shorthands = undefined;

export async function up(pgm) {
  pgm.dropConstraint('company_members', 'company_members_member_type_check');
  pgm.addConstraint('company_members', 'company_members_member_type_check', {
    check: "member_type in ('employee', 'reviewer', 'manager', 'contact', 'external')"
  });
}

export async function down(pgm) {
  pgm.sql("update company_members set member_type = 'employee' where member_type = 'reviewer'");
  pgm.dropConstraint('company_members', 'company_members_member_type_check');
  pgm.addConstraint('company_members', 'company_members_member_type_check', {
    check: "member_type in ('employee', 'manager', 'contact', 'external')"
  });
}
