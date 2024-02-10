export function up(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.integer('numberOfDays');
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.dropColumn('numberOfDays');
    });
}
