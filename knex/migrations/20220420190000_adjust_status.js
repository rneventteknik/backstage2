export function up(knex) {
    return knex.schema
        .alterTable('Event', (table) => {
            table.integer('paymentStatus');
        })
        .alterTable('EquipmentList', (table) => {
            table.integer('rentalStatus');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('Event', (table) => {
            table.dropColumn('paymentStatus');
        })
        .alterTable('EquipmentList', (table) => {
            table.dropColumn('rentalStatus');
        });
}
