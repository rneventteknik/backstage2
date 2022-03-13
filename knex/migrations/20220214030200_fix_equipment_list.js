export function up(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.renameColumn('equipmentOutdateTime', 'equipmentOutDatetime');
        table.renameColumn('equipmentIndateTime', 'equipmentInDatetime');
        table.renameColumn('usageStartdateTime', 'usageStartDatetime');
        table.renameColumn('usageEnddateTime', 'usageEndDatetime');
    });
}

export function down(knex) {
    return knex.schema.alterTable('EquipmentList', (table) => {
        table.renameColumn('equipmentOutDatetime', 'equipmentOutdateTime');
        table.renameColumn('equipmentInDatetime', 'equipmentIndateTime');
        table.renameColumn('usageStartDatetime', 'usageStartdateTime');
        table.renameColumn('usageEndDatetime', 'usageEnddateTime');
    });
}
