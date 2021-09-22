import React, { ReactElement } from 'react';
import { PriceEstimateDocument } from './components/priceEstimateDocument';
import { Event } from '../models/interfaces';
import { getEventDocumentId, registerFonts } from './utils';
import { getTextResource, Language, TextResourcesLanguageContext } from './useTextResources';

registerFonts();

export const getPriceEstimateDocument = (event: Event, documentLanguage: Language): ReactElement => (
    <TextResourcesLanguageContext.Provider value={documentLanguage}>
        <PriceEstimateDocument event={event} />
    </TextResourcesLanguageContext.Provider>
);

export const getPriceEstimateDocumentFileName = (event: Event, documentLanguage: Language): string =>
    `${getTextResource('price-estimate.filename', documentLanguage)} ${event.name} (${getEventDocumentId(event)}).pdf`;
