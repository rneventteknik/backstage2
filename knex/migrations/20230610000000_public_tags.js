export function up(knex) {
    return knex.schema.alterTable('EquipmentTag', (table) => {
        table.bool('isPublic').notNullable().defaultTo(0);
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentTag', (table) => {
        table.dropColumn('isPublic');
    });
}
