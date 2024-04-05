import { PricePlan } from '../models/enums/PricePlan';
import { AccountKind } from '../models/enums/AccountKind';
import { Booking, BookingViewModel, TimeEstimate, TimeReport } from '../models/interfaces';
import { PricedEntity, PricedEntityWithTHS } from '../models/interfaces/BaseEntity';
import { EquipmentList, EquipmentListEntry, EquipmentListHeading } from '../models/interfaces/EquipmentList';
import { SalaryGroup } from '../models/interfaces/SalaryGroup';
import { InvoiceCustomer, InvoiceData, InvoiceRow, InvoiceRowType, PricedInvoiceRow } from '../models/misc/Invoice';
import { SalaryReport, UserSalaryReport } from '../models/misc/Salary';
import { formatDateForForm, getBookingDateDisplayValues, getNumberOfDays } from './datetimeUtils';
import { getSortedList } from './sortIndexUtils';
import { getTotalNumberOfHoursReported, groupBy } from './utils';
import currency from 'currency.js';

// Calculate total price
//
export const getPrice = (entry: EquipmentListEntry, numberOfDays: number, withDiscount = true): currency => {
    const fullPrice = getUnitPrice(entry, numberOfDays).multiply(entry.numberOfUnits);

    if (!withDiscount) {
        return fullPrice;
    }

    if (fullPrice.subtract(entry.discount).value < 0) {
        return currency(0);
    }

    return fullPrice.subtract(entry.discount);
};

export const getUnitPrice = (entry: EquipmentListEntry, numberOfDays: number): currency => {
    if (entry.isHidden) {
        return currency(0);
    }

    return getTimePrice(entry).add(entry.pricePerUnit).add(getExtraDaysPrice(entry, numberOfDays));
};

export const getTimePrice = (entry: EquipmentListEntry): currency => {
    if (entry.isHidden) {
        return currency(0);
    }

    return currency(entry.pricePerHour).multiply(entry.numberOfHours);
};

export const getExtraDaysPrice = (entry: EquipmentListEntry, numberOfTotalDays: number): currency => {
    if (entry.isHidden) {
        return currency(0);
    }

    return currency(entry.pricePerUnit)
        .multiply(numberOfTotalDays - 1)
        .multiply(0.25);
};

export const getCalculatedDiscount = (entry: EquipmentListEntry, numberOfDays: number): currency => {
    const priceWithoutDiscount = getPrice(entry, numberOfDays, false);

    // The database can contain a discount value larger than the linetotal
    if (priceWithoutDiscount.value < entry.discount.value) {
        return priceWithoutDiscount;
    }

    return currency(entry.discount);
};

export const getEquipmentListHeadingPrice = (heading: EquipmentListHeading, numberOfDays: number): currency => {
    return heading.listEntries.reduce((sum, e) => sum.add(getPrice(e, numberOfDays)), currency(0));
};

export const getEquipmentListPrice = (list: EquipmentList): currency => {
    return list.listEntries
        .reduce((sum, e) => sum.add(getPrice(e, getNumberOfDays(list))), currency(0))
        .add(
            list.listHeadings.reduce(
                (sum, h) => sum.add(getEquipmentListHeadingPrice(h, getNumberOfDays(list))),
                currency(0),
            ),
        );
};

export const getTimeEstimatePrice = (timeEstimate: TimeEstimate): currency => {
    return currency(timeEstimate.pricePerHour ?? 0).multiply(timeEstimate.numberOfHours ?? 0);
};

export const getTotalTimeEstimatesPrice = (timeEstimates: TimeEstimate[] | undefined): currency => {
    if (!timeEstimates) {
        return currency(0);
    }

    return timeEstimates?.reduce((sum, l) => sum.add(getTimeEstimatePrice(l)), currency(0)) ?? currency(0);
};

export const getTimeReportPrice = (timeReport: TimeReport): currency => {
    return currency(timeReport.pricePerHour ?? 0).multiply(timeReport.billableWorkingHours ?? 0);
};

export const getTotalTimeReportsPrice = (timeReports: TimeReport[] | undefined): currency => {
    if (!timeReports) {
        return currency(0);
    }

    return timeReports?.reduce((sum, l) => sum.add(getTimeReportPrice(l)), currency(0)) ?? currency(0);
};

