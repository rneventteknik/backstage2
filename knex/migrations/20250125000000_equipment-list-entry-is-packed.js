export function up(knex) {
    return knex.schema.alterTable('EquipmentListEntry', (table) => {
        table.bool('isPacked').notNullable().defaultTo(0);
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentListEntry', (table) => {
        table.dropColumn('isPacked');
    });
}
