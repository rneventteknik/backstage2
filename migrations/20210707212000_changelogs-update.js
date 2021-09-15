export function up(knex) {
    return knex.schema
        .alterTable('EventChangelogEntry', (table) => {
            table.dateTime('timestamp');
            table.text('description');
            table.integer('userId');

            table.foreign('userId').references('User.id');
        })
        .alterTable('EquipmentChangelogEntry', (table) => {
            table.dateTime('timestamp');
            table.text('description');
            table.integer('userId');

            table.foreign('userId').references('User.id');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('EventChangelogEntry', (table) => {
            table.dropColumn('timestamp');
            table.dropColumn('description');
            table.dropColumn('userId');
        })
        .alterTable('EquipmentChangelogEntry', (table) => {
            table.dropColumn('timestamp');
            table.dropColumn('description');
            table.dropColumn('userId');
        });
}
