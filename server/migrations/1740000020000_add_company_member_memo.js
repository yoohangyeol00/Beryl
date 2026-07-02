export const shorthands = undefined;

export function up(pgm) {
  pgm.addColumn('company_members', {
    memo: {
      type: 'text'
    }
  });
}

export function down(pgm) {
  pgm.dropColumn('company_members', 'memo');
}
