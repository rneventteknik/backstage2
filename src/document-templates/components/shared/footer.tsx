import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { formatDatetimeForForm } from '../../../lib/datetimeUtils';
import { Booking } from '../../../models/interfaces';
import { useTextResources } from '../../useTextResources';
import { commonStyles } from '../../utils';

type Props = {
    booking?: Booking;
};

const styles = StyleSheet.create({
    ...commonStyles,
    footer: {
        padding: 10,
        borderTop: '1px solid black',
        textAlign: 'center',
        color: 'grey',
        fontSize: 6,
    },
});

export const Footer: React.FC<Props> = ({ booking }: Props) => {
    const { t, locale } = useTextResources();

    return (
        <View style={styles.footer} fixed>
            <Text style={styles.bold}>{t('common.footer.title')}</Text>
            <Text>
                {t('common.footer.print-date')}: {formatDatetimeForForm(new Date(), '-', locale)}
                {booking ? <Text> / #{booking.id}</Text> : null}
            </Text>
        </View>
    );
};
