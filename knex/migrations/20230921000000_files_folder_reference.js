export function up(knex) {
    return knex.schema.alterTable('Booking', (table) => {
        table.text('driveFolderId');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Booking', (table) => {
        table.dropColumn('driveFolderId');
    });
}
