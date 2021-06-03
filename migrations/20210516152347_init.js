export function up(knex) {
    return (
        knex.schema
            // User and authentication
            //
            .createTable('User', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('role');
                table.integer('memberStatus');
                table.string('nameTag');
                table.string('phoneNumber');
                table.string('slackId');
                table.string('personalIdentityNumber');
                table.string('bankName');
                table.string('clearingNumber');
                table.string('bankAccount');
                table.text('homeAddress');
                table.string('zipCode');
                table.string('emailAddress');
            })
            .createTable('UserAuth', (table) => {
                table.integer('userId').primary();
                table.string('username').unique();
                table.string('hashedPassword');

                table.foreign('userId').references('User.id');
            })

            // Events
            //
            .createTable('Event', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('ownerUserId');
                table.integer('eventType');
                table.integer('status');
                table.integer('salaryStatus');
                table.integer('invoiceHoogiaId');
                table.text('invoiceAddress');
                table.string('invoiceTag');
                table.string('invoiceNumber');
                table.text('note');
                table.text('returnalNote');
                table.integer('pricePlan');
                table.integer('accountKind');
                table.text('location');
                table.string('contactPersonName');
                table.string('contactPersonPhone');
                table.string('contactPersonEmail');

                table.foreign('ownerUserId').references('User.id');
            })
            .createTable('CoOwner', (table) => {
                table.integer('eventId');
                table.integer('userId');

                table.primary(['eventId', 'userId']);
                table.foreign('eventId').references('Event.id');
                table.foreign('userId').references('User.id');
            })
            .createTable('TimeReport', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('eventId');
                table.integer('userId');
                table.integer('actualWorkingHours');
                table.integer('billableWorkingHours');
                table.dateTime('startDateTime');
                table.dateTime('endDateTime');
                table.integer('pricePerHour');
                table.integer('accountKind');

                table.foreign('eventId').references('Event.id');
                table.foreign('userId').references('User.id');
            })
            .createTable('TimeEstimate', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('eventId');
                table.integer('numberOfHours');
                table.integer('pricePerHour');

                table.foreign('eventId').references('Event.id');
            })
            .createTable('SalaryGroup', (table) => {
                table.increments('id');
                table.text('name');
                table.datetime('created');
                table.datetime('updated');
                table.integer('userId');

                table.foreign('userId').references('User.id');
            })
            .createTable('EventSalaryGroup', (table) => {
                table.integer('eventId');
                table.integer('salaryGroupId');

                table.primary(['eventId', 'salaryGroupId']);
                table.foreign('eventId').references('Event.id');
                table.foreign('salaryGroupId').references('SalaryGroup.id');
            })

            // Invoices
            //
            .createTable('InvoiceGroup', (table) => {
                table.increments('id');
                table.text('name');
                table.datetime('created');
                table.datetime('updated');
                table.integer('userId');

                table.foreign('userId').references('User.id');
            })
            .createTable('EventInvoiceGroup', (table) => {
                table.integer('eventId');
                table.integer('invoiceGroupId');

                table.primary(['eventId', 'invoiceGroupId']);
                table.foreign('eventId').references('Event.id');
                table.foreign('invoiceGroupId').references('InvoiceGroup.id');
            })

            // Images
            //
            .createTable('Image', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.text('imageURL');
            })

            // Equipment
            //
            .createTable('Equipment', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('equipmentPackageId');
                table.integer('inventoryCount');
                table.text('nameEN');
                table.text('description');
                table.text('descriptionEN');
                table.text('note');
                table.integer('imageId');
                table.bool('publiclyHidden');

                table.foreign('imageId').references('Image.id');
            })
            .createTable('EquipmentPrice', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('equipmentId');
                table.integer('pricePerUnit');
                table.integer('pricePerHour');
                table.integer('pricePerUnitTHS');
                table.integer('pricePerHourTHS');

                table.foreign('equipmentId').references('Equipment.id');
            })
            .createTable('EquipmentList', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('eventId');
                table.dateTime('equipmentOutdateTime');
                table.dateTime('equipmentIndateTime');
                table.dateTime('usageStartdateTime');
                table.dateTime('usageEnddateTime');

                table.foreign('eventId').references('Event.id');
            })
            .createTable('EquipmentListEntry', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('equipmentListId');
                table.integer('equipmentId');
                table.integer('numberOfUnits');
                table.integer('numberOfHours');
                table.text('nameEN');
                table.text('description');
                table.text('descriptionEN');
                table.integer('pricePerUnit');
                table.integer('pricePerHour');
                table.integer('equipmentPriceId');

                table.foreign('equipmentId').references('Equipment.id');
                table.foreign('equipmentPriceId').references('EquipmentPrice.id');
            })
            .createTable('EquipmentBrokenPeriod', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('equipmentId');
                table.dateTime('startdateTime');
                table.dateTime('enddateTime');

                table.foreign('equipmentId').references('Equipment.id');
            })

            // Equipment packages
            //
            .createTable('EquipmentPackage', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.text('note');
                table.integer('imageId');
                table.integer('estimatedHours');

                table.foreign('imageId').references('Image.id');
            })
            .createTable('EquipmentPackageEntry', (table) => {
                table.increments('id');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('equipmentId');
                table.integer('equipmentPackageId');
                table.integer('numberOfUnits');

                table.foreign('equipmentPackageId').references('EquipmentPackage.id');
                table.foreign('equipmentId').references('Equipment.id');
            })

            // Equiment categories
            //
            .createTable('EquipmentCategory', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
            })
            .createTable('EquipmentCategoryEquipment', (table) => {
                table.integer('equipmentId');
                table.integer('equipmentCategoryId');

                table.primary(['equipmentId', 'equipmentCategoryId']);
                table.foreign('equipmentId').references('Equipment.id');
                table.foreign('equipmentCategoryId').references('EquipmentCategory.id');
            })
            .createTable('EquipmentCategoryEquipmentPackage', (table) => {
                table.integer('equipmentPackageId');
                table.integer('equipmentCategoryId');

                table.primary(['equipmentPackageId', 'equipmentCategoryId']);
                table.foreign('equipmentPackageId').references('EquipmentPackage.id');
                table.foreign('equipmentCategoryId').references('EquipmentCategory.id');
            })

            // Changelogs
            //
            .createTable('EventChangelogEntry', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('eventId');

                table.foreign('eventId').references('Event.id');
            })
            .createTable('EquipmentChangelogEntry', (table) => {
                table.increments('id');
                table.text('name');
                table.dateTime('created');
                table.dateTime('updated');
                table.integer('equipmentId');

                table.foreign('equipmentId').references('Equipment.id');
            })
    );
}

export function down(knex) {
    return knex.schema
        .dropTable('EquipmentChangelogEntry')
        .dropTable('EventChangelogEntry')
        .dropTable('EquipmentCategoryEquipmentPackage')
        .dropTable('EquipmentCategoryEquipment')
        .dropTable('EquipmentCategory')
        .dropTable('EquipmentPackageEntry')
        .dropTable('EquipmentPackage')
        .dropTable('EquipmentBrokenPeriod')
        .dropTable('EquipmentListEntry')
        .dropTable('EquipmentList')
        .dropTable('EquipmentPrice')
        .dropTable('Equipment')
        .dropTable('Image')
        .dropTable('EventInvoiceGroup')
        .dropTable('InvoiceGroup')
        .dropTable('EventSalaryGroup')
        .dropTable('SalaryGroup')
        .dropTable('TimeEstimate')
        .dropTable('TimeReport')
        .dropTable('CoOwner')
        .dropTable('Event')
        .dropTable('UserAuth')
        .dropTable('User');
}
