export function up(knex) {
    return knex.schema.alterTable('EquipmentPackageEntry', (table) => {
        table.integer('equipmentPriceId');
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentPackageEntry', (table) => {
        table.dropColumn('equipmentPriceId');
    });
}
