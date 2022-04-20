export function up(knex) {
    return knex.schema.alterTable('Event', (table) => {
        table.string('customerName');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Event', (table) => {
        table.dropColumn('customerName');
    });
}
