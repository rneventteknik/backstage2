export function up(knex) {
    return knex.schema
        .createTable('EquipmentPublicCategory', (table) => {
            table.increments('id');
            table.text('name');
            table.text('description');
            table.integer('sortIndex');
            table.dateTime('created');
            table.dateTime('updated');
        })
        .alterTable('Equipment', (table) => {
            table.integer('equipmentPublicCategoryId');
            table.foreign('equipmentPublicCategoryId').references('EquipmentPublicCategory.id');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('Equipment', (table) => {
            table.dropColumn('equipmentPublicCategoryId');
        })
        .dropTable('EquipmentPublicCategory');
}
