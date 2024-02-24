import { Font, StyleSheet } from '@react-pdf/renderer';
import { getNumberOfDays } from '../lib/datetimeUtils';
import { Booking } from '../models/interfaces';
import { PricedEntity } from '../models/interfaces/BaseEntity';
import { EquipmentListEntry } from '../models/interfaces/EquipmentList';
import { addVATToPrice, formatPrice } from '../lib/pricingUtils';
import { KeyValue } from '../models/interfaces/KeyValue';
import { getGlobalSetting } from '../lib/utils';

export const registerFonts = (): void => {
    Font.register({
        family: 'Roboto',
        fonts: [
            { src: 'assets/fonts/roboto/Roboto-Regular.ttf' },
            { src: 'assets/fonts/roboto/Roboto-Italic.ttf', fontStyle: 'italic', fontWeight: 'normal' },
            { src: 'assets/fonts/roboto/Roboto-Thin.ttf', fontWeight: 'thin' },
            { src: 'assets/fonts/roboto/Roboto-ThinItalic.ttf', fontStyle: 'italic', fontWeight: 'thin' },
            { src: 'assets/fonts/roboto/Roboto-Light.ttf', fontWeight: 'light' },
            { src: 'assets/fonts/roboto/Roboto-LightItalic.ttf', fontStyle: 'italic', fontWeight: 'light' },
            { src: 'assets/fonts/roboto/Roboto-Medium.ttf', fontWeight: 'medium' },
            { src: 'assets/fonts/roboto/Roboto-MediumItalic.ttf', fontStyle: 'italic', fontWeight: 'medium' },
            { src: 'assets/fonts/roboto/Roboto-Bold.ttf', fontWeight: 'bold' },
            { src: 'assets/fonts/roboto/Roboto-BoldItalic.ttf', fontStyle: 'italic', fontWeight: 'bold' },
            { src: 'assets/fonts/roboto/Roboto-Black.ttf', fontWeight: 'ultrabold' },
            { src: 'assets/fonts/roboto/Roboto-BlackItalic.ttf', fontStyle: 'italic', fontWeight: 'ultrabold' },
        ],
    });

    Font.register({
        family: 'Open Sans',
        fonts: [
            { src: 'assets/fonts/open-sans/OpenSans-Regular.ttf' },
            { src: 'assets/fonts/open-sans/OpenSans-Italic.ttf', fontStyle: 'italic' },
            { src: 'assets/fonts/open-sans/OpenSans-Light.ttf', fontWeight: 'light' },
            { src: 'assets/fonts/open-sans/OpenSans-LightItalic.ttf', fontStyle: 'italic', fontWeight: 'light' },
            { src: 'assets/fonts/open-sans/OpenSans-SemiBold.ttf', fontWeight: 'semibold' },
            { src: 'assets/fonts/open-sans/OpenSans-SemiBoldItalic.ttf', fontStyle: 'italic', fontWeight: 'semibold' },
            { src: 'assets/fonts/open-sans/OpenSans-Bold.ttf', fontWeight: 'bold' },
            { src: 'assets/fonts/open-sans/OpenSans-BoldItalic.ttf', fontStyle: 'italic', fontWeight: 'bold' },
            { src: 'assets/fonts/open-sans/OpenSans-ExtraBold.ttf', fontWeight: 'ultrabold' },
            {
                src: 'assets/fonts/open-sans/OpenSans-ExtraBoldItalic.ttf',
                fontStyle: 'italic',
                fontWeight: 'ultrabold',
            },
        ],
    });
};

export const commonStyles = StyleSheet.create({
    page: {
        backgroundColor: 'white',
        padding: 25,
        fontSize: 8,
        fontFamily: 'Roboto',
    },
    row: {
        flexDirection: 'row',
    },
    col: {
        padding: 5,
        flexGrow: 1,
        flexBasis: 0,
    },
    flexGrow: {
        flexGrow: 1,
    },
    marginBottom: {
        marginBottom: '5px',
    },
    marginBottomLarge: {
        marginBottom: '15px',
    },
    marginTop: {
        marginTop: '5px',
    },
    marginTopLarge: {
        marginTop: '15px',
    },
    bold: {
        fontWeight: 700,
    },
    italic: {
        fontStyle: 'italic',
    },
    heading: {
        marginTop: 5,
        marginBottom: 3,
        fontSize: 10,
        fontFamily: 'Open Sans',
    },
    heading2: {
        marginTop: 12,
        marginBottom: 2,
        fontSize: 8,
        fontWeight: 700,
        fontFamily: 'Open Sans',
    },
});

export const formatEquipmentListEntryCount = (entry: EquipmentListEntry, t: (t: string) => string) => {
    if (entry.numberOfUnits === 1) {
        return `${entry.numberOfUnits} ${t('common.misc.count-unit-single')}`;
    }

    return `${entry.numberOfUnits} ${t('common.misc.count-unit')}`;
};

export const formatEquipmentListEntryCountOrHours = (entry: EquipmentListEntry, t: (t: string) => string) => {
    if (entry.numberOfUnits === 1 && entry.numberOfHours > 0) {
        return `${entry.numberOfHours} ${t('common.misc.hours-unit')}`;
    }

    if (entry.numberOfUnits > 1 && entry.numberOfHours > 0) {
        return `${entry.numberOfUnits} ${t('common.misc.count-unit')} / ${entry.numberOfHours} ${t(
            'common.misc.hours-unit',
        )}`;
    }

    return formatEquipmentListEntryCount(entry, t);
};

export const formatEquipmentListEntryPriceWithVAT = (entry: PricedEntity, t: (t: string) => string) =>
    formatPrice(addVATToPrice(entry), true, t('common.misc.hours-unit'), t('common.misc.count-unit-single'));

export const allListsAreOneDay = (booking: Booking) =>
    booking.equipmentLists &&
    booking.equipmentLists.length > 0 &&
    booking.equipmentLists.every((list) => getNumberOfDays(list) === 1);

export const allListsHaveSameDates = (booking: Booking) =>
    booking.equipmentLists &&
    booking.equipmentLists.length > 0 &&
    booking.equipmentLists.every(
        (list) =>
            booking.equipmentLists &&
            list.numberOfDays === booking.equipmentLists[0]?.numberOfDays &&
            list.usageEndDatetime?.getTime() === booking.equipmentLists[0]?.usageEndDatetime?.getTime() &&
            list.usageStartDatetime?.getTime() === booking.equipmentLists[0]?.usageStartDatetime?.getTime(),
    );

export const getTextResourcesFromGlobalSettings = (globalSettings: KeyValue[]) => ({
    sv: JSON.parse(getGlobalSetting('content.documentTextResources.sv', globalSettings, '{}')),
    en: JSON.parse(getGlobalSetting('content.documentTextResources.en', globalSettings, '{}')),
});
