export const shorthands = undefined;

export function up(pgm) {
  pgm.addColumns('companies', {
    logo_url: {
      type: 'varchar(500)'
    }
  });
}

export function down(pgm) {
  pgm.dropColumns('companies', ['logo_url']);
}
