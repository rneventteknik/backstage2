export function up(knex) {
    return knex.schema
        .renameTable('EquipmentCategory', 'EquipmentTag')
        .renameTable('EquipmentCategoryEquipment', 'EquipmentTagEquipment')
        .alterTable('EquipmentTagEquipment', (table) => {
            table.renameColumn('equipmentCategoryId', 'equipmentTagId');
        })
        .renameTable('EquipmentCategoryEquipmentPackage', 'EquipmentTagEquipmentPackage')
        .alterTable('EquipmentTagEquipmentPackage', (table) => {
            table.renameColumn('equipmentCategoryId', 'equipmentTagId');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('EquipmentTagEquipmentPackage', (table) => {
            table.renameColumn('equipmentTagId', 'equipmentCategoryId');
        })
        .renameTable('EquipmentTagEquipmentPackage', 'EquipmentCategoryEquipmentPackage')
        .alterTable('EquipmentTagEquipment', (table) => {
            table.renameColumn('equipmentTagId', 'equipmentCategoryId');
        })
        .renameTable('EquipmentTagEquipment', 'EquipmentCategoryEquipment')
        .renameTable('EquipmentTag', 'EquipmentCategory');
}
