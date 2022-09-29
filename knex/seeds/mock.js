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

Date.prototype.setCustomTime = function (hours = 0, minutes = 0, seconds = 0) {
    var date = new Date(this.valueOf());
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
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
                color: '#11539E',
            },
            {
                name: 'Ljus',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                color: '#539E11',
            },
            {
                name: 'Video',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                color: '#9E1153',
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
                language: 'sv',
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
                language: 'sv',
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
                language: 'sv',
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
                language: 'sv',
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
                language: 'sv',
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
                language: 'en',
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
                language: 'sv',
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
                language: 'sv',
            },
            {
                name: 'International concert',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                ownerUserId: firstUserId + 1,
                bookingType: 0,
                status: 0,
                salaryStatus: 0,
                paymentStatus: 0,
                invoiceHogiaId: 1,
                invoiceAddress: null,
                invoiceTag: null,
                invoiceNumber: 55,
                note: 'Prisförslag för att ta fram offert, datum kommer beslutas efter att budget är bekräftad.',
                returnalNote: null,
                pricePlan: 1,
                accountKind: 0,
                location: 'Torget',
                contactPersonName: 'Mike',
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'The Student Concert Society',
                language: 'en',
            },
            {
                name: 'Lunchföreläsning Björk',
                created: '2021-02-14 15:00',
                updated: '2021-03-30 14:00',
                ownerUserId: firstUserId + 1,
                bookingType: 1,
                status: 2,
                salaryStatus: 1,
                paymentStatus: 0,
                invoiceHogiaId: 'Sågverket AB',
                invoiceAddress: 'Sågverket AB',
                invoiceTag: 'Sågverket AB',
                invoiceNumber: null,
                note: 'Skogsveckan 1/4, Föreläsning av en person',
                returnalNote: null,
                pricePlan: 0,
                accountKind: 0,
                location: 'Hyllan',
                contactPersonName: null,
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'Sågverket AB',
                language: 'sv',
            },
            {
                name: 'Lunchföreläsning Tall',
                created: '2021-02-14 15:01',
                updated: '2021-03-30 14:00',
                ownerUserId: firstUserId + 1,
                bookingType: 1,
                status: 2,
                salaryStatus: 1,
                paymentStatus: 0,
                invoiceHogiaId: 'Sågverket AB',
                invoiceAddress: 'Sågverket AB',
                invoiceTag: 'Sågverket AB',
                invoiceNumber: null,
                note: 'Skogsveckan 2/4, Samtal mellan två personer',
                returnalNote: null,
                pricePlan: 0,
                accountKind: 0,
                location: 'Hyllan',
                contactPersonName: null,
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'Sågverket AB',
                language: 'sv',
            },
            {
                name: 'Lunchföreläsning Ek',
                created: '2021-02-14 15:02',
                updated: '2021-03-30 14:00',
                ownerUserId: firstUserId,
                bookingType: 1,
                status: 2,
                salaryStatus: 1,
                paymentStatus: 0,
                invoiceHogiaId: 'Sågverket AB',
                invoiceAddress: 'Sågverket AB',
                invoiceTag: 'Sågverket AB',
                invoiceNumber: null,
                note: 'Skogsveckan 3/4, Panelsamtal',
                returnalNote: null,
                pricePlan: 0,
                accountKind: 0,
                location: 'Hyllan',
                contactPersonName: null,
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'Sågverket AB',
                language: 'sv',
            },
            {
                name: 'Lunchföreläsning Furu',
                created: '2021-02-14 15:03',
                updated: '2021-03-30 14:00',
                ownerUserId: firstUserId + 2,
                bookingType: 1,
                status: 2,
                salaryStatus: 1,
                paymentStatus: 0,
                invoiceHogiaId: 'Sågverket AB',
                invoiceAddress: 'Sågverket AB',
                invoiceTag: 'Sågverket AB',
                invoiceNumber: null,
                note: 'Skogsveckan 4/4, Panelsamtal',
                returnalNote: null,
                pricePlan: 0,
                accountKind: 0,
                location: 'Hyllan',
                contactPersonName: null,
                contactPersonPhone: null,
                contactPersonEmail: null,
                customerName: 'Sågverket AB',
                language: 'sv',
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    // This list is just here to make the assignments below easier to follow
    const bookingIds = {
        tjolahoppspexet: firstBookingId,
        dataspexet: firstBookingId + 1,
        lunchföreläsning: firstBookingId + 2,
        hoppborg: firstBookingId + 3,
        utKastet: firstBookingId + 4,
        konferens: firstBookingId + 5,
        lunchföreläsningGamla: firstBookingId + 6,
        detStoraSkuttet: firstBookingId + 7,
        internationalConcert: firstBookingId + 8,
        lunchföreläsningBjörk: firstBookingId + 9,
        lunchföreläsningTall: firstBookingId + 10,
        lunchföreläsningEk: firstBookingId + 11,
        lunchföreläsningFuru: firstBookingId + 12,
    };

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
            bookingId: bookingIds.ddataspexet,
            sortIndex: 10,
        },

        // Ut kastet
        {
            name: 'Rigga',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 20,
            pricePerHour: 500,
            bookingId: bookingIds.utKastet,
            sortIndex: 10,
        },
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 2,
            pricePerHour: 125,
            bookingId: bookingIds.utKastet,
            sortIndex: 20,
        },

        // Konferens - Trädkramarna AB
        {
            name: 'Rigga',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 4,
            pricePerHour: 1000,
            bookingId: bookingIds.konferens,
            sortIndex: 10,
        },
        {
            name: 'Köra',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 100,
            pricePerHour: 250,
            bookingId: bookingIds.konferens,
            sortIndex: 20,
        },
        {
            name: 'Redigera video',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            numberOfHours: 8,
            pricePerHour: 125,
            bookingId: bookingIds.konferens,
            sortIndex: 20,
        },

        // Lunchföreläsning Björk
        {
            name: 'Körning',
            created: '2021-02-14 15:56',
            updated: '2021-02-14 15:56',
            numberOfHours: 2,
            pricePerHour: 250,
            bookingId: bookingIds.lunchföreläsningBjörk,
            sortIndex: 20,
        },

        // Lunchföreläsning Tall
        {
            name: 'Körning',
            created: '2021-02-14 15:56',
            updated: '2021-02-14 15:56',
            numberOfHours: 2,
            pricePerHour: 250,
            bookingId: bookingIds.lunchföreläsningTall,
            sortIndex: 20,
        },

        // Lunchföreläsning Ek
        {
            name: 'Körning',
            created: '2021-02-14 15:56',
            updated: '2021-02-14 15:56',
            numberOfHours: 2,
            pricePerHour: 250,
            bookingId: bookingIds.lunchföreläsningEk,
            sortIndex: 20,
        },

        // Lunchföreläsning Furu
        {
            name: 'Körning',
            created: '2021-02-14 15:56',
            updated: '2021-02-14 15:56',
            numberOfHours: 3,
            pricePerHour: 250,
            bookingId: bookingIds.lunchföreläsningFuru,
            sortIndex: 20,
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
            bookingId: bookingIds.ddataspexet,
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
            bookingId: bookingIds.lunchföreläsning,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            startDatetime: new Date().addHours(-1).toISOString(),
            endDatetime: new Date().addHours(1).toISOString(),
            pricePerHour: 250,
            accountKind: 1,
            sortIndex: 10,
        },
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: bookingIds.lunchföreläsning,
            userId: firstUserId + 1,
            actualWorkingHours: 2,
            billableWorkingHours: 2,
            startDatetime: new Date().addHours(-1).toISOString(),
            endDatetime: new Date().addHours(1).toISOString(),
            pricePerHour: 250,
            accountKind: 1,
            sortIndex: 20,
        },
        {
            name: 'Kör',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: bookingIds.lunchföreläsning,
            userId: firstUserId + 2,
            actualWorkingHours: 2,
            billableWorkingHours: 2,
            startDatetime: new Date().addHours(-1).toISOString(),
            endDatetime: new Date().addHours(1).toISOString(),
            pricePerHour: 250,
            accountKind: 1,
            sortIndex: 30,
        },

        // Konferens
        {
            name: 'Kör Intern',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: bookingIds.konferens,
            userId: firstUserId,
            actualWorkingHours: 16,
            billableWorkingHours: 16,
            startDatetime: new Date().addHours(-1).toISOString(),
            endDatetime: new Date().addHours(1).toISOString(),
            pricePerHour: 250,
            accountKind: 1,
            sortIndex: 10,
        },
        {
            name: 'Kör Extern',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            bookingId: bookingIds.konferens,
            userId: firstUserId,
            actualWorkingHours: 2,
            billableWorkingHours: 2,
            startDatetime: new Date().addHours(-1).toISOString(),
            endDatetime: new Date().addHours(1).toISOString(),
            pricePerHour: 250,
            accountKind: 0,
            sortIndex: 20,
        },

        // Lunchföreläsning Björk
        {
            name: 'Kör',
            created: '2021-02-14 15:56',
            updated: '2021-02-14 15:56',
            bookingId: bookingIds.lunchföreläsningBjörk,
            userId: firstUserId + 1,
            actualWorkingHours: 2,
            billableWorkingHours: 2,
            startDatetime: '2021-03-01 11:00',
            endDatetime: '2021-03-01 13:00',
            pricePerHour: 250,
            accountKind: 1,
            sortIndex: 30,
        },

        // Lunchföreläsning Tall
        {
            name: 'Kör',
            created: '2021-02-14 15:56',
            updated: '2021-02-14 15:56',
            bookingId: bookingIds.lunchföreläsningTall,
            userId: firstUserId + 1,
            actualWorkingHours: 2,
            billableWorkingHours: 2,
            startDatetime: '2021-03-02 11:00',
            endDatetime: '2021-03-02 13:00',
            pricePerHour: 250,
            accountKind: 1,
            sortIndex: 30,
        },

        // Lunchföreläsning Ek
        {
            name: 'Kör',
            created: '2021-02-14 15:56',
            updated: '2021-02-14 15:56',
            bookingId: bookingIds.lunchföreläsningEk,
            userId: firstUserId,
            actualWorkingHours: 3,
            billableWorkingHours: 2,
            startDatetime: '2021-03-03 11:00',
            endDatetime: '2021-03-03 13:00',
            pricePerHour: 250,
            accountKind: 1,
            sortIndex: 30,
        },

        // Lunchföreläsning Furu
        {
            name: 'Kör',
            created: '2021-02-14 15:56',
            updated: '2021-02-14 15:56',
            bookingId: bookingIds.lunchföreläsningFuru,
            userId: firstUserId + 2,
            actualWorkingHours: 3,
            billableWorkingHours: 3,
            startDatetime: '2021-03-04 11:00',
            endDatetime: '2021-03-04 13:00',
            pricePerHour: 250,
            accountKind: 1,
            sortIndex: 30,
        },
    ]);

    const firstEquipmentListId = await knex('EquipmentList')
        .insert([
            // Tjolahoppspexet
            {
                name: 'Ljud',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().setCustomTime().addDays(5).toISOString(),
                equipmentInDatetime: new Date().setCustomTime().addDays(8).toISOString(),
                usageStartDatetime: new Date().setCustomTime().addDays(5).toISOString(),
                usageEndDatetime: new Date().setCustomTime().addDays(8).toISOString(),
                bookingId: firstBookingId,
            },
            {
                name: 'Video',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().setCustomTime().addDays(7).toISOString(),
                equipmentInDatetime: new Date().setCustomTime().addDays(8).toISOString(),
                usageStartDatetime: new Date().setCustomTime().addDays(7).toISOString(),
                usageEndDatetime: new Date().setCustomTime().addDays(8).toISOString(),
                bookingId: firstBookingId,
            },

            // DATAspexet
            {
                name: 'Utrustning',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().setCustomTime(17).addDays(10).toISOString(),
                equipmentInDatetime: new Date().setCustomTime(12, 30).addDays(20).toISOString(),
                usageStartDatetime: new Date().setCustomTime().addDays(15).toISOString(),
                usageEndDatetime: new Date().setCustomTime().addDays(18).toISOString(),
                bookingId: bookingIds.ddataspexet,
                rentalStatus: null,
            },

            // Hoppborg i Nya
            {
                name: 'Krasch',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().setCustomTime().addDays(10).toISOString(),
                equipmentInDatetime: new Date().setCustomTime().addDays(20).toISOString(),
                usageStartDatetime: new Date().setCustomTime().addDays(10).toISOString(),
                usageEndDatetime: new Date().setCustomTime().addDays(20).toISOString(),
                bookingId: bookingIds.hoppborg,
                rentalStatus: null,
            },

            // Ut kastet
            {
                name: 'Kasta ut saker',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().setCustomTime().addDays(100).toISOString(),
                equipmentInDatetime: new Date().setCustomTime().addDays(108).toISOString(),
                usageStartDatetime: new Date().setCustomTime(10).addDays(106).toISOString(),
                usageEndDatetime: new Date().setCustomTime(15).addDays(107).toISOString(),
                bookingId: bookingIds.utKastet,
            },

            //Konferens - Trädkramarna AB
            {
                name: 'Ljud',
                created: '2021-02-14 15:57',
                updated: '2021-02-16 15:56',
                equipmentOutDatetime: '2021-05-04 08:00',
                equipmentInDatetime: '2021-05-05 17:00',
                usageStartDatetime: '2021-05-04 08:00',
                usageEndDatetime: '2021-05-05 17:00',
                bookingId: bookingIds.konferens,
            },
            {
                name: 'Video',
                created: '2021-02-14 15:57',
                updated: '2021-02-16 15:56',
                equipmentOutDatetime: '2021-05-04 08:00',
                equipmentInDatetime: '2021-05-05 17:00',
                usageStartDatetime: '2021-05-04 08:00',
                usageEndDatetime: '2021-05-05 17:00',
                bookingId: bookingIds.konferens,
                rentalStatus: null,
            },

            //Lunchföreläsning i Gamla
            {
                name: 'Ljud',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().setCustomTime(12).addDays(-30).toISOString(),
                equipmentInDatetime: new Date().setCustomTime(13).addDays(-30).toISOString(),
                usageStartDatetime: new Date().setCustomTime(12).addDays(-30).toISOString(),
                usageEndDatetime: new Date().setCustomTime(13).addDays(-30).toISOString(),
                bookingId: bookingIds.lunchföreläsningGamla,
                rentalStatus: 1,
            },

            // Det stora skuttet
            {
                name: 'Utrustning',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: new Date().setCustomTime(18).addDays(-3).toISOString(),
                equipmentInDatetime: new Date().setCustomTime(9).addDays(3).toISOString(),
                usageStartDatetime: new Date().setCustomTime(18).addDays(-1).toISOString(),
                usageEndDatetime: new Date().setCustomTime(3).addDays(1).toISOString(),
                bookingId: bookingIds.detStoraSkuttet,
                rentalStatus: 0,
            },

            // International concert
            {
                name: 'Sound equipment',
                created: getVarianceDateString(-100),
                updated: getVarianceDateString(100),
                equipmentOutDatetime: null,
                equipmentInDatetime: null,
                usageStartDatetime: null,
                usageEndDatetime: null,
                numberOfDays: 7,
                bookingId: bookingIds.internationalConcert,
                rentalStatus: null,
            },

            // Lunchföreläsning Björk
            {
                name: 'Utrustning',
                created: '2021-02-14 15:57',
                updated: '2021-02-16 15:56',
                equipmentOutDatetime: '2021-03-01 11:00',
                equipmentInDatetime: '2021-03-01 13:00',
                usageStartDatetime: '2021-03-01 12:00',
                usageEndDatetime: '2021-03-01 13:00',
                bookingId: bookingIds.lunchföreläsningBjörk,
                rentalStatus: null,
            },

            // Lunchföreläsning Tall
            {
                name: 'Utrustning',
                created: '2021-02-14 15:57',
                updated: '2021-02-16 15:56',
                equipmentOutDatetime: '2021-03-02 11:00',
                equipmentInDatetime: '2021-03-02 13:00',
                usageStartDatetime: '2021-03-02 12:00',
                usageEndDatetime: '2021-03-02 13:00',
                bookingId: bookingIds.lunchföreläsningTall,
                rentalStatus: null,
            },

            // Lunchföreläsning Ek
            {
                name: 'Utrustning',
                created: '2021-02-14 15:57',
                updated: '2021-02-16 15:56',
                equipmentOutDatetime: '2021-03-03 11:00',
                equipmentInDatetime: '2021-03-03 13:00',
                usageStartDatetime: '2021-03-03 12:00',
                usageEndDatetime: '2021-03-03 13:00',
                bookingId: bookingIds.lunchföreläsningEk,
                rentalStatus: null,
            },

            // Lunchföreläsning Furu
            {
                name: 'Utrustning',
                created: '2021-02-14 15:57',
                updated: '2021-02-16 15:56',
                equipmentOutDatetime: '2021-03-04 11:00',
                equipmentInDatetime: '2021-03-04 14:00',
                usageStartDatetime: '2021-03-04 12:00',
                usageEndDatetime: '2021-03-04 14:00',
                bookingId: bookingIds.lunchföreläsningFuru,
                rentalStatus: null,
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
            description: 'Ljudbord för utljud',
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
            description: 'Ljudbord för monitor',
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
            description: '',
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
            description: 'Ljudbord för monitor',
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
            description: 'Antingen handhållen eller mygga',
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
            description: 'Antingen handhållen eller mygga',
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
            description: 'Antingen handhållen eller mygga',
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
            description: '',
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
            description: 'Antingen handhållen eller mygga',
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
            description: 'Ljudbord för utljud',
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
            description: 'Ljudbord för monitor',
            numberOfUnits: 2,
            numberOfHours: 10,
            pricePerUnit: 0,
            pricePerHour: 200,
            equipmentPriceId: equipmentPriceIds.smallMixer,
            equipmentListId: firstEquipmentListId + 8,
            discount: 0,
        },

        // International concert
        {
            name: 'Large Sound Mixer',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: equipmentIds.largeMixer,
            description: 'Perfect for large events',
            numberOfUnits: 1,
            numberOfHours: 10,
            pricePerUnit: 0,
            pricePerHour: 500,
            equipmentPriceId: equipmentPriceIds.largeMixer,
            equipmentListId: firstEquipmentListId + 9,
            discount: 2000,
        },
        {
            name: 'Custom speaker system',
            created: getVarianceDateString(-100),
            updated: getVarianceDateString(100),
            equipmentId: null,
            description: 'We will grab what we have available',
            numberOfUnits: 1,
            numberOfHours: 0,
            pricePerUnit: 1000,
            pricePerHour: 0,
            equipmentPriceId: null,
            equipmentListId: firstEquipmentListId + 9,
            discount: 0,
        },

        // Lunchföreläsning Björk
        {
            name: 'Trådlös Mikrofon (WL)',
            created: '2021-02-14 15:57',
            updated: '2021-02-16 15:56',
            equipmentId: equipmentIds.wirelessMicrophone,
            description: 'Antingen handhållen eller mygga',
            numberOfUnits: 1,
            numberOfHours: 0,
            pricePerUnit: 125,
            pricePerHour: 0,
            equipmentPriceId: equipmentPriceIds.wirelessMicrophone,
            equipmentListId: firstEquipmentListId + 10,
            discount: 0,
        },
        {
            name: 'Projektor',
            created: '2021-02-14 15:57',
            updated: '2021-02-16 15:56',
            equipmentId: equipmentIds.projector,
            description: '',
            numberOfUnits: 1,
            numberOfHours: 2,
            pricePerUnit: 500,
            pricePerHour: 150,
            equipmentPriceId: equipmentPriceIds.projector2,
            equipmentListId: firstEquipmentListId + 10,
            discount: 0,
        },

        // Lunchföreläsning Tall
        {
            name: 'Trådlös Mikrofon (WL)',
            created: '2021-02-14 15:57',
            updated: '2021-02-16 15:56',
            equipmentId: equipmentIds.wirelessMicrophone,
            description: 'Antingen handhållen eller mygga',
            numberOfUnits: 2,
            numberOfHours: 0,
            pricePerUnit: 125,
            pricePerHour: 0,
            equipmentPriceId: equipmentPriceIds.wirelessMicrophone,
            equipmentListId: firstEquipmentListId + 11,
            discount: 0,
        },
        {
            name: 'Projektor',
            created: '2021-02-14 15:57',
            updated: '2021-02-16 15:56',
            equipmentId: equipmentIds.projector,
            description: '',
            numberOfUnits: 1,
            numberOfHours: 2,
            pricePerUnit: 500,
            pricePerHour: 150,
            equipmentPriceId: equipmentPriceIds.projector2,
            equipmentListId: firstEquipmentListId + 11,
            discount: 0,
        },

        // Lunchföreläsning Ek
        {
            name: 'Trådlös Mikrofon (WL)',
            created: '2021-02-14 15:57',
            updated: '2021-02-16 15:56',
            equipmentId: equipmentIds.wirelessMicrophone,
            description: 'Antingen handhållen eller mygga',
            numberOfUnits: 6,
            numberOfHours: 0,
            pricePerUnit: 125,
            pricePerHour: 0,
            equipmentPriceId: equipmentPriceIds.wirelessMicrophone,
            equipmentListId: firstEquipmentListId + 12,
            discount: 0,
        },
        {
            name: 'Projektor',
            created: '2021-02-14 15:57',
            updated: '2021-02-16 15:56',
            equipmentId: equipmentIds.projector,
            description: '',
            numberOfUnits: 1,
            numberOfHours: 2,
            pricePerUnit: 500,
            pricePerHour: 150,
            equipmentPriceId: equipmentPriceIds.projector2,
            equipmentListId: firstEquipmentListId + 12,
            discount: 0,
        },

        // Lunchföreläsning Furu
        {
            name: 'Trådlös Mikrofon (WL)',
            created: '2021-02-14 15:57',
            updated: '2021-02-16 15:56',
            equipmentId: equipmentIds.wirelessMicrophone,
            description: 'Antingen handhållen eller mygga',
            numberOfUnits: 4,
            numberOfHours: 0,
            pricePerUnit: 125,
            pricePerHour: 0,
            equipmentPriceId: equipmentPriceIds.wirelessMicrophone,
            equipmentListId: firstEquipmentListId + 13,
            discount: 0,
        },
        {
            name: 'Projektor',
            created: '2021-02-14 15:57',
            updated: '2021-02-16 15:56',
            equipmentId: equipmentIds.projector,
            description: '',
            numberOfUnits: 1,
            numberOfHours: 3,
            pricePerUnit: 500,
            pricePerHour: 150,
            equipmentPriceId: equipmentPriceIds.projector2,
            equipmentListId: firstEquipmentListId + 13,
            discount: 0,
        },
    ]);

    const firstInvoiceGroupId = await knex('InvoiceGroup')
        .insert([
            {
                name: 'Mars 2021 v1',
                created: '2021-04-01 13:45',
                updated: '2021-04-01 13:45',
                userId: firstUserId,
            },
        ])
        .returning('id')
        .then((ids) => ids[0].id);

    await knex('BookingInvoiceGroup').insert([
        {
            bookingId: bookingIds.lunchföreläsningBjörk,
            invoiceGroupId: firstInvoiceGroupId,
        },
        {
            bookingId: bookingIds.lunchföreläsningTall,
            invoiceGroupId: firstInvoiceGroupId,
        },
        {
            bookingId: bookingIds.lunchföreläsningFuru,
            invoiceGroupId: firstInvoiceGroupId,
        },
        {
            bookingId: bookingIds.lunchföreläsningEk,
            invoiceGroupId: firstInvoiceGroupId,
        },
    ]);
}
