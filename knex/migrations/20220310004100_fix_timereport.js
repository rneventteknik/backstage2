export function up(knex) {
    return knex.schema.alterTable('TimeReport', (table) => {
        table.renameColumn('startDateTime', 'startDatetime');
        table.renameColumn('endDateTime', 'endDatetime');
    });
}

export function down(knex) {
    return knex.schema.alterTable('TimeReport', (table) => {
        table.renameColumn('startDatetime', 'startDateTime');
        table.renameColumn('endDatetime', 'endDateTime');
    });
}
