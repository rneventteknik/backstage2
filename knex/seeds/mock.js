export async function seed(knex) {
    await knex('Event').del();
    await knex('UserAuth').del();
    await knex('User').del();
    await knex('EquipmentTagEquipmentPackage').del();
    await knex('EquipmentPackageEntry').del();
    await knex('EquipmentPackage').del();
    await knex('EquipmentTagEquipment').del();
    await knex('EquipmentTag').del();
    await knex('EquipmentPrice').del();
    await knex('Equipment').del();

    // Users and authentication
    //
    const firstUserId = await knex('User')
        .insert([
            {
                name: 'Albert Medlem',
                created: '2019-01-01 15:30',
                updated: '2019-01-01 15:30',
                memberStatus: 0,
                nameTag: 'AM',
                phoneNumber: '08 000 123 45',
                slackId: null,
            },
            {
                name: 'Markus Medlem',
                created: '2019-01-01 15:30',
                updated: '2019-01-01 15:30',
                memberStatus: 3,
                nameTag: 'MM',
                phoneNumber: '072 000 00 00',
                slackId: null,
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    await knex('UserAuth').insert([
        {
            userId: firstUserId,
            username: 'albert',
            role: 0,
            hashedPassword: '$2a$10$Pl4ESEnWlzA1Gu/JCkChPudYkoLWQedJObRl1MKn.tw8EuhR36OSa', // Password is 'dmx'
        },
        {
            userId: firstUserId + 1,
            username: 'markus',
            role: 1,
            hashedPassword: '$2a$10$HW1d7h.DwzK.mAZMKUK0VuIlBl/00NPNLdyEKWdlfuM8ZBRQLOnnW', // Password is 'xlr'
        },
    ]);

    // Events
    //
    await knex('Event').insert([
        {
            name: 'Tjolahoppspexet',
            created: '2020-06-15 19:00',
            updated: '2020-06-15 19:00',
            ownerUserId: firstUserId,
            eventType: 1,
            status: 1,
            salaryStatus: 1,
            invoiceHogiaId: null,
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
            invoiceHogiaId: null,
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
            invoiceHogiaId: 1,
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

    // Equipment
    //
    const firstEquipmentPublicCategoryId = await knex('EquipmentPublicCategory')
        .insert([
            {
                name: 'Mikrofon',
                description: 'Vi har mikrofoner för alla tillfällen!',
                sortIndex: 1,
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
            },
            {
                name: 'Video',
                sortIndex: 2,
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    // This list is just here to make the assignments below easier to follow
    const equipmentPublicCategoryIds = {
        microphone: firstEquipmentPublicCategoryId,
        video: firstEquipmentPublicCategoryId + 1,
    };

    const firstEquipmentId = await knex('Equipment')
        .insert([
            {
                name: 'Stora Ljudbordet',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
                inventoryCount: 1,
                nameEN: 'Large Sound Mixer',
                description: 'Perfekt för att ljudsätta det stora eventet',
                descriptionEN: 'Perfect for large events',
                note: '',
                publiclyHidden: true,
            },
            {
                name: 'Lilla Ljudbordet',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
                inventoryCount: 1,
                nameEN: 'Small Sound Mixer',
                description: 'Passar för mindre föredrag',
                descriptionEN: 'Suitable for smaller lectures',
                note: '',
                publiclyHidden: false,
            },
            {
                name: 'Ljusbord',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
                inventoryCount: 1,
                nameEN: '12-ch lighting desk',
                description: '',
                descriptionEN: '',
                note: '',
                publiclyHidden: false,
            },
            {
                name: 'Dynamisk Mikrofon',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
                inventoryCount: 20,
                nameEN: 'Dynamic Microphone',
                description: 'T.ex.  Beta 58',
                descriptionEN: '',
                note: '',
                publiclyHidden: false,
                equipmentPublicCategoryId: equipmentPublicCategoryIds.microphone,
            },
            {
                name: 'Kondensatormikrofon',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
                inventoryCount: 10,
                nameEN: 'Condenser Microphone',
                description: '',
                descriptionEN: '',
                note: '',
                publiclyHidden: false,
                equipmentPublicCategoryId: equipmentPublicCategoryIds.microphone,
            },
            {
                name: 'Trådlös Mikrofon (WL)',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
                inventoryCount: 8,
                nameEN: 'Wireless Microphone',
                description: 'Antingen handhållen eller mygga',
                descriptionEN: 'Either handheld or lavalier microphone',
                note: '',
                publiclyHidden: true,
                equipmentPublicCategoryId: equipmentPublicCategoryIds.microphone,
            },
            {
                name: 'Projektor',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
                inventoryCount: 1,
                nameEN: 'Projector',
                description: 'HD-projektor för större event.',
                descriptionEN: 'HD-projector for larger events.',
                note: '',
                publiclyHidden: false,
                equipmentPublicCategoryId: equipmentPublicCategoryIds.video,
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    // This list is just here to make the assignments below easier to follow
    const equipmentIds = {
        largeMixer: firstEquipmentId,
        smallMixer: firstEquipmentId + 1,
        lightingDesk: firstEquipmentId + 2,
        dynamicMicrophone: firstEquipmentId + 3,
        condenserMicrophone: firstEquipmentId + 4,
        wirelessMicrophone: firstEquipmentId + 5,
        projector: firstEquipmentId + 6,
    };

    await knex('EquipmentPrice').insert([
        {
            equipmentId: equipmentIds.largeMixer,
            name: 'Standardpris',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 0,
            pricePerHour: 200,
            pricePerUnitTHS: 0,
            pricePerHourTHS: 100,
        },
        {
            equipmentId: equipmentIds.smallMixer,
            name: 'Standardpris',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 0,
            pricePerHour: 100,
            pricePerUnitTHS: 0,
            pricePerHourTHS: 500,
        },
        {
            equipmentId: equipmentIds.lightingDesk,
            name: 'Standardpris',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 0,
            pricePerHour: 100,
            pricePerUnitTHS: 0,
            pricePerHourTHS: 500,
        },
        {
            equipmentId: equipmentIds.dynamicMicrophone,
            name: 'Standardpris',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 100,
            pricePerHour: 0,
            pricePerUnitTHS: 50,
            pricePerHourTHS: 0,
        },
        {
            equipmentId: equipmentIds.condenserMicrophone,
            name: 'Standardpris',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 100,
            pricePerHour: 0,
            pricePerUnitTHS: 50,
            pricePerHourTHS: 0,
        },
        {
            equipmentId: equipmentIds.wirelessMicrophone,
            name: 'Innuti Huset',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 500,
            pricePerHour: 0,
            pricePerUnitTHS: 250,
            pricePerHourTHS: 0,
        },
        {
            equipmentId: equipmentIds.wirelessMicrophone,
            name: 'Utanför Huset',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 1000,
            pricePerHour: 0,
            pricePerUnitTHS: 500,
            pricePerHourTHS: 0,
        },
        {
            equipmentId: equipmentIds.projector,
            name: 'Innuti Huset',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 500,
            pricePerHour: 150,
            pricePerUnitTHS: 300,
            pricePerHourTHS: 100,
        },
        {
            equipmentId: equipmentIds.projector,
            name: 'Utanför Huset',
            created: '2021-07-08 00:00',
            updated: '2021-07-08 00:00',
            pricePerUnit: 2000,
            pricePerHour: 150,
            pricePerUnitTHS: 1000,
            pricePerHourTHS: 100,
        },
    ]);

    const firstEquipmentTagId = await knex('EquipmentTag')
        .insert([
            {
                name: 'Ljud',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
            },
            {
                name: 'Ljus',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
            },
            {
                name: 'Video',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
            },
            {
                name: 'Fast monterat',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
            },
            {
                name: 'Mikrofon',
                created: '2021-07-08 00:00',
                updated: '2021-07-08 00:00',
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    // This list is just here to make the assignments below easier to follow
    const equipmentTagIds = {
        sound: firstEquipmentTagId,
        lighting: firstEquipmentTagId + 1,
        video: firstEquipmentTagId + 2,
        permanentlyMounted: firstEquipmentTagId + 3,
        microphone: firstEquipmentTagId + 4,
    };

    await knex('EquipmentTagEquipment').insert([
        {
            equipmentId: equipmentIds.largeMixer,
            equipmentTagId: equipmentTagIds.sound,
        },
        {
            equipmentId: equipmentIds.largeMixer,
            equipmentTagId: equipmentTagIds.permanentlyMounted,
        },
        {
            equipmentId: equipmentIds.smallMixer,
            equipmentTagId: equipmentTagIds.sound,
        },
        {
            equipmentId: equipmentIds.lightingDesk,
            equipmentTagId: equipmentTagIds.lighting,
        },
        {
            equipmentId: equipmentIds.dynamicMicrophone,
            equipmentTagId: equipmentTagIds.sound,
        },
        {
            equipmentId: equipmentIds.dynamicMicrophone,
            equipmentTagId: equipmentTagIds.microphone,
        },
        {
            equipmentId: equipmentIds.condenserMicrophone,
            equipmentTagId: equipmentTagIds.sound,
        },
        {
            equipmentId: equipmentIds.condenserMicrophone,
            equipmentTagId: equipmentTagIds.microphone,
        },
        {
            equipmentId: equipmentIds.wirelessMicrophone,
            equipmentTagId: equipmentTagIds.sound,
        },
        {
            equipmentId: equipmentIds.wirelessMicrophone,
            equipmentTagId: equipmentTagIds.microphone,
        },
        {
            equipmentId: equipmentIds.wirelessMicrophone,
            equipmentTagId: equipmentTagIds.permanentlyMounted,
        },
        {
            equipmentId: equipmentIds.projector,
            equipmentTagId: equipmentTagIds.video,
        },
        {
            equipmentId: equipmentIds.projector,
            equipmentTagId: equipmentTagIds.permanentlyMounted,
        },
    ]);
}
