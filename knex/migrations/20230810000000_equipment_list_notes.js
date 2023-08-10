export function up(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.integer('notes');
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.dropColumn('notes');
    });
}
