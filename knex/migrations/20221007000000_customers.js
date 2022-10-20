export function up(knex) {
    return knex.schema.createTable('Customer', (table) => {
        table.increments('id');
        table.text('name');
        table.dateTime('created');
        table.dateTime('updated');
        table.integer('pricePlan');
        table.integer('accountKind');
        table.integer('invoiceHogiaId');
        table.text('invoiceAddress');
        table.text('language');
    });
}

export function down(knex) {
    return knex.schema.dropTable('Customer');
}
