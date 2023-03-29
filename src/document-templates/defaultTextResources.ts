import { Language } from '../models/enums/Language';

// This file contains all text resources for the document exports.

export const defaultTextResources: Record<Language, Record<string, string>> = {
    sv: {
        // Booking info
        'common.booking-info.contact-person': 'Er referens',
        'common.booking-info.email-phone': 'Email / Telefon',
        'common.booking-info.our-reference': 'Vår referens',
        'common.booking-info.customer': 'Arrangör',
        'common.booking-info.dates': 'Datum',
        'common.booking-info.days': 'Antal dagar',
        'common.booking-info.booking-gig': 'Arrangemang',
        'common.booking-info.booking-rental': 'Hyra',

        // Equipment list
        'common.equipment-list.table-header.specification': 'Specifikation',
        'common.equipment-list.table-header.count': 'Antal',
        'common.equipment-list.table-header.price': 'á pris',
        'common.equipment-list.table-header.discount': 'Rabatt',
        'common.equipment-list.table-header.total-price': 'Belopp',
        'common.equipment-list.total': 'Total',

        // Time Estimate list
        'common.time-estimate-list.heading': 'Personalkostnader',
        'common.time-estimate-list.table-header.description': 'Beskrivning',
        'common.time-estimate-list.table-header.count': 'Antal',
        'common.time-estimate-list.table-header.price': 'á pris',
        'common.time-estimate-list.table-header.total-price': 'Belopp',
        'common.time-estimate-list.total': 'Total',

        // Booking total section
        'common.total-price-section.heading': 'Totalt',
        'common.total-price-section.time-estimate-sum': 'Personalkostnader',
        'common.total-price-section.total-sum': 'Att betala SEK',
        'common.total-price-section.vat': 'Varav moms (25%)',

        // Footer
        'common.footer.title': 'Backstage2',
        'common.footer.print-date': 'Utskriftsdatum',

        // Price estimate
        'price-estimate.filename': 'Prisuppskattning',
        'price-estimate.title': 'Prisuppskattning',
        'price-estimate.legal-note.title': 'Observera',
        'price-estimate.legal-note.content':
            'Ovanstående är en prisuppskattning. Det är den faktiska tidsåtgången och använd utrustning som faktureras. Ni som arrangör ansvarar för att utrustningen inte blir stulen eller förstörd.',

        // Packing list
        'packing-list.filename': 'Packlista',
        'packing-list.title': 'Packlista',

        // Rental agreement
        'rental-agreement.filename': 'Hyresavtal',
        'rental-agreement.title': 'Hyresavtal',
        'rental-agreement.legal-note.title': 'Hyresvillkor',
        'rental-agreement.legal-note.content':
            'Utrustningen skall lämnas tillbaka i det skick och nedpackat på samma vis som den hämtades i. Detta innebär att alla kablar skall rullas ihop snyggt och om något blivit smutsigt, kladdigt eller lämnats kvar tejprester på skall detta göras rent.',
        'rental-agreement.signature.1': 'Namnteckning:',
        'rental-agreement.signature.2': 'Datum:',
        'rental-agreement.signature.3': 'Ort:',
        'rental-agreement.signature.4': 'Namnförtydligande:',
        'rental-agreement.signature.5': 'Personnummer:',
        'rental-agreement.signature.6': 'Utlämnat av:',

        // Misc
        'common.pagenumber.label': 'Sida',
        'common.misc.count-unit': 'st',
        'common.misc.count-unit-single': 'st',
        'common.misc.hours-unit': 'h',
        'common.misc.days-unit': 'dagar',
        'common.misc.days-unit-single': 'dag',

        // Hogia invoice
        'hogia-invoice.general-information': 'Vid frågor om innehållet kontakta RN Eventteknik på rn@ths.kth.se, ange',
        'hogia-invoice.start-cost': 'Utrustningskostnad',
        'hogia-invoice.hourly-cost': 'Timkostnad',
        'hogia-invoice.staff-cost': 'Personalkostnad',
        'hogia-invoice.day-cost': 'extra dagar',
        'hogia-invoice.day-cost-single': 'extra dag',
        'hogia-invoice.package-price': 'Paketpris',
    },
    en: {
        // Booking info
        'common.booking-info.contact-person': 'Your reference',
        'common.booking-info.email-phone': 'Email / Telephone',
        'common.booking-info.our-reference': 'Our reference',
        'common.booking-info.customer': 'Organizer',
        'common.booking-info.dates': 'Date',
        'common.booking-info.days': 'Number of days',
        'common.booking-info.booking-gig': 'Event',
        'common.booking-info.booking-rental': 'Rental',

        // Equipment list
        'common.equipment-list.table-header.specification': 'Item',
        'common.equipment-list.table-header.count': 'Count',
        'common.equipment-list.table-header.price': 'Price',
        'common.equipment-list.table-header.discount': 'Discount',
        'common.equipment-list.table-header.total-price': 'Total price',
        'common.equipment-list.total': 'Total',

        // Time Estimate list
        'common.time-estimate-list.heading': 'Personnel costs',
        'common.time-estimate-list.table-header.description': 'Description',
        'common.time-estimate-list.table-header.count': 'Count',
        'common.time-estimate-list.table-header.price': 'Price',
        'common.time-estimate-list.table-header.total-price': 'Total price',
        'common.time-estimate-list.total': 'Total',

        // Booking total section
        'common.total-price-section.heading': 'Total',
        'common.total-price-section.time-estimate-sum': 'Personnel costs',
        'common.total-price-section.total-sum': 'To pay SEK',
        'common.total-price-section.vat': 'VAT (25%)',

        // Footer
        'common.footer.title': 'Backstage2',
        'common.footer.print-date': 'Print date',

        // Price estimate
        'price-estimate.filename': 'Price Estimate',
        'price-estimate.title': 'Price estimate',
        'price-estimate.legal-note.title': 'Please observe',
        'price-estimate.legal-note.content':
            'The above is a price estimate. It is the actual time required and used equipment that is invoiced. You as the organizer are responsible for ensuring that the equipment is not stolen or destroyed',

        // Packing list
        'packing-list.filename': 'Packing List',
        'packing-list.title': 'Packing list',

        // Rental agreement
        'rental-agreement.filename': 'Rental agreement',
        'rental-agreement.title': 'Rental agreement',
        'rental-agreement.legal-note.title': 'Rental conditions',
        'rental-agreement.legal-note.content':
            'The equipment shall be returned in the same condition and packed in the same wat as it was picked up in. All cabled should be neatly rolled and if anything has become dirty or sticky it must be cleaned.',
        'rental-agreement.signature.1': 'Signature:',
        'rental-agreement.signature.2': 'Date:',
        'rental-agreement.signature.3': 'Place:',
        'rental-agreement.signature.4': 'Name in block letters:',
        'rental-agreement.signature.5': 'Personal identity number:',
        'rental-agreement.signature.6': 'Handed out by:',

        // Misc
        'common.pagenumber.label': 'Page',
        'common.misc.count-unit': 'pcs',
        'common.misc.count-unit-single': 'pc',
        'common.misc.hours-unit': 'h',
        'common.misc.days-unit': 'days',
        'common.misc.days-unit-single': 'day',

        // Hogia invoice
        'hogia-invoice.general-information':
            'If you have any questions regarding the content please contact RN Eventteknik on rn@ths.kth.se, state',
        'hogia-invoice.start-cost': 'Equipment cost',
        'hogia-invoice.hourly-cost': 'Hourly rate',
        'hogia-invoice.staff-cost': 'Staff cost',
        'hogia-invoice.day-cost': 'extra days',
        'hogia-invoice.day-cost-single': 'extra day',
        'hogia-invoice.package-price': 'Package price',
    },
};
