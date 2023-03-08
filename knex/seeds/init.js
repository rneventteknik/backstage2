export async function seed(knex) {
    await knex('UserAuth').del();
    await knex('EquipmentTagEquipmentPackage').del();
    await knex('EquipmentPackageEntry').del();
    await knex('EquipmentPackage').del();
    await knex('EquipmentTagEquipment').del();
    await knex('EquipmentTag').del();
    await knex('TimeEstimate').del();
    await knex('TimeReport').del();
    await knex('EquipmentListEntry').del();
    await knex('EquipmentList').del();
    await knex('EquipmentPrice').del();
    await knex('Equipment').del();
    await knex('EquipmentPublicCategory').del();
    await knex('EquipmentLocation').del();
    await knex('BookingChangelogEntry').del();
    await knex('EquipmentChangelogEntry').del();
    await knex('Booking').del();
    await knex('User').del();
    await knex('Setting').del();

    // Users and authentication
    //
    const firstUserId = await knex('User')
        .insert([
            {
                name: 'Admin Chef',
                created: '2022-12-12T12:12:12',
                updated: '2022-12-12T12:12:12',
                memberStatus: 0,
                nameTag: '',
                phoneNumber: '',
                slackId: null,
                personalIdentityNumber: '',
                bankName: '',
                clearingNumber: '',
                bankAccount: '',
                homeAddress: '',
                zipCode: '',
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    await knex('UserAuth').insert([
        {
            userId: firstUserId,
            username: 'admin',
            role: 0, // Chef
            hashedPassword: '$2a$10$Pl4ESEnWlzA1Gu/JCkChPudYkoLWQedJObRl1MKn.tw8EuhR36OSa', // Password is 'dmx'
        },
    ]);
}
