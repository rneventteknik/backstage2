import { Language } from './useTextResources';

// This file contains all text resources for the document exports.

export const documentTextResources: Record<Language, Record<string, string>> = {
    SV: {
        // Event info
        'common.event-info.event-gig': 'Arrangemang',
        'common.event-info.event-rental': 'Hyra',
        'common.event-info.contact-person': 'Kontaktperson',
        'common.event-info.email-phone': 'Email / Telefon',
        'common.event-info.our-reference': 'Vår referens',
        'common.event-info.print-date': 'Utskriftsdatum',

        // Footer
        'common.footer.title': 'Backstage2',
        'common.footer.content': process.env.NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION ?? '',

        // Price estimate
        'price-estimate.filename': 'Prisuppskattning',
        'price-estimate.title': 'Prisuppskattning',
        'price-estimate.content': 'TODO: Lägg in innehåll här',
        'price-estimate.legal-note.title': 'Observera',
        'price-estimate.legal-note.content':
            'Ovanstående är en prisuppskattning. Det är den faktiska tidsåtgången och använd utrustning som faktureras. Ni som arrangör ansvarar för att utrustningen inte blir stulen eller förstörd.',

        // Misc
        'common.pagenumber.label': 'Sida',
    },
    EN: {
        // Event info
        'common.event-info.event-gig': 'Event',
        'common.event-info.event-rental': 'Rental',
        'common.event-info.contact-person': 'Contact person',
        'common.event-info.email-phone': 'Email / Telephone',
        'common.event-info.our-reference': 'Our reference',
        'common.event-info.print-date': 'Print date',

        // Footer
        'common.footer.title': 'Backstage2',
        'common.footer.content': process.env.NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION ?? '',

        // Price estimate
        'price-estimate.filename': 'Price Estimate',
        'price-estimate.title': 'Price estimate',
        'price-estimate.content': 'TODO: Add price estimate content here',
        'price-estimate.legal-note.title': 'Please observe',
        'price-estimate.legal-note.content':
            'The above is a price estimate. It is the actual time required and used equipment that is invoiced. You as the organizer are responsible for ensuring that the equipment is not stolen or destroyed',

        // Misc
        'common.pagenumber.label': 'Page',
    },
};
