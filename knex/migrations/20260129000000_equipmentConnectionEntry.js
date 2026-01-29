export function up(knex) {
    return knex.schema.createTable('ConnectedEquipmentEntry', (table) => {
        table.increments('id');
        table.dateTime('created');
        table.dateTime('updated');
        table.integer('parentEquipmentId');
        table.integer('connectedEquipmentId');
        table.integer('sortIndex').notNullable().defaultTo(0);
        table.bool('isFree').notNullable().defaultTo(0);
        table.bool('isHidden').notNullable().defaultTo(0);
        table.integer('equipmentPriceId');

        table.foreign('parentEquipmentId').references('Equipment.id');
        table.foreign('connectedEquipmentId').references('Equipment.id');
    });
}

export function down(knex) {
    return knex.schema.dropTable('ConnectedEquipmentEntry');
}
