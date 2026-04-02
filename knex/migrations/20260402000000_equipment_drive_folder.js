export function up(knex) {
    return knex.schema.alterTable('Equipment', (table) => {
        table.text('driveFolderId');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Equipment', (table) => {
        table.dropColumn('driveFolderId');
    });
}