export const getBookingPrice = (booking: Booking, forceEstimatedTime = false, forceNoFixedPrice = false): currency => {
    if (!forceNoFixedPrice && booking.fixedPrice !== null && booking.fixedPrice !== undefined) {
        return currency(booking.fixedPrice);
    }

    const equipmentPrice =
        booking.equipmentLists?.reduce((sum, l) => sum.add(getEquipmentListPrice(l)), currency(0)) ?? currency(0);
    const timeEstimatePrice = getTotalTimeEstimatesPrice(booking.timeEstimates);
    const timeReportsPrice = getTotalTimeReportsPrice(booking.timeReports);

    if (!forceEstimatedTime && booking.timeReports && booking.timeReports.length > 0) {
        return equipmentPrice.add(timeReportsPrice);
    }

    return equipmentPrice.add(timeEstimatePrice);
};

export const addVAT = (price: currency | number): currency => currency(price).add(getVAT(price));
export const getVAT = (price: currency | number): currency => currency(price).multiply(0.25);

export const addVATToPrice = (price: PricedEntity): PricedEntity => ({
    pricePerHour: addVAT(price.pricePerHour),
    pricePerUnit: addVAT(price.pricePerUnit),
});
export const addVATToPriceWithTHS = (price: PricedEntityWithTHS): PricedEntityWithTHS => ({
    pricePerHour: addVAT(price.pricePerHour),
    pricePerUnit: addVAT(price.pricePerUnit),
    pricePerHourTHS: addVAT(price.pricePerHourTHS),
    pricePerUnitTHS: addVAT(price.pricePerUnitTHS),
});

// Format price
//
export const formatPrice = (price: PricedEntity, hoursUnit = 'h', unitsUnit = 'st'): string => {
    if (!price.pricePerHour.value && !price.pricePerUnit.value) {
        return `-`;
    } else if (price.pricePerHour.value && !price.pricePerUnit.value) {
        return `${formatCurrency(price.pricePerHour)}/${hoursUnit}`;
    } else if (!price.pricePerHour.value && price.pricePerUnit.value) {
        return `${formatCurrency(price.pricePerUnit)}/${unitsUnit}`;
    } else {
        return `${formatCurrency(price.pricePerUnit)} + ${formatCurrency(price.pricePerHour)}/h`;
    }
};

export const formatTHSPrice = (price: PricedEntityWithTHS): string =>
    formatPrice({ pricePerHour: price.pricePerHourTHS, pricePerUnit: price.pricePerUnitTHS });

export const formatNumberAsCurrency = (number: number, showPlusIfPositive = false): string =>
    formatCurrency(currency(number), showPlusIfPositive);

export const formatCurrency = (number: currency, showPlusIfPositive = false): string =>
    (showPlusIfPositive && number.value > 0 ? '+' : '') +
    Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(number.value);

