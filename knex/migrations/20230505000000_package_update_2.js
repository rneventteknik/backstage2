export function up(knex) {
    return knex.schema.alterTable('EquipmentPackageEntry', (table) => {
        table.integer('numberOfHours').notNullable().defaultTo(0);
        table.integer('sortIndex').notNullable().defaultTo(0);
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentPackageEntry', (table) => {
        table.dropColumn('numberOfHours');
        table.dropColumn('sortIndex');
    });
}
