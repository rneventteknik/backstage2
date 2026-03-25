import React, { ReactElement } from 'react';
import { PriceEstimateDocument } from './components/priceEstimateDocument';
import { Booking } from '../models/interfaces';
import { getTextResourcesFromGlobalSettings, overrideTranslations, registerFonts } from './utils';
import { getTextResource, TextResourcesContext } from './useTextResources';
import { PackingListDocument } from './components/packingListDocument';
import { Language } from '../models/enums/Language';
import { RentalConfirmationDocument } from './components/rentalConfirmationDocument';
import { SalaryReport } from '../models/misc/Salary';
import { SalaryReportDocument } from './components/salaryReportDocument';
import { KeyValue } from '../models/interfaces/KeyValue';
import { formatDateForForm, toBookingViewModel } from '../lib/datetimeUtils';
import { InvoiceData } from '../models/misc/Invoice';
import { InvoiceDocument } from './components/invoiceDocument';

registerFonts();

// Pricing Estimate
//
export const getPriceEstimateDocument = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
    textResourcesOverrides: Record<string, string> = {},
): ReactElement => (
    <TextResourcesContext.Provider
        value={{
            language: documentLanguage,
            textResources: overrideTranslations(
                getTextResourcesFromGlobalSettings(globalSettings),
                textResourcesOverrides,
            ),
        }}
    >
        <PriceEstimateDocument booking={booking} globalSettings={globalSettings} />
    </TextResourcesContext.Provider>
);

export const getPriceEstimateDocumentFileName = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
    textResourcesOverrides: Record<string, string> = {},
): string => {
    const prefix = getTextResource(
        'price-estimate.filename',
        documentLanguage,
        overrideTranslations(getTextResourcesFromGlobalSettings(globalSettings), textResourcesOverrides),
    );

    const date = toBookingViewModel(booking).usageStartDatetime;
    const formattedDate = formatDateForForm(date);

    if (!date) {
        return `${prefix} ${booking.name}.pdf`;
    }

    return `${prefix} ${formattedDate} ${booking.name}.pdf`;
};

// Packing List
//
export const getPackingListDocument = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
    equipmentListId?: number,
    textResourcesOverrides: Record<string, string> = {},
): ReactElement => (
    <TextResourcesContext.Provider
        value={{
            language: documentLanguage,
            textResources: overrideTranslations(
                getTextResourcesFromGlobalSettings(globalSettings),
                textResourcesOverrides,
            ),
        }}
    >
        <PackingListDocument booking={booking} globalSettings={globalSettings} equipmentListId={equipmentListId} />
    </TextResourcesContext.Provider>
);

export const getPackingListDocumentFileName = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
    textResourcesOverrides: Record<string, string> = {},
): string =>
    `${getTextResource(
        'packing-list.filename',
        documentLanguage,
        overrideTranslations(getTextResourcesFromGlobalSettings(globalSettings), textResourcesOverrides),
    )} ${booking.name}.pdf`;

// Rental Confirmation
//
export const getRentalConfirmationDocument = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
    textResourcesOverrides: Record<string, string> = {},
): ReactElement => (
    <TextResourcesContext.Provider
        value={{
            language: documentLanguage,
            textResources: overrideTranslations(
                getTextResourcesFromGlobalSettings(globalSettings),
                textResourcesOverrides,
            ),
        }}
    >
        <RentalConfirmationDocument booking={booking} globalSettings={globalSettings} />
    </TextResourcesContext.Provider>
);

export const getRentalConfirmationDocumentFileName = (
    booking: Booking,
    documentLanguage: Language,
    globalSettings: KeyValue[],
    textResourcesOverrides: Record<string, string> = {},
): string =>
    `${getTextResource(
        'rental-agreement.filename',
        documentLanguage,
        overrideTranslations(getTextResourcesFromGlobalSettings(globalSettings), textResourcesOverrides),
    )} ${booking.name}.pdf`;

// Salary Report (no language support)
//
export const getSalaryReportDocument = (salaryReport: SalaryReport, globalSettings: KeyValue[]): ReactElement => (
    <SalaryReportDocument salaryReport={salaryReport} globalSettings={globalSettings} />
);

export const getSalaryReportDocumentFileName = (salaryReport: SalaryReport): string => `${salaryReport.name}.pdf`;

// Invoice

export const getInvoiceDocument = (
    invoiceData: InvoiceData,
    documentLanguage: Language,
    globalSettings: KeyValue[],
    textResourcesOverrides: Record<string, string> = {},
): ReactElement => (
    <TextResourcesContext.Provider
        value={{
            language: documentLanguage,
            textResources: overrideTranslations(
                getTextResourcesFromGlobalSettings(globalSettings),
                textResourcesOverrides,
            ),
        }}
    >
        <InvoiceDocument invoiceData={invoiceData} globalSettings={globalSettings} />
    </TextResourcesContext.Provider>
);

export const getInvoiceDocumentFileName = (invoiceData: { invoiceNumber: string; name: string }): string =>
    `${invoiceData.invoiceNumber ?? ''} ${invoiceData.name}.pdf`;

export const getHogiaInvoiceFileName = (booking: Booking): string =>
    `${booking.invoiceNumber ?? ''} ${booking.name}.txt`;
