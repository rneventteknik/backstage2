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
import { getTotalNumberOfHoursReported, groupBy, reduceSumFn } from './utils';

// Calculate total price
//
export const getPrice = (entry: EquipmentListEntry, numberOfDays: number, withDiscount = true): number => {
    if (entry.isHidden) {
        return 0;
    }

    const fullPrice = entry.numberOfUnits * getUnitPrice(entry, numberOfDays);
    return Math.max(0, withDiscount ? fullPrice - entry.discount : fullPrice);
};

export const getUnitPrice = (entry: EquipmentListEntry, numberOfDays: number): number => {
    if (entry.isHidden) {
        return 0;
    }

    return getTimePrice(entry) + entry.pricePerUnit + getExtraDaysPrice(entry, numberOfDays);
};

export const getTimePrice = (entry: EquipmentListEntry): number => {
    if (entry.isHidden) {
        return 0;
    }

    return entry.numberOfHours * entry.pricePerHour;
};

export const getExtraDaysPrice = (entry: EquipmentListEntry, numberOfTotalDays: number): number => {
    if (entry.isHidden) {
        return 0;
    }

    return entry.pricePerUnit * (numberOfTotalDays - 1) * 0.25;
};

// The database can contain a discount value larger than the linetotal
export const getCalculatedDiscount = (entry: EquipmentListEntry, numberOfDays: number): number => {
    const priceWithoutDiscount = getPrice(entry, numberOfDays, false);
    return Math.min(priceWithoutDiscount, entry.discount);
};

export const getEquipmentListHeadingPrice = (heading: EquipmentListHeading, numberOfDays: number): number => {
    return heading.listEntries.reduce((sum, e) => sum + getPrice(e, numberOfDays), 0);
};

export const getEquipmentListPrice = (list: EquipmentList): number => {
    return (
        list.listEntries.reduce((sum, e) => sum + getPrice(e, getNumberOfDays(list)), 0) +
        list.listHeadings.reduce((sum, h) => sum + getEquipmentListHeadingPrice(h, getNumberOfDays(list)), 0)
    );
};

export const getTimeEstimatePrice = (timeEstimate: TimeEstimate): number => {
    return (timeEstimate.numberOfHours ?? 0) * (timeEstimate.pricePerHour ?? 0);
};

export const getTotalTimeEstimatesPrice = (timeEstimates: TimeEstimate[] | undefined): number => {
    if (!timeEstimates) {
        return 0;
    }

    return timeEstimates?.reduce((sum, l) => sum + getTimeEstimatePrice(l), 0) ?? 0;
};

export const getTimeReportPrice = (timeReport: TimeReport): number => {
    return (timeReport.billableWorkingHours ?? 0) * (timeReport.pricePerHour ?? 0);
};

export const getTotalTimeReportsPrice = (timeReports: TimeReport[] | undefined): number => {
    if (!timeReports) {
        return 0;
    }

    return timeReports?.reduce((sum, l) => sum + getTimeReportPrice(l), 0) ?? 0;
};

export const getBookingPrice = (booking: Booking, forceEstimatedTime = false, forceNoFixedPrice = false): number => {
    if (!forceNoFixedPrice && booking.fixedPrice !== null && booking.fixedPrice !== undefined) {
        return booking.fixedPrice;
    }

    const equipmentPrice = booking.equipmentLists?.reduce((sum, l) => sum + getEquipmentListPrice(l), 0) ?? 0;
    const timeEstimatePrice = getTotalTimeEstimatesPrice(booking.timeEstimates);
    const timeReportsPrice = getTotalTimeReportsPrice(booking.timeReports);

    if (!forceEstimatedTime && booking.timeReports && booking.timeReports.length > 0) {
        return equipmentPrice + timeReportsPrice;
    }

    return equipmentPrice + timeEstimatePrice;
};

export const addVAT = (price: number): number => 1.25 * price;

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
export const formatPrice = (price: PricedEntity, returnDashIfZero = true, hoursUnit = 'h', unitsUnit = 'st'): string => {
    if (!price.pricePerHour && !price.pricePerUnit) {
        return returnDashIfZero ? `-` : formatNumberAsCurrency(0);
    } else if (price.pricePerHour && !price.pricePerUnit) {
        return `${formatNumberAsCurrency(price.pricePerHour)}/${hoursUnit}`;
    } else if (!price.pricePerHour && price.pricePerUnit) {
        return `${formatNumberAsCurrency(price.pricePerUnit)}/${unitsUnit}`;
    } else {
        return `${formatNumberAsCurrency(price.pricePerUnit)} + ${formatNumberAsCurrency(price.pricePerHour)}/h`;
    }
};

export const formatTHSPrice = (price: PricedEntityWithTHS, returnDashIfZero = true): string =>
    formatPrice({ pricePerHour: price.pricePerHourTHS, pricePerUnit: price.pricePerUnitTHS }, returnDashIfZero);

export const formatNumberAsCurrency = (number: number, showPlusIfPositive = false): string =>
    (showPlusIfPositive && number > 0 ? '+' : '') +
    Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(number);

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
                        text: `${t('hogia-invoice.start-cost')}: ${entry.pricePerUnit} kr`,
                    });
                }

                // Descriptive row with price for multiple days
                if (numberOfDays > 1 && entry.pricePerUnit) {
                    invoiceRows.push({
                        rowType: InvoiceRowType.ITEM_COMMENT,
                        text: `${numberOfDays - 1} ${t(
                            numberOfDays - 1 > 1 ? 'hogia-invoice.day-cost' : 'hogia-invoice.day-cost-single',
                        )}: ${getExtraDaysPrice(entry, numberOfDays)} kr`,
                    });
                }

                // Descriptive row with hourly rate
                if (entry.numberOfHours) {
                    invoiceRows.push({
                        rowType: InvoiceRowType.ITEM_COMMENT,
                        text: `${entry.numberOfHours} ${t('common.misc.hours-unit')}: ${getTimePrice(entry)} kr`,
                    });
                }

                if (entry.discount) {
                    invoiceRows.push({
                        rowType: InvoiceRowType.ITEM_COMMENT,
                        text: `${t('invoice.discount')}: ${getCalculatedDiscount(entry, numberOfDays)} kr`,
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
            pricePerUnit: booking.fixedPrice ?? 0,
            rowPrice: booking.fixedPrice ?? 0,
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

        const salaryLines = timeReportByUser.map((x) => {
            const hourlyWageRatio = x.booking.pricePlan === PricePlan.THS ? wageRatioThs : wageRatioExternal;
            const hourlyWage = Math.floor(x.pricePerHour * hourlyWageRatio);

            return {
                timeReportId: x.id,
                dimension1: rs,
                date: formatDateForForm(x?.startDatetime),
                name: x.name
                    ? `${x.booking.customerName} - ${x.booking.name} (${x.name})`
                    : `${x.booking.customerName} - ${x.booking.name}`,
                hours: x.billableWorkingHours,
                hourlyRate: hourlyWage,
                sum: x.billableWorkingHours * hourlyWage,
            };
        });

        salaryReportSections.push({
            userId: userId,
            user: timeReportByUser[0].user,
            salaryLines,
            sum: salaryLines.map((x) => x.sum).reduce(reduceSumFn),
        });
    }

    return salaryReportSections;
};
