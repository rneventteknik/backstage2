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
    await knex('Booking').del();
    await knex('User').del();

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
            {
                name: 'Gabriel Medlem',
                created: '2022-04-11 23:20',
                updated: '2022-04-11 23:20',
                memberStatus: 2,
                nameTag: 'GM',
                phoneNumber: '123 456 78',
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
        {
            userId: firstUserId + 2,
            username: 'gabriel',
            role: 2,
            hashedPassword: '$2a$10$kaSqWDBuLRG47qRQQg6qduQck3zQCiITD6vF1EWCStOM6O5UOPN.y', // Password is 'hog'
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

    const firstEquipmentPriceId = await knex('EquipmentPrice')
        .insert([
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
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    const equipmentPriceIds = {
        largeMixer: firstEquipmentPriceId,
        smallMixer: firstEquipmentPriceId + 1,
        lightingDesk: firstEquipmentPriceId + 2,
        dynamicMicrophone: firstEquipmentPriceId + 3,
        condenserMicrophone: firstEquipmentPriceId + 4,
        wirelessMicrophone: firstEquipmentPriceId + 5,
        wirelessMicrophone2: firstEquipmentPriceId + 6,
        projector: firstEquipmentPriceId + 7,
        projector2: firstEquipmentPriceId + 8,
    };

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

    // Bookings
    //
    const firstBookingId = await knex('Booking')
        .insert([
            {
                name: 'Tjolahoppspexet',
                created: '2020-06-15 19:00',
                updated: '2020-06-15 19:00',
                ownerUserId: firstUserId,
                bookingType: 1,
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
                customerName: 'Eventföretaget Expo & Ljus AB',
            },
            {
                name: 'DATAspexet',
                created: '2020-05-22 18:00',
                updated: '2020-05-22 18:00',
                ownerUserId: firstUserId + 1,
                bookingType: 0,
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
                customerName: 'Hatasektionen',
            },
            {
                name: 'Lunchföreläsning SPH',
                created: '2020-06-22 12:00',
                updated: '2020-06-22 12:00',
                ownerUserId: firstUserId + 1,
                bookingType: 1,
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
                customerName: 'SPH',
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    await knex('TimeEstimate').insert([
        {
            name: 'Rigg - 6pers',
            created: '2020-06-15 19:00',
            updated: '2020-06-15 19:00',
            numberOfHours: 18,
            pricePerHour: 125,
            bookingId: firstBookingId,
        },
        {
            name: 'Kör - 2pers',
            created: '2020-06-15 17:00',
            updated: '2020-06-15 23:00',
            numberOfHours: 16,
            pricePerHour: 500,
            bookingId: firstBookingId,
        },
        {
            name: 'Riv - 2pers',
            created: '2020-06-15 17:00',
            updated: '2020-06-15 23:00',
            numberOfHours: 8,
            pricePerHour: 125,
            bookingId: firstBookingId,
        },
        {
            name: 'Kör',
            created: '2020-06-15 17:00',
            updated: '2020-06-15 23:00',
            numberOfHours: 2,
            pricePerHour: 125,
            bookingId: firstBookingId + 1,
        },
    ]);

    await knex('TimeReport').insert([
        {
            name: 'Rigg',
            created: '2020-06-15 17:00',
            updated: '2020-06-15 23:00',
            bookingId: firstBookingId,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            endDatetime: '2020-06-15 23:00',
            startDatetime: '2020-06-15 23:00',
            pricePerHour: 125,
            accountKind: 1,
        },
        {
            name: 'Rigg',
            created: '2020-06-15 17:00',
            updated: '2020-06-15 23:00',
            bookingId: firstBookingId,
            userId: firstUserId + 1,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            endDatetime: '2020-06-15 23:00',
            startDatetime: '2020-06-15 23:00',
            pricePerHour: 500,
            accountKind: 1,
        },
        {
            name: 'Kör',
            created: '2020-06-15 17:00',
            updated: '2020-06-15 23:00',
            bookingId: firstBookingId,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            endDatetime: '2020-06-15 23:00',
            startDatetime: '2020-06-15 23:00',
            pricePerHour: 125,
            accountKind: 1,
        },
        {
            name: 'Riv',
            created: '2020-06-15 17:00',
            updated: '2020-06-15 23:00',
            bookingId: firstBookingId,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            endDatetime: '2020-06-15 23:00',
            startDatetime: '2020-06-15 23:00',
            pricePerHour: 125,
            accountKind: 1,
        },
        {
            name: 'Kör',
            created: '2020-06-15 17:00',
            updated: '2020-06-15 23:00',
            bookingId: firstBookingId + 1,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            endDatetime: '2020-06-15 23:00',
            startDatetime: '2020-06-15 23:00',
            pricePerHour: 125,
            accountKind: 1,
        },
    ]);

    const firstEquipmentListId = await knex('EquipmentList')
        .insert([
            {
                name: 'Ljud',
                created: '2022-04-11T21:32:29.303Z',
                updated: '2022-04-11T21:33:10.818Z',
                equipmentOutDatetime: '2022-04-30T22:00:00.000Z',
                equipmentInDatetime: '2022-05-02T22:00:00.000Z',
                usageStartDatetime: '2022-04-30T22:00:00.000Z',
                usageEndDatetime: '2022-05-02T22:00:00.000Z',
                bookingId: firstBookingId,
            },
            {
                name: 'Video',
                created: '2022-04-11T21:32:29.303Z',
                updated: '2022-04-11T21:33:10.818Z',
                equipmentOutDatetime: '2022-04-30T22:00:00.000Z',
                equipmentInDatetime: '2022-05-02T22:00:00.000Z',
                usageStartDatetime: '2022-04-30T22:00:00.000Z',
                usageEndDatetime: '2022-05-02T22:00:00.000Z',
                bookingId: firstBookingId,
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    await knex('EquipmentListEntry').insert([
        {
            name: 'Ljudbord',
            created: '2022-04-11T21:36:42.934Z',
            updated: '2022-04-11T21:36:42.934Z',
            equipmentId: equipmentIds.largeMixer,
            nameEN: 'Mixer',
            description: 'Ljudbord för utljud',
            descriptionEN: '',
            numberOfUnits: 1,
            numberOfHours: 10,
            pricePerUnit: 0,
            pricePerHour: 200,
            equipmentPriceId: equipmentPriceIds.largeMixer,
            equipmentListId: firstEquipmentListId,
            discount: 400,
        },
        {
            name: 'Ljudbord litet',
            created: '2022-04-11T21:36:42.934Z',
            updated: '2022-04-11T21:36:42.934Z',
            equipmentId: equipmentIds.smallMixer,
            nameEN: 'Mixer small',
            description: 'Ljudbord för monitor',
            descriptionEN: '',
            numberOfUnits: 2,
            numberOfHours: 10,
            pricePerUnit: 0,
            pricePerHour: 200,
            equipmentPriceId: equipmentPriceIds.smallMixer,
            equipmentListId: firstEquipmentListId,
            discount: 0,
        },
        {
            name: 'Projektor',
            created: '2022-04-11T21:36:42.934Z',
            updated: '2022-04-11T21:36:42.934Z',
            equipmentId: equipmentIds.projector,
            nameEN: 'Projector',
            description: '',
            descriptionEN: '',
            numberOfUnits: 1,
            numberOfHours: 10,
            pricePerUnit: 1000,
            pricePerHour: 100,
            equipmentPriceId: equipmentPriceIds.projector2,
            equipmentListId: firstEquipmentListId + 1,
            discount: 0,
        },
    ]);
}
