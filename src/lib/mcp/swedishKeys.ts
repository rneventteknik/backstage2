import { toMcpBookingDetail, toMcpBookingSearchResult } from './mappers/bookingDetail';
import {
    toMcpEquipmentAvailability,
    toMcpEquipmentDetail,
    toMcpEquipmentSearchResult,
} from './mappers/equipmentDetail';

type DeepKeys<T> = T extends (infer U)[]
    ? DeepKeys<U>
    : T extends object
      ? { [K in keyof T & string]: K | DeepKeys<T[K]> }[keyof T & string]
      : never;

type McpKey =
    | DeepKeys<ReturnType<typeof toMcpBookingDetail>>
    | DeepKeys<ReturnType<typeof toMcpBookingSearchResult>>
    | DeepKeys<ReturnType<typeof toMcpEquipmentDetail>>
    | DeepKeys<ReturnType<typeof toMcpEquipmentSearchResult>>
    | DeepKeys<ReturnType<typeof toMcpEquipmentAvailability>>;

// The MCP data is built with English keys and translated as a last step, so the agent sees the same Swedish terms
// as Backstage2's users. Names are taken from the labels in the frontend where one exists.
const swedishKeys: Record<McpKey, string> = {
    // Search result
    bookings: 'bokningar',
    nextMaxBookingId: 'nästaMaxBokningsId',

    // Booking
    id: 'id',
    name: 'namn',
    link: 'länk',
    bookingType: 'bokningstyp',
    status: 'bokningsstatus',
    paymentStatus: 'betalningsstatus',
    salaryStatus: 'timarvodesstatus',
    internalReservation: 'internReservation',
    ownerUser: 'ansvarigMedlem',
    customerName: 'kundnamn',
    contactPersonName: 'kontaktperson',
    contactPersonPhone: 'kontaktpersonTelefon',
    contactPersonEmail: 'kontaktpersonEmail',
    location: 'plats',
    invoiceNumber: 'fakturanummer',
    invoiceAddress: 'fakturaadress',
    invoiceTag: 'fakturamärkning',
    invoiceHogiaId: 'hogiaId',
    invoiceDate: 'faktureringsdatum',
    pricePlan: 'prisplan',
    accountKind: 'kontotyp',
    language: 'språk',
    note: 'anteckningar',
    returnalNote: 'återlämningsanmärkning',
    operationalYear: 'verksamhetsår',
    created: 'skapad',
    usageStartDatetime: 'debiteradStarttid',
    usageEndDatetime: 'debiteradSluttid',
    equipmentOutDatetime: 'utlämningstid',
    equipmentInDatetime: 'återlämningstid',

    // Users
    nameTag: 'tagg',
    user: 'användare',
    workingUsers: 'taggadeAnvändare',

    // Prices
    pricing: 'pris',
    priceCalculationType: 'prisberäkning',
    totalPrice: 'summa',
    fixedPrice: 'fastPris',
    equipmentPrice: 'utrustningslistorTotalt',
    timeEstimatePrice: 'estimeradPersonalkostnad',
    timeReportsPrice: 'faktiskPersonalkostnad',
    excludingVAT: 'exklMoms',
    includingVAT: 'inklMoms',

    // Hours
    hours: 'timmar',
    estimatedHours: 'estimeradeTimmar',
    actualWorkingHours: 'arbetadeTimmar',
    billableWorkingHours: 'faktureradeTimmar',

    // Equipment lists
    equipmentLists: 'utrustningslistor',
    rentalStatus: 'utlämningsstatus',
    numberOfDays: 'antalDagar',
    discountPercentage: 'rabattProcent',
    rows: 'rader',
    entries: 'rader',
    type: 'typ',
    description: 'beskrivning',
    equipmentId: 'utrustningsId',
    equipmentName: 'utrustning',
    equipmentPublicCategory: 'publikKategori',
    equipmentTags: 'taggar',
    equipmentPriceName: 'prislista',
    numberOfUnits: 'antal',
    numberOfHours: 'timmar',
    pricePerUnit: 'prisPerStyck',
    pricePerHour: 'prisPerTimme',
    discountFixed: 'rabatt',
    totalDiscount: 'totalRabatt',
    account: 'konto',
    isHidden: 'doldFörKund',
    isPacked: 'packad',

    // Time estimates and time reports
    timeEstimates: 'tidsestimat',
    timeReports: 'tidrapporter',
    startDatetime: 'start',
    endDatetime: 'slut',

    // Changelog and calendar
    changelog: 'ändringshistorik',
    updated: 'tidpunkt',
    calendarEvents: 'kalenderevent',
    start: 'start',
    end: 'slut',

    // Equipment search result
    equipment: 'utrustning',
    nextMaxEquipmentId: 'nästaMaxUtrustningsId',

    // Equipment
    nameEN: 'engelsktNamn',
    descriptionEN: 'engelskBeskrivning',
    searchKeywords: 'sökord',
    inventoryCount: 'inventarieantal',
    publiclyVisible: 'synligIPublikaPrislistan',
    isArchived: 'arkiverad',
    prices: 'priser',
    pricePerUnitTHS: 'prisPerStyckTHS',
    pricePerHourTHS: 'prisPerTimmeTHS',
    currentBookings: 'pågåendeBokningar',
    upcomingBookings: 'kommandeBokningar',
    pastBookings: 'tidigareBokningar',
    pastBookingsCount: 'antalTidigareBokningar',

    // Equipment availability
    from: 'från',
    to: 'till',
    maxUnitsBooked: 'maxAntalBokade',
    availableUnits: 'tillgängligtAntal',
};

const isMcpKey = (key: string): key is McpKey => key in swedishKeys;

export const toSwedishKeys = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(toSwedishKeys);
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [
                isMcpKey(key) ? swedishKeys[key] : key,
                toSwedishKeys(nestedValue),
            ]),
        );
    }

    return value;
};
