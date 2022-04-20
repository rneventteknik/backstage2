import { Font, StyleSheet } from '@react-pdf/renderer';
import { Event } from '../models/interfaces';
import { EquipmentListEntry } from '../models/interfaces/EquipmentList';

export const registerFonts = (): void => {
    Font.register({
        family: 'Roboto',
        fonts: [
            { src: 'assets/fonts/roboto/Roboto-Regular.ttf' },
            { src: 'assets/fonts/roboto/Roboto-Italic.ttf', fontStyle: 'italic', fontWeight: '' },
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
    col: {
        padding: 5,
        flexGrow: 1,
    },
    flexGrow: {
        flexGrow: 1,
    },
    marginBottom: {
        marginBottom: 5,
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
});

export const getEventDocumentId = (event: Event): string => {
    return `#${event.created?.getFullYear()}-${event.id}`;
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

    return `${entry.numberOfUnits} ${t('common.misc.count-unit')}`;
};
