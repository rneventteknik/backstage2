export function up (knex) {
    return knex.schema.alterTable('BookingChangelogEntry', function (table) {
        table.decimal('equipmentPrice', 10, 2).nullable();
        table.decimal('timeEstimatePrice', 10, 2).nullable();
        table.decimal('timeReportsPrice', 10, 2).nullable();
        table.decimal('fixedPrice', 10, 2).nullable();
    });
};

export function down (knex) {
    return knex.schema.alterTable('BookingChangelogEntry', function (table) {
        table.dropColumn('equipmentPrice');
        table.dropColumn('timeEstimatePrice');
        table.dropColumn('timeReportsPrice');
        table.dropColumn('fixedPrice');
    });
};
