export function up(knex) {
    return knex.schema
        .createTable('EquipmentListHeading', (table) => {
            table.increments('id');
            table.text('name');
            table.dateTime('created');
            table.dateTime('updated');
            table.integer('equipmentListId');
            table.text('description');
            table.integer('sortIndex').notNullable().defaultTo(0);

            table.foreign('equipmentListId').references('EquipmentList.id').onDelete('CASCADE');
        })
        .alterTable('EquipmentListEntry', (table) => {
            table.integer('equipmentListHeadingId');

            table.foreign('equipmentListHeadingId').references('EquipmentListHeading.id').onDelete('CASCADE');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('EquipmentListEntry', (table) => {
            table.dropColumn('equipmentListHeadingId');
        })
        .dropTable('EquipmentListHeading');
}
