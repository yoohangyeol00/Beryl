export const shorthands = undefined;

export function up(pgm) {
  pgm.addColumns('companies', {
    website_url: {
      type: 'text'
    }
  });
}

export function down(pgm) {
  pgm.dropColumns('companies', ['website_url']);
}
