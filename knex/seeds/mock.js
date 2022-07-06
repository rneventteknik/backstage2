Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

Date.prototype.addHours = function (hours) {
    var date = new Date(this.valueOf());
    date.setHours(date.getHours() + hours);
    return date;
};

const getVarianceDateString = function (maxDayVariance) {
    var date = new Date();
    date.setMinutes(date.getMinutes() + Math.random() * maxDayVariance * 24 * 60);
    return date.toISOString();
};

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

    // Users and authentication
    //
    const firstUserId = await knex('User')
        .insert([
            {
                name: 'Albert Medlem',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                memberStatus: 0,
                nameTag: 'AM',
                phoneNumber: '08 000 123 45',
                slackId: null,
            },
            {
                name: 'Markus Medlem',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                memberStatus: 3,
                nameTag: 'MM',
                phoneNumber: '072 000 00 00',
                slackId: null,
            },
            {
                name: 'Gabriel Medlem',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
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
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
            {
                name: 'Video',
                sortIndex: 2,
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    // This list is just here to make the assignments below easier to follow
    const equipmentPublicCategoryIds = {
        microphone: firstEquipmentPublicCategoryId,
        video: firstEquipmentPublicCategoryId + 1,
    };

    const firstEquipmentLocationId = await knex('EquipmentLocation')
        .insert([
            {
                name: 'Plan -1',
                sortIndex: 1,
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
            {
                name: 'Plan 2',
                sortIndex: 2,
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
            {
                name: 'Plan 3',
                sortIndex: 3,
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    // This list is just here to make the assignments below easier to follow
    const equipmentLocationIds = {
        basement: firstEquipmentLocationId,
        floor2: firstEquipmentLocationId + 1,
        floor3: firstEquipmentLocationId + 2,
    };

    const firstEquipmentId = await knex('Equipment')
        .insert([
            {
                name: 'Stora Ljudbordet',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                inventoryCount: 1,
                nameEN: 'Large Sound Mixer',
                description: 'Perfekt för att ljudsätta det stora eventet',
                descriptionEN: 'Perfect for large events',
                note: '',
                publiclyHidden: true,
                equipmentLocationId: equipmentLocationIds.basement,
            },
            {
                name: 'Lilla Ljudbordet',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                inventoryCount: 1,
                nameEN: 'Small Sound Mixer',
                description: 'Passar för mindre föredrag',
                descriptionEN: 'Suitable for smaller lectures',
                note: '',
                publiclyHidden: false,
                equipmentLocationId: equipmentLocationIds.basement,
            },
            {
                name: 'Ljusbord',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                inventoryCount: 1,
                nameEN: '12-ch lighting desk',
                description: '',
                descriptionEN: '',
                note: '',
                publiclyHidden: false,
            },
            {
                name: 'Dynamisk Mikrofon',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                inventoryCount: 20,
                nameEN: 'Dynamic Microphone',
                description: 'T.ex.  Beta 58',
                descriptionEN: '',
                note: '',
                publiclyHidden: false,
                equipmentPublicCategoryId: equipmentPublicCategoryIds.microphone,
                equipmentLocationId: equipmentLocationIds.floor3,
            },
            {
                name: 'Kondensatormikrofon',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                inventoryCount: 10,
                nameEN: 'Condenser Microphone',
                description: '',
                descriptionEN: '',
                note: '',
                publiclyHidden: false,
                equipmentPublicCategoryId: equipmentPublicCategoryIds.microphone,
                equipmentLocationId: equipmentLocationIds.floor3,
            },
            {
                name: 'Trådlös Mikrofon (WL)',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                inventoryCount: 8,
                nameEN: 'Wireless Microphone',
                description: 'Antingen handhållen eller mygga',
                descriptionEN: 'Either handheld or lavalier microphone',
                note: '',
                publiclyHidden: true,
                equipmentPublicCategoryId: equipmentPublicCategoryIds.microphone,
                equipmentLocationId: equipmentLocationIds.floor3,
            },
            {
                name: 'Projektor',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                inventoryCount: 1,
                nameEN: 'Projector',
                description: 'HD-projektor för större event.',
                descriptionEN: 'HD-projector for larger events.',
                note: '',
                publiclyHidden: false,
                equipmentPublicCategoryId: equipmentPublicCategoryIds.video,
                equipmentLocationId: equipmentLocationIds.floor2,
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
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                pricePerUnit: 0,
                pricePerHour: 200,
                pricePerUnitTHS: 0,
                pricePerHourTHS: 100,
            },
            {
                equipmentId: equipmentIds.smallMixer,
                name: 'Standardpris',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                pricePerUnit: 0,
                pricePerHour: 100,
                pricePerUnitTHS: 0,
                pricePerHourTHS: 500,
            },
            {
                equipmentId: equipmentIds.lightingDesk,
                name: 'Standardpris',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                pricePerUnit: 0,
                pricePerHour: 100,
                pricePerUnitTHS: 0,
                pricePerHourTHS: 500,
            },
            {
                equipmentId: equipmentIds.dynamicMicrophone,
                name: 'Standardpris',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                pricePerUnit: 100,
                pricePerHour: 0,
                pricePerUnitTHS: 50,
                pricePerHourTHS: 0,
            },
            {
                equipmentId: equipmentIds.condenserMicrophone,
                name: 'Standardpris',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                pricePerUnit: 100,
                pricePerHour: 0,
                pricePerUnitTHS: 50,
                pricePerHourTHS: 0,
            },
            {
                equipmentId: equipmentIds.wirelessMicrophone,
                name: 'Innuti Huset',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                pricePerUnit: 500,
                pricePerHour: 0,
                pricePerUnitTHS: 250,
                pricePerHourTHS: 0,
            },
            {
                equipmentId: equipmentIds.wirelessMicrophone,
                name: 'Utanför Huset',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                pricePerUnit: 1000,
                pricePerHour: 0,
                pricePerUnitTHS: 500,
                pricePerHourTHS: 0,
            },
            {
                equipmentId: equipmentIds.projector,
                name: 'Innuti Huset',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                pricePerUnit: 500,
                pricePerHour: 150,
                pricePerUnitTHS: 300,
                pricePerHourTHS: 100,
            },
            {
                equipmentId: equipmentIds.projector,
                name: 'Utanför Huset',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
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
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
            {
                name: 'Ljus',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
            {
                name: 'Video',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
            {
                name: 'Fast monterat',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
            },
            {
                name: 'Mikrofon',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
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
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId,
                bookingType: 1,
                status: 0,
                salaryStatus: 1,
                paymentStatus: 0,
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
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId + 1,
                bookingType: 0,
                status: 1,
                salaryStatus: 0,
                paymentStatus: 1,
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
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId + 1,
                bookingType: 1,
                status: 2,
                salaryStatus: 0,
                paymentStatus: 2,
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
            {
                name: 'Hoppborg i Nya',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId + 2,
                bookingType: 1,
                status: 3,
                salaryStatus: 0,
                paymentStatus: 0,
                invoiceHogiaId: 1,
                invoiceAddress: null,
                invoiceTag: null,
                invoiceNumber: null,
                note: null,
                returnalNote: null,
                pricePlan: 0,
                accountKind: 1,
                location: 'Nya Matsalen',
                contactPersonName: null,
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'Hoppborgsnämnden',
            },
            {
                name: 'Ut kastet',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId + 2,
                bookingType: 1,
                status: 0,
                salaryStatus: 0,
                paymentStatus: 0,
                invoiceHogiaId: 1,
                invoiceAddress: null,
                invoiceTag: null,
                invoiceNumber: null,
                note: null,
                returnalNote: null,
                pricePlan: 0,
                accountKind: 1,
                location: 'Vattenfallkullen',
                contactPersonName: null,
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'Sågverket AB',
            },
            {
                name: 'Konferens',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId,
                bookingType: 1,
                status: 1,
                salaryStatus: 0,
                paymentStatus: 0,
                invoiceHogiaId: 1,
                invoiceAddress: null,
                invoiceTag: null,
                invoiceNumber: null,
                note: null,
                returnalNote: null,
                pricePlan: 0,
                accountKind: 0,
                location: 'Nya Matsalen',
                contactPersonName: 'Nils Nilsson',
                contactPersonPhone: null,
                contactPersonEmail: 'Nils@nils.nils',
                customerName: 'Trädkramarna AB',
            },
            {
                name: 'Lunchföreläsning i Gamla',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId,
                bookingType: 0,
                status: 1,
                salaryStatus: 0,
                paymentStatus: 0,
                invoiceHogiaId: 1,
                invoiceAddress: null,
                invoiceTag: null,
                invoiceNumber: null,
                note: null,
                returnalNote: null,
                pricePlan: 1,
                accountKind: 0,
                location: 'Gamla',
                contactPersonName: null,
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'Någon text',
            },
            {
                name: 'Det stora skuttet',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId,
                bookingType: 0,
                status: 1,
                salaryStatus: 0,
                paymentStatus: 0,
                invoiceHogiaId: 1,
                invoiceAddress: null,
                invoiceTag: null,
                invoiceNumber: null,
                note: null,
                returnalNote: null,
                pricePlan: 1,
                accountKind: 0,
                location: 'Hela campus',
                contactPersonName: 'Fest Festare',
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'Nullsträng',
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    await knex('TimeEstimate').insert([
        // Tjolahoppspexet
        {
            name: 'Rigg - 6pers',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 18,
            pricePerHour: 125,
            bookingId: firstBookingId,
            sortIndex: 10,
        },
        {
            name: 'Kör - 2pers',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 16,
            pricePerHour: 500,
            bookingId: firstBookingId,
            sortIndex: 20,
        },
        {
            name: 'Riv - 2pers',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 8,
            pricePerHour: 125,
            bookingId: firstBookingId,
            sortIndex: 30,
        },

        // DATAspexet
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 2,
            pricePerHour: 125,
            bookingId: firstBookingId + 1,
            sortIndex: 10,
        },

        // Ut kastet
        {
            name: 'Rigga',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 20,
            pricePerHour: 500,
            bookingId: firstBookingId + 4,
        },
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 2,
            pricePerHour: 125,
            bookingId: firstBookingId + 4,
        },

        // Konferens - Trädkramarna AB
        {
            name: 'Rigga',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 4,
            pricePerHour: 1000,
            bookingId: firstBookingId + 5,
        },
        {
            name: 'Köra',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 100,
            pricePerHour: 250,
            bookingId: firstBookingId + 5,
        },
        {
            name: 'Redigera video',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 8,
            pricePerHour: 125,
            bookingId: firstBookingId + 5,
        },
    ]);

    await knex('TimeReport').insert([
        // Tjolahoppspexet
        {
            name: 'Rigg',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: firstBookingId,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            startDatetime: '2020-06-15 23:00',
            endDatetime: '2020-06-15 23:00',
            pricePerHour: 125,
            accountKind: 1,
            sortIndex: 10,
        },
        {
            name: 'Rigg',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: firstBookingId,
            userId: firstUserId + 1,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            startDatetime: '2020-06-15 23:00',
            endDatetime: '2020-06-15 23:00',
            pricePerHour: 500,
            accountKind: 1,
            sortIndex: 20,
        },
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: firstBookingId,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            startDatetime: '2020-06-15 23:00',
            endDatetime: '2020-06-15 23:00',
            pricePerHour: 125,
            accountKind: 1,
            sortIndex: 30,
        },
        {
            name: 'Riv',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: firstBookingId,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            startDatetime: '2020-06-15 23:00',
            endDatetime: '2020-06-15 23:00',
            pricePerHour: 125,
            accountKind: 1,
            sortIndex: 40,
        },

        // DATAspexet
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: firstBookingId + 1,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            startDatetime: '2020-06-15 23:00',
            endDatetime: '2020-06-15 23:00',
            pricePerHour: 125,
            accountKind: 1,
            sortIndex: 10,
        },

        // Lunchföreläsning SPH
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: firstBookingId + 2,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            startDatetime: new Date().addHours(-1).toISOString(),
            endDatetime: new Date().addHours(1).toISOString(),
            pricePerHour: 250,
            accountKind: 1,
        },
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: firstBookingId + 2,
            userId: firstUserId + 1,
            actualWorkingHours: 2,
            billableWorkingHours: 2,
            startDatetime: new Date().addHours(-1).toISOString(),
            endDatetime: new Date().addHours(1).toISOString(),
            pricePerHour: 250,
            accountKind: 1,
        },
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: firstBookingId + 2,
            userId: firstUserId + 2,
            actualWorkingHours: 2,
            billableWorkingHours: 2,
            startDatetime: new Date().addHours(-1).toISOString(),
            endDatetime: new Date().addHours(1).toISOString(),
            pricePerHour: 250,
            accountKind: 1,
        },
    ]);

    const firstEquipmentListId = await knex('EquipmentList')
        .insert([
            // Tjolahoppspexet
            {
                name: 'Ljud',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(5).toISOString(),
                equipmentInDatetime: new Date().addDays(6).toISOString(),
                usageStartDatetime: new Date().addDays(5).toISOString(),
                usageEndDatetime: new Date().addDays(6).toISOString(),
                bookingId: firstBookingId,
            },
            {
                name: 'Video',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(1).toISOString(),
                equipmentInDatetime: new Date().addDays(8).toISOString(),
                usageStartDatetime: new Date().addDays(6).toISOString(),
                usageEndDatetime: new Date().addDays(7).toISOString(),
                bookingId: firstBookingId,
            },

            // DATAspexet
            {
                name: 'Utrustning',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(10).toISOString(),
                equipmentInDatetime: new Date().addDays(20).toISOString(),
                usageStartDatetime: new Date().addDays(15).toISOString(),
                usageEndDatetime: new Date().addDays(18).toISOString(),
                bookingId: firstBookingId + 1,
                rentalStatus: null,
            },

            // Hoppborg i Nya
            {
                name: 'Krasch',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(10).toISOString(),
                equipmentInDatetime: new Date().addDays(20).toISOString(),
                usageStartDatetime: new Date().addDays(15).toISOString(),
                usageEndDatetime: new Date().addDays(18).toISOString(),
                bookingId: firstBookingId + 3,
                rentalStatus: null,
            },

            // Ut kastet
            {
                name: 'Kasta ut saker',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(100).toISOString(),
                equipmentInDatetime: new Date().addDays(108).toISOString(),
                usageStartDatetime: new Date().addDays(106).toISOString(),
                usageEndDatetime: new Date().addDays(107).toISOString(),
                bookingId: firstBookingId + 4,
            },

            //Konferens - Trädkramarna AB
            {
                name: 'Ljud',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(30).toISOString(),
                equipmentInDatetime: new Date().addDays(32).toISOString(),
                usageStartDatetime: new Date().addDays(30).toISOString(),
                usageEndDatetime: new Date().addDays(32).toISOString(),
                bookingId: firstBookingId + 5,
            },
            {
                name: 'Video',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(30).toISOString(),
                equipmentInDatetime: new Date().addDays(32).toISOString(),
                usageStartDatetime: new Date().addDays(30).toISOString(),
                usageEndDatetime: new Date().addDays(32).toISOString(),
                bookingId: firstBookingId + 5,
                rentalStatus: null,
            },

            //Lunchföreläsning i Gamla
            {
                name: 'Ljud',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(-32).toISOString(),
                equipmentInDatetime: new Date().addDays(-30).toISOString(),
                usageStartDatetime: new Date().addDays(-32).toISOString(),
                usageEndDatetime: new Date().addDays(-30).toISOString(),
                bookingId: firstBookingId + 6,
                rentalStatus: 1,
            },

            // Det stora skuttet
            {
                name: 'Utrustning',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().addDays(-3).toISOString(),
                equipmentInDatetime: new Date().addDays(3).toISOString(),
                usageStartDatetime: new Date().addDays(-1).toISOString(),
                usageEndDatetime: new Date().addDays(1).toISOString(),
                bookingId: firstBookingId + 7,
                rentalStatus: 0,
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    await knex('EquipmentListEntry').insert([
        // Tjolahoppspexet
        {
            name: 'Ljudbord',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
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
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
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
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
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

        // DATAspexet
        {
            name: 'Ljudbord litet',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.smallMixer,
            nameEN: 'Mixer small',
            description: 'Ljudbord för monitor',
            descriptionEN: '',
            numberOfUnits: 2,
            numberOfHours: 10,
            pricePerUnit: 0,
            pricePerHour: 200,
            equipmentPriceId: equipmentPriceIds.smallMixer,
            equipmentListId: firstEquipmentListId + 2,
        },

        // Hoppborg i Nya
        {
            name: 'Trådlös Mikrofon (WL)',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.wirelessMicrophone,
            nameEN: 'Wireless Microphone',
            description: 'Antingen handhållen eller mygga',
            descriptionEN: 'Either handheld or lavalier microphone',
            numberOfUnits: 1,
            numberOfHours: 0,
            pricePerUnit: 100,
            pricePerHour: 0,
            equipmentPriceId: equipmentPriceIds.wirelessMicrophone,
            equipmentListId: firstEquipmentListId + 3,
            discount: 400,
        },

        // Hoppborg i Nya
        {
            name: 'Trådlös Mikrofon (WL)',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.wirelessMicrophone,
            nameEN: 'Wireless Microphone',
            description: 'Antingen handhållen eller mygga',
            descriptionEN: 'Either handheld or lavalier microphone',
            numberOfUnits: 8,
            numberOfHours: 0,
            pricePerUnit: 100,
            pricePerHour: 0,
            equipmentPriceId: equipmentPriceIds.wirelessMicrophone,
            equipmentListId: firstEquipmentListId + 4,
            discount: 0,
        },

        //Konferens - Trädkramarna AB
        {
            name: 'Trådlös Mikrofon (WL)',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.wirelessMicrophone,
            nameEN: 'Wireless Microphone',
            description: 'Antingen handhållen eller mygga',
            descriptionEN: 'Either handheld or lavalier microphone',
            numberOfUnits: 8,
            numberOfHours: 0,
            pricePerUnit: 250,
            pricePerHour: 0,
            equipmentPriceId: equipmentPriceIds.wirelessMicrophone,
            equipmentListId: firstEquipmentListId + 5,
            discount: 0,
        },

        // Ut kastet
        {
            name: 'Projektor',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.projector,
            nameEN: 'Projector',
            description: '',
            descriptionEN: '',
            numberOfUnits: 1,
            numberOfHours: 30,
            pricePerUnit: 500,
            pricePerHour: 150,
            equipmentPriceId: equipmentPriceIds.projector2,
            equipmentListId: firstEquipmentListId + 6,
            discount: 0,
        },

        //Lunchföreläsning i Gamla
        {
            name: 'Trådlös Mikrofon (WL)',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.wirelessMicrophone,
            nameEN: 'Wireless Microphone',
            description: 'Antingen handhållen eller mygga',
            descriptionEN: 'Either handheld or lavalier microphone',
            numberOfUnits: 1,
            numberOfHours: 0,
            pricePerUnit: 125,
            pricePerHour: 0,
            equipmentPriceId: equipmentPriceIds.wirelessMicrophone,
            equipmentListId: firstEquipmentListId + 7,
            discount: 0,
        },

        // Det stora skuttet
        {
            name: 'Ljudbord',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.largeMixer,
            nameEN: 'Mixer',
            description: 'Ljudbord för utljud',
            descriptionEN: '',
            numberOfUnits: 1,
            numberOfHours: 10,
            pricePerUnit: 0,
            pricePerHour: 200,
            equipmentPriceId: equipmentPriceIds.largeMixer,
            equipmentListId: firstEquipmentListId + 8,
            discount: 400,
        },
        {
            name: 'Ljudbord litet',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.smallMixer,
            nameEN: 'Mixer small',
            description: 'Ljudbord för monitor',
            descriptionEN: '',
            numberOfUnits: 2,
            numberOfHours: 10,
            pricePerUnit: 0,
            pricePerHour: 200,
            equipmentPriceId: equipmentPriceIds.smallMixer,
            equipmentListId: firstEquipmentListId + 8,
            discount: 0,
        },
    ]);
}
