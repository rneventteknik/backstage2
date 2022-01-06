export function up(knex) {
    return knex.schema.alterTable('Event', (table) => {
        table.renameColumn('invoiceHoogiaId', 'invoiceHogiaId');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Event', (table) => {
        table.renameColumn('invoiceHogiaId', 'invoiceHoogiaId');
    });
}
