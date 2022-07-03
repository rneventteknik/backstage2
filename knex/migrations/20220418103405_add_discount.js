export function up(knex) {
    return knex.schema.alterTable('EquipmentListEntry', (table) => {
        table.integer('discount');
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentListEntry', (table) => {
        table.dropColumn('discount');
    });
}
