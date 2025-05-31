export function up(knex) {
    return knex.schema.alterTable('Booking', (table) => {
        table.bool('internalReservation').notNullable().defaultTo(0);
    });
}

export function down(knex) {
    return knex.schema.alterTable('Booking', (table) => {
        table.dropColumn('internalReservation');
    });
}
