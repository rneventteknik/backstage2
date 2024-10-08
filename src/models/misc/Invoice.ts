import currency from 'currency.js';
import { BookingType } from '../../models/enums/BookingType';

export interface InvoiceData {
    name: string;
    dates: string;
    documentName: string;
    invoiceTag: string;
    invoiceNumber: string;
    bookingType: BookingType;
    ourReference: string;
    dimension1: string; // Resultatställe
    templateName: string;
    customer: InvoiceCustomer;
    invoiceRows: InvoiceRow[];
}

export interface InvoiceCustomer {
    invoiceHogiaId: string;
    invoiceAddress: string;
    name: string;
    theirReference: string;
    email: string;
    phone: string;
}

export interface InvoiceRow {
    rowType: InvoiceRowType;
    text: string;
}

export interface PricedInvoiceRow extends InvoiceRow {
    numberOfUnits: number;
    pricePerUnit: currency;
    rowPrice: currency;
    account: string;
    unit: string;
    sourceId: string;
}

export enum InvoiceRowType {
    ITEM = 1,
    ITEM_COMMENT = 2,
    HEADING = 3,
}
