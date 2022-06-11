import React, { ReactElement } from 'react';
import { PriceEstimateDocument } from './components/priceEstimateDocument';
import { Booking } from '../models/interfaces';
import { getBookingDocumentId, registerFonts } from './utils';
import { getTextResource, Language, TextResourcesLanguageContext } from './useTextResources';
import { PackingListDocument } from './components/packingListDocument';

registerFonts();

export const getPriceEstimateDocument = (booking: Booking, documentLanguage: Language): ReactElement => (
    <TextResourcesLanguageContext.Provider value={documentLanguage}>
        <PriceEstimateDocument booking={booking} />
    </TextResourcesLanguageContext.Provider>
);

export const getPriceEstimateDocumentFileName = (booking: Booking, documentLanguage: Language): string =>
    `${getTextResource('price-estimate.filename', documentLanguage)} ${booking.name} (${getBookingDocumentId(
        booking,
    )}).pdf`;

export const getPackingListDocument = (booking: Booking, documentLanguage: Language): ReactElement => (
    <TextResourcesLanguageContext.Provider value={documentLanguage}>
        <PackingListDocument booking={booking} />
    </TextResourcesLanguageContext.Provider>
);

export const getPackingListDocumentFileName = (booking: Booking, documentLanguage: Language): string =>
    `${getTextResource('packing-list.filename', documentLanguage)} ${booking.name} (${getBookingDocumentId(
        booking,
    )}).pdf`;
