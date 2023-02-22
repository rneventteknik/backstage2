import React, { ReactElement } from 'react';
import { PriceEstimateDocument } from './components/priceEstimateDocument';
import { Booking } from '../models/interfaces';
import { registerFonts } from './utils';
import { getTextResource, TextResourcesLanguageContext } from './useTextResources';
import { PackingListDocument } from './components/packingListDocument';
import { Language } from '../models/enums/Language';
import { RentalConfirmationDocument } from './components/rentalConfirmationDocument';
import { SalaryReport } from '../models/misc/Salary';
import { SalaryReportDocument } from './components/salaryReportDocument';
import { KeyValue } from '../models/interfaces/KeyValue';

registerFonts();

// Pricing Estimate
//
export const getPriceEstimateDocument = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
): ReactElement => (
    <TextResourcesLanguageContext.Provider value={documentLanguage}>
        <PriceEstimateDocument booking={booking} globalSettings={globalSettings} />
    </TextResourcesLanguageContext.Provider>
);

export const getPriceEstimateDocumentFileName = (booking: Booking, documentLanguage: Language): string =>
    `${getTextResource('price-estimate.filename', documentLanguage)} ${booking.name}.pdf`;

// Packing List
//
export const getPackingListDocument = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
    equipmentListId?: number,
): ReactElement => (
    <TextResourcesLanguageContext.Provider value={documentLanguage}>
        <PackingListDocument booking={booking} globalSettings={globalSettings} equipmentListId={equipmentListId} />
    </TextResourcesLanguageContext.Provider>
);

export const getPackingListDocumentFileName = (booking: Booking, documentLanguage: Language): string =>
    `${getTextResource('packing-list.filename', documentLanguage)} ${booking.name}.pdf`;

// Rental Confirmation
//
export const getRentalConfirmationDocument = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
): ReactElement => (
    <TextResourcesLanguageContext.Provider value={documentLanguage}>
        <RentalConfirmationDocument booking={booking} globalSettings={globalSettings} />
    </TextResourcesLanguageContext.Provider>
);

export const getRentalConfirmationDocumentFileName = (booking: Booking, documentLanguage: Language): string =>
    `${getTextResource('rental-agreement.filename', documentLanguage)} ${booking.name}.pdf`;

// Salary Report (no language support)
//
export const getSalaryReportDocument = (salaryReport: SalaryReport, globalSettings: KeyValue[]): ReactElement => (
    <SalaryReportDocument salaryReport={salaryReport} globalSettings={globalSettings} />
);

export const getSalaryReportDocumentFileName = (salaryReport: SalaryReport): string => `${salaryReport.name}.pdf`;

// Other
//
export const getHogiaInvoiceFileName = (booking: Booking): string =>
    `${booking.invoiceNumber ?? ''} ${booking.name}.txt`;
