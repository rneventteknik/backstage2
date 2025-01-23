export function up(knex) {
    return knex.schema.alterTable('Booking', (table) => {
        table.dateTime('invoiceDate');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Booking', (table) => {
        table.dateTime('invoiceDate');
    });
}
