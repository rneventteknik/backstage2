import React, { ReactElement } from 'react';
import { PriceEstimateDocument } from './components/priceEstimateDocument';
import { Booking } from '../models/interfaces';
import { registerFonts } from './utils';
import { getTextResource, TextResourcesLanguageContext } from './useTextResources';
import { PackingListDocument } from './components/packingListDocument';
import { Language } from '../models/enums/Language';

registerFonts();

export const getPriceEstimateDocument = (booking: Booking, documentLanguage: Language): ReactElement => (
    <TextResourcesLanguageContext.Provider value={documentLanguage}>
        <PriceEstimateDocument booking={booking} />
    </TextResourcesLanguageContext.Provider>
);

export const getPriceEstimateDocumentFileName = (booking: Booking, documentLanguage: Language): string =>
    `${getTextResource('price-estimate.filename', documentLanguage)} ${booking.name}.pdf`;

export const getPackingListDocument = (booking: Booking, documentLanguage: Language): ReactElement => (
    <TextResourcesLanguageContext.Provider value={documentLanguage}>
        <PackingListDocument booking={booking} />
    </TextResourcesLanguageContext.Provider>
);

export const getPackingListDocumentFileName = (booking: Booking, documentLanguage: Language): string =>
    `${getTextResource('packing-list.filename', documentLanguage)} ${booking.name}.pdf`;

export const getHogiaInvoiceFileName = (booking: Booking): string =>
    `${booking.invoiceNumber ?? ''} ${booking.name}.txt`;
