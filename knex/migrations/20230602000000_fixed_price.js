export function up(knex) {
    return knex.schema.alterTable('Booking', (table) => {
        table.integer('fixedPrice');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Booking', (table) => {
        table.dropColumn('fixedPrice');
    });
}