export const getInvoiceData = (
    booking: BookingViewModel,
    dimension1: string, // Resultatställe
    ourReference: string,
    templateName: string,
    documentName: string,
    defaultEquipmentAccountExternal: string,
    defaultEquipmentAccountInternal: string,
    defaultSalaryAccountExternal: string,
    defaultSalaryAccountInternal: string,
    t: (t: string) => string,
    locale: 'sv-SE' | 'en-SE' | undefined,
): InvoiceData => {
    const getInvoiceCustomer = (booking: BookingViewModel): InvoiceCustomer => ({
        invoiceHogiaId: booking.invoiceHogiaId?.toString() ?? '000000',
        invoiceAddress: booking.invoiceAddress ?? '',
        name: booking.customerName,
        theirReference: booking.contactPersonName ?? '',
        email: booking.contactPersonEmail,
        phone: booking.contactPersonPhone,
    });

    const getInvoiceRows = (booking: BookingViewModel): InvoiceRow[] => {
        if (booking.fixedPrice !== null) {
            return fixedPriceBookingToInvoiceRows(booking);
        }

        const equipmentRows = booking.equipmentLists ? booking.equipmentLists.flatMap(equipmentListToInvoiceRows) : [];
        const laborRows = timeReportsToLaborRows(booking.timeReports);
        return [...equipmentRows, ...laborRows];
    };

    const equipmentListToInvoiceRows = (equipmentList: EquipmentList): InvoiceRow[] => {
        const listHeadingRow: InvoiceRow = {
            rowType: InvoiceRowType.HEADING,
            text: equipmentList.name,
        };

        interface WrappedEquipmentListEntity {
            typeIdentifier: string;
            entity: EquipmentListEntry | EquipmentListHeading;
            id: string;
            sortIndex: number;
        }

        // This wrapping is used to merge and sort the list entries and headings
        const wrapEntity = (
            entity: EquipmentListEntry | EquipmentListHeading,
            typeIdentifier: 'E' | 'H',
        ): WrappedEquipmentListEntity => ({
            typeIdentifier,
            entity,
            id: typeIdentifier + entity.id, // TODO: behövs detta fält?
            sortIndex: entity.sortIndex,
        });
        const sortedListEntriesAndHeadings = getSortedList([
            ...equipmentList.listEntries.filter((x) => !x.isHidden).map((x) => wrapEntity(x, 'E')),
            ...equipmentList.listHeadings.map((x) => wrapEntity(x, 'H')),
        ]);

        const equipmentListEntityToInvoiceRows = (wrappedEntity: WrappedEquipmentListEntity): InvoiceRow[] => {
            const isHeading = wrappedEntity.typeIdentifier === 'H';
            const numberOfDays = getNumberOfDays(equipmentList);
            if (isHeading) {
                const heading = wrappedEntity.entity as EquipmentListHeading;
                const rowPrice = getEquipmentListHeadingPrice(heading, numberOfDays);
                const mainRow: PricedInvoiceRow = {
                    rowType: InvoiceRowType.ITEM,
                    text: wrappedEntity.entity.name,
                    numberOfUnits: 1, // Packages are always singular
                    pricePerUnit: rowPrice,
                    rowPrice: rowPrice, // Package headings does not show discounts
                    account:
                        booking.accountKind === AccountKind.EXTERNAL
                            ? defaultEquipmentAccountExternal
                            : defaultEquipmentAccountInternal, // TODO: Should this be something else if all members have the same different account?
                    unit: t('common.misc.count-unit-single'),
                };
                const packageDescriptionRow: InvoiceRow = {
                    rowType: InvoiceRowType.ITEM_COMMENT,
                    text: t('hogia-invoice.package-price'),
                };
                return [mainRow, packageDescriptionRow];
            } else {
                const entry = wrappedEntity.entity as EquipmentListEntry;
                const mainRow: PricedInvoiceRow = {
                    rowType: InvoiceRowType.ITEM,
                    text: entry.name,
                    numberOfUnits: entry.numberOfUnits,
                    pricePerUnit: getUnitPrice(entry, numberOfDays),
                    rowPrice: getPrice(entry, numberOfDays, true), // Row price including discount
                    account:
                        entry.account ??
                        (booking.accountKind === AccountKind.EXTERNAL
                            ? defaultEquipmentAccountExternal
                            : defaultEquipmentAccountInternal),
                    unit: t(entry.numberOfUnits > 1 ? 'common.misc.count-unit' : 'common.misc.count-unit-single'),
                };
                const invoiceRows: InvoiceRow[] = [mainRow];

                // Descriptive row with base price
                if ((numberOfDays > 1 || entry.numberOfHours) && entry.pricePerUnit) {
                    invoiceRows.push({
                        rowType: InvoiceRowType.ITEM_COMMENT,
                        text: `${t('hogia-invoice.start-cost')}: ${formatCurrency(entry.pricePerUnit)}`,
                    });
                }

                // Descriptive row with price for multiple days
                if (numberOfDays > 1 && entry.pricePerUnit) {
                    invoiceRows.push({
                        rowType: InvoiceRowType.ITEM_COMMENT,
                        text: `${numberOfDays - 1} ${t(
                            numberOfDays - 1 > 1 ? 'hogia-invoice.day-cost' : 'hogia-invoice.day-cost-single',
                        )}: ${formatCurrency(getExtraDaysPrice(entry, numberOfDays))}`,
                    });
                }

                // Descriptive row with hourly rate
                if (entry.numberOfHours) {
                    invoiceRows.push({
                        rowType: InvoiceRowType.ITEM_COMMENT,
                        text: `${entry.numberOfHours} ${t('common.misc.hours-unit')}: ${formatCurrency(
                            getTimePrice(entry),
                        )}`,
                    });
                }

                if (entry.discount.value) {
                    invoiceRows.push({
                        rowType: InvoiceRowType.ITEM_COMMENT,
                        text: `${t('invoice.discount')}: ${formatCurrency(getCalculatedDiscount(entry, numberOfDays))}`,
                    });
                }

                return invoiceRows;
            }
        };

        return [listHeadingRow, ...sortedListEntriesAndHeadings.flatMap(equipmentListEntityToInvoiceRows)];
    };

    const timeReportsToLaborRows = (timeReports: TimeReport[] | undefined): InvoiceRow[] => {
        if (!timeReports?.length) {
            return [];
        }

        const headingRow: InvoiceRow = {
            rowType: InvoiceRowType.HEADING,
            text: t('hogia-invoice.staff-cost'),
        };

        const mainRowPrice = getTotalTimeReportsPrice(timeReports);
        const mainRow: PricedInvoiceRow = {
            rowType: InvoiceRowType.ITEM,
            text: t('hogia-invoice.staff-cost'),
            numberOfUnits: 1,
            pricePerUnit: mainRowPrice,
            rowPrice: mainRowPrice,
            account:
                booking.accountKind === AccountKind.EXTERNAL
                    ? defaultSalaryAccountExternal
                    : defaultSalaryAccountInternal,
            unit: t('common.misc.count-unit-single'),
        };

        const descriptiveRow: InvoiceRow = {
            rowType: InvoiceRowType.ITEM_COMMENT,
            text: `${t('hogia-invoice.number-of-hours')}: ${getTotalNumberOfHoursReported(timeReports)} ${t(
                'common.misc.hours-unit',
            )}`,
        };

        return [headingRow, mainRow, descriptiveRow];
    };

    const fixedPriceBookingToInvoiceRows = (booking: BookingViewModel): InvoiceRow[] => {
        const mainRow: PricedInvoiceRow = {
            rowType: InvoiceRowType.ITEM,
            text: t('hogia-invoice.price-by-agreement'),
            numberOfUnits: 1,
            pricePerUnit: currency(booking.fixedPrice ?? 0),
            rowPrice: currency(booking.fixedPrice ?? 0),
            account:
                booking.accountKind === AccountKind.EXTERNAL
                    ? defaultEquipmentAccountExternal
                    : defaultEquipmentAccountInternal,
            unit: t('common.misc.count-unit-single'),
        };

        return [mainRow];
    };

    return {
        documentName: `${documentName}${booking.invoiceNumber ? ' ' + booking.invoiceNumber : ''}`,
        name: booking.name,
        dates: getBookingDateDisplayValues(booking, locale).displayUsageInterval,
        invoiceTag: booking.invoiceTag,
        invoiceNumber: booking.invoiceNumber,
        dimension1: dimension1,
        templateName: templateName,
        bookingType: booking.bookingType,
        ourReference: ourReference,
        customer: getInvoiceCustomer(booking),
        invoiceRows: getInvoiceRows(booking),
    };
};

