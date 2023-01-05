export function up(knex) {
    return knex.schema.alterTable('Setting', (table) => {
        table.dropUnique('name');
        table.renameColumn('name', 'note');
        table.text('key');
        table.unique('key');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Setting', (table) => {
        table.renameColumn('note', 'name');
        table.dropColumn('key');
        table.unique('name');
    });
}
