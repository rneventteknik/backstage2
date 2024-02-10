export function up(knex) {
    return knex.schema
        .alterTable('UserAuth', (table) => {
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('CASCADE');
        })
        .alterTable('Booking', (table) => {
            table.dropForeign('ownerUserId', 'event_owneruserid_foreign');
            table.foreign('ownerUserId').references('User.id').onDelete('SET NULL');
        })
        .alterTable('TimeReport', (table) => {
            table.dropForeign('bookingId', 'timereport_eventid_foreign');
            table.foreign('bookingId').references('Booking.id').onDelete('CASCADE');
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('SET NULL');
        })
        .alterTable('TimeEstimate', (table) => {
            table.dropForeign('bookingId', 'timeestimate_eventid_foreign');
            table.foreign('bookingId').references('Booking.id').onDelete('CASCADE');
        })
        .alterTable('SalaryGroup', (table) => {
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('SET NULL');
        })
        .alterTable('BookingSalaryGroup', (table) => {
            table.dropForeign('bookingId', 'eventsalarygroup_eventid_foreign');
            table.foreign('bookingId').references('Booking.id').onDelete('CASCADE');
            table.dropForeign('salaryGroupId', 'eventsalarygroup_salarygroupid_foreign');
            table.foreign('salaryGroupId').references('SalaryGroup.id').onDelete('CASCADE');
        })
        .alterTable('InvoiceGroup', (table) => {
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('SET NULL');
        })
        .alterTable('BookingInvoiceGroup', (table) => {
            table.dropForeign('bookingId', 'eventinvoicegroup_eventid_foreign');
            table.foreign('bookingId').references('Booking.id').onDelete('CASCADE');
            table.dropForeign('invoiceGroupId', 'eventinvoicegroup_invoicegroupid_foreign');
            table.foreign('invoiceGroupId').references('InvoiceGroup.id').onDelete('CASCADE');
        })
        .alterTable('EquipmentPrice', (table) => {
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('CASCADE');
        })
        .alterTable('EquipmentList', (table) => {
            table.dropForeign('bookingId', 'equipmentlist_eventid_foreign');
            table.foreign('bookingId').references('Booking.id').onDelete('CASCADE');
        })
        .alterTable('EquipmentListEntry', (table) => {
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('SET NULL');
            table.dropForeign('equipmentPriceId');
            table.foreign('equipmentPriceId').references('EquipmentPrice.id').onDelete('SET NULL');
        })
        .alterTable('EquipmentPackageEntry', (table) => {
            table.dropForeign('equipmentPackageId');
            table.foreign('equipmentPackageId').references('EquipmentPackage.id').onDelete('CASCADE');
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('CASCADE');
        })
        .alterTable('EquipmentTagEquipment', (table) => {
            table.dropForeign('equipmentId', 'equipmentcategoryequipment_equipmentid_foreign');
            table.foreign('equipmentId').references('Equipment.id').onDelete('CASCADE');
            table.dropForeign('equipmentTagId', 'equipmentcategoryequipment_equipmentcategoryid_foreign');
            table.foreign('equipmentTagId').references('EquipmentTag.id').onDelete('CASCADE');
        })
        .alterTable('EquipmentTagEquipmentPackage', (table) => {
            table.dropForeign('equipmentPackageId', 'equipmentcategoryequipmentpackage_equipmentpackageid_foreign');
            table.foreign('equipmentPackageId').references('EquipmentPackage.id').onDelete('CASCADE');
            table.dropForeign('equipmentTagId', 'equipmentcategoryequipmentpackage_equipmentcategoryid_foreign');
            table.foreign('equipmentTagId').references('EquipmentTag.id').onDelete('CASCADE');
        })
        .alterTable('BookingChangelogEntry', (table) => {
            table.dropForeign('bookingId', 'eventchangelogentry_eventid_foreign');
            table.foreign('bookingId').references('Booking.id').onDelete('CASCADE');
            table.dropForeign('userId', 'eventchangelogentry_userid_foreign');
            table.foreign('userId').references('User.id').onDelete('SET NULL');
        })
        .alterTable('EquipmentChangelogEntry', (table) => {
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('CASCADE');
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('SET NULL');
        })
        .alterTable('Equipment', (table) => {
            table.dropForeign('equipmentPublicCategoryId');
            table.foreign('equipmentPublicCategoryId').references('EquipmentPublicCategory.id').onDelete('SET NULL');
            table.dropForeign('equipmentLocationId');
            table.foreign('equipmentLocationId').references('EquipmentLocation.id').onDelete('SET NULL');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('UserAuth', (table) => {
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('NO ACTION');
        })
        .alterTable('Booking', (table) => {
            table.dropForeign('ownerUserId');
            table.foreign('ownerUserId').references('User.id').onDelete('NO ACTION');
        })
        .alterTable('TimeReport', (table) => {
            table.dropForeign('bookingId');
            table.foreign('bookingId').references('Booking.id').onDelete('NO ACTION');
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('NO ACTION');
        })
        .alterTable('TimeEstimate', (table) => {
            table.dropForeign('bookingId');
            table.foreign('bookingId').references('Booking.id').onDelete('NO ACTION');
        })
        .alterTable('SalaryGroup', (table) => {
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('NO ACTION');
        })
        .alterTable('BookingSalaryGroup', (table) => {
            table.dropForeign('bookingId');
            table.foreign('bookingId').references('Booking.id').onDelete('NO ACTION');
            table.dropForeign('salaryGroupId');
            table.foreign('salaryGroupId').references('SalaryGroup.id').onDelete('NO ACTION');
        })
        .alterTable('InvoiceGroup', (table) => {
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('NO ACTION');
        })
        .alterTable('BookingInvoiceGroup', (table) => {
            table.dropForeign('bookingId');
            table.foreign('bookingId').references('Booking.id').onDelete('NO ACTION');
            table.dropForeign('invoiceGroupId');
            table.foreign('invoiceGroupId').references('InvoiceGroup.id').onDelete('NO ACTION');
        })
        .alterTable('EquipmentPrice', (table) => {
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('NO ACTION');
        })
        .alterTable('EquipmentList', (table) => {
            table.dropForeign('bookingId');
            table.foreign('bookingId').references('Booking.id').onDelete('NO ACTION');
        })
        .alterTable('EquipmentListEntry', (table) => {
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('NO ACTION');
            table.dropForeign('equipmentPriceId');
            table.foreign('equipmentPriceId').references('EquipmentPrice.id').onDelete('NO ACTION');
        })
        .alterTable('EquipmentPackageEntry', (table) => {
            table.dropForeign('equipmentPackageId');
            table.foreign('equipmentPackageId').references('EquipmentPackage.id').onDelete('NO ACTION');
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('NO ACTION');
        })
        .alterTable('EquipmentTagEquipment', (table) => {
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('NO ACTION');
            table.dropForeign('equipmentTagId');
            table.foreign('equipmentTagId').references('EquipmentTag.id').onDelete('NO ACTION');
        })
        .alterTable('EquipmentTagEquipmentPackage', (table) => {
            table.dropForeign('equipmentPackageId');
            table.foreign('equipmentPackageId').references('EquipmentPackage.id').onDelete('NO ACTION');
            table.dropForeign('equipmentTagId');
            table.foreign('equipmentTagId').references('EquipmentTag.id').onDelete('NO ACTION');
        })
        .alterTable('BookingChangelogEntry', (table) => {
            table.dropForeign('bookingId');
            table.foreign('bookingId').references('Booking.id').onDelete('NO ACTION');
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('NO ACTION');
        })
        .alterTable('EquipmentChangelogEntry', (table) => {
            table.dropForeign('equipmentId');
            table.foreign('equipmentId').references('Equipment.id').onDelete('NO ACTION');
            table.dropForeign('userId');
            table.foreign('userId').references('User.id').onDelete('NO ACTION');
        })
        .alterTable('Equipment', (table) => {
            table.dropForeign('equipmentPublicCategoryId');
            table.foreign('equipmentPublicCategoryId').references('EquipmentPublicCategory.id').onDelete('NO ACTION');
            table.dropForeign('equipmentLocationId');
            table.foreign('equipmentLocationId').references('EquipmentLocation.id').onDelete('NO ACTION');
        });
}
