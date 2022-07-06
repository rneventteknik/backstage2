export function up(knex) {
    return knex.schema
        .alterTable('EquipmentListEntry', (table) => {
            table.dropColumn('nameEN');
            table.dropColumn('descriptionEN');
        })
        .alterTable('Booking', (table) => {
            table.text('language');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('EquipmentListEntry', (table) => {
            table.text('nameEN');
            table.text('descriptionEN');
        })
        .alterTable('Booking', (table) => {
            table.dropColumn('language');
        });
}