// Salary calculations
//
export const getSalaryReport = (
    salaryGroup: SalaryGroup,
    dimension1: string, // Resultatställe
    wageRatioExternal: number,
    wageRatioThs: number,
): SalaryReport => ({
    name: salaryGroup.name,
    userSalaryReports: calculateSalary(salaryGroup.bookings ?? [], dimension1, wageRatioExternal, wageRatioThs),
});

export const calculateSalary = (
    bookings: Booking[],
    rs: string,
    wageRatioExternal: number,
    wageRatioThs: number,
): UserSalaryReport[] => {
    const timeReports = bookings.flatMap((booking) =>
        (booking.timeReports ?? [])
            .filter((timeReport) => timeReport.billableWorkingHours > 0)
            .map((timeReport) => ({ ...timeReport, booking: booking })),
    );

    const timeReportsByUser = groupBy(timeReports, (x) => x?.userId ?? 0);

    const salaryReportSections = [];
    for (const userId in timeReportsByUser) {
        const timeReportByUser = timeReportsByUser[userId];

        if (!timeReportByUser[0].user) {
            throw new Error('Invalid data, user information is mandatory');
        }

        const salaryLines = timeReportByUser.map((x) =>
            getSalaryForTimeReport(x, x.booking, rs, wageRatioExternal, wageRatioThs),
        );

        salaryReportSections.push({
            userId: userId,
            user: timeReportByUser[0].user,
            salaryLines,
            sum: salaryLines.map((x) => x.sum).reduce((a, b) => a.add(b), currency(0)),
        });
    }

    return salaryReportSections;
};

export const getSalaryForTimeReport = (
    x: TimeReport,
    booking: Booking,
    rs: string,
    wageRatioExternal: number,
    wageRatioThs: number,
) => {
    const hourlyWageRatio = booking.pricePlan === PricePlan.THS ? wageRatioThs : wageRatioExternal;
    const hourlyWage = currency(x.pricePerHour).multiply(hourlyWageRatio).dollars();

    return {
        timeReportId: x.id,
        dimension1: rs,
        date: formatDateForForm(x?.startDatetime),
        name: x.name
            ? `${booking.customerName} - ${booking.name} (${x.name})`
            : `${booking.customerName} - ${booking.name}`,
        hours: x.billableWorkingHours,
        hourlyRate: hourlyWage,
        sum: currency(hourlyWage).multiply(x.billableWorkingHours),
    };
};
