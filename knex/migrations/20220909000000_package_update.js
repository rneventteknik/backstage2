export function up(knex) {
    return knex.schema
        .alterTable('EquipmentPackage', (table) => {
            table.text('nameEN');
            table.text('description');
            table.text('descriptionEN');
            table.bool('addAsHeading').notNullable().defaultTo(0);
        })
        .alterTable('EquipmentPackageEntry', (table) => {
            table.bool('isFree').notNullable().defaultTo(0);
            table.bool('isHidden').notNullable().defaultTo(0);
        })
        .alterTable('EquipmentListEntry', (table) => {
            table.bool('isHidden').notNullable().defaultTo(0);
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('EquipmentPackage', (table) => {
            table.dropColumn('nameEN');
            table.dropColumn('description');
            table.dropColumn('descriptionEN');
            table.dropColumn('addAsHeading');
        })
        .alterTable('EquipmentPackageEntry', (table) => {
            table.dropColumn('isFree');
            table.dropColumn('isHidden');
        })
        .alterTable('EquipmentListEntry', (table) => {
            table.dropColumn('isHidden');
        });
}
