export function up(knex) {
    return knex.schema.alterTable('EquipmentListEntry', (table) => {
        table.text('account');
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentListEntry', (table) => {
        table.dropColumn('account');
    });
}
