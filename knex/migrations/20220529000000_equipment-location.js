export function up(knex) {
    return knex.schema
        .createTable('EquipmentLocation', (table) => {
            table.increments('id');
            table.text('name');
            table.text('description');
            table.integer('sortIndex');
            table.dateTime('created');
            table.dateTime('updated');
        })
        .alterTable('Equipment', (table) => {
            table.integer('equipmentLocationId');
            table.foreign('equipmentLocationId').references('EquipmentLocation.id');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('Equipment', (table) => {
            table.dropColumn('equipmentLocationId');
        })
        .dropTable('EquipmentLocation');
}
