export function up(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.integer('discountPercentage').notNullable().defaultTo(0);
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.dropColumn('discountPercentage');
    });
}
