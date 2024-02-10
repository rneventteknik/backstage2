export function up(knex) {
    return knex.schema.alterTable('EquipmentTag', (table) => {
        table.text('color');
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentTag', (table) => {
        table.dropColumn('color');
    });
}
