export function up(knex) {
    return knex.schema
        .alterTable('EquipmentList', (table) => {
            table.integer('sortIndex').notNullable().defaultTo(0);
        })
        .alterTable('EquipmentListEntry', (table) => {
            table.integer('sortIndex').notNullable().defaultTo(0);
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('EquipmentList', (table) => {
            table.dropColumn('sortIndex');
        })
        .alterTable('EquipmentListEntry', (table) => {
            table.dropColumn('sortIndex');
        });
}
