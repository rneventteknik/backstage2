export async function seed(knex) {
    await knex('Event').del();
    await knex('UserAuth').del();
    await knex('User').del();

    const firstUserId = await knex('User')
        .insert([
            {
                name: 'Albert Medlem',
                created: '2019-01-01 15:30',
                updated: '2019-01-01 15:30',
                role: 0,
                memberStatus: 0,
                nameTag: 'AM',
                phoneNumber: '08 000 123 45',
                slackId: null,
            },
            {
                name: 'Markus Medlem',
                created: '2019-01-01 15:30',
                updated: '2019-01-01 15:30',
                role: 1,
                memberStatus: 3,
                nameTag: 'MM',
                phoneNumber: '072 000 00 00',
                slackId: null,
            },
        ])
        .returning('id')
        .then((ids) => ids[0]);

    await knex('UserAuth').insert([
        {
            userId: firstUserId,
            username: 'albert',
            hashedPassword: '$2a$10$Pl4ESEnWlzA1Gu/JCkChPudYkoLWQedJObRl1MKn.tw8EuhR36OSa', // Password is 'dmx'
        },
        {
            userId: firstUserId + 1,
            username: 'markus',
            hashedPassword: '$2a$10$HW1d7h.DwzK.mAZMKUK0VuIlBl/00NPNLdyEKWdlfuM8ZBRQLOnnW', // Password is 'xlr'
        },
    ]);

    await knex('Event').insert([
        {
            name: 'Tjolahoppspexet',
            created: '2020-06-15 19:00',
            updated: '2020-06-15 19:00',
            ownerUserId: firstUserId,
            eventType: 1,
            status: 1,
            salaryStatus: 1,
            invoiceHoogiaId: null,
            invoiceAddress: 'Spexvägen 3',
            invoiceTag: null,
            invoiceNumber: '2020-068',
            note: 'Tänk på att de vill ha väldigt många basar',
            returnalNote: null,
            pricePlan: 1,
            accountKind: 1,
            location: 'Nya Matsalen',
            contactPersonName: 'Spex Kemistsson',
            contactPersonPhone: '070 000 00 00',
            contactPersonEmail: 'kemist@spex.se',
        },
        {
            name: 'DATAspexet',
            created: '2020-05-22 18:00',
            updated: '2020-05-22 18:00',
            ownerUserId: firstUserId + 1,
            eventType: 0,
            status: 4,
            salaryStatus: 0,
            invoiceHoogiaId: null,
            invoiceAddress: 'Datas backe 21',
            invoiceTag: null,
            invoiceNumber: '2020-067',
            note: 'Glöm inte extra kablar',
            returnalNote: 'En extra DMX-kabel retunerades',
            pricePlan: 1,
            accountKind: 1,
            location: 'Monateatern',
            contactPersonName: 'Vanja och Pelle',
            contactPersonPhone: '070 000 00 01',
            contactPersonEmail: 'ljus@dataspexet.se',
        },
        {
            name: 'Lunchföreläsning SPH',
            created: '2020-06-22 12:00',
            updated: '2020-06-22 12:00',
            ownerUserId: firstUserId + 1,
            eventType: 1,
            status: 1,
            salaryStatus: 0,
            invoiceHoogiaId: 1,
            invoiceAddress: 'Motellvägen 8, Stockholm',
            invoiceTag: 'SPH',
            invoiceNumber: '2020-065',
            note: null,
            returnalNote: null,
            pricePlan: 0,
            accountKind: 1,
            location: 'Nya Matsalen',
            contactPersonName: 'Veggo',
            contactPersonPhone: null,
            contactPersonEmail: 'veggo@sph.com',
        },
    ]);
}
