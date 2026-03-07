export function up(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.bool('isHidden').notNullable().defaultTo(0);
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.dropColumn('isHidden');
    });
}
