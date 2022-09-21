import { Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { useTextResources } from '../../useTextResources';
import { getEquipmentListDateDisplayValues, getNumberOfDays } from '../../../lib/datetimeUtils';
import { Booking } from '../../../models/interfaces';

const styles = StyleSheet.create({
    ...commonStyles,
});

type Props = {
    list: EquipmentList;
    booking: Booking;
};
export const EquipmentListDateInfo: React.FC<Props> = ({ list, booking }: Props) => {
    const { t, locale } = useTextResources();

    return list.usageStartDatetime && list.usageEndDatetime ? (
        <Text style={styles.italic}>
            {getEquipmentListDateDisplayValues(list, booking, locale).displayUsageInterval} ({getNumberOfDays(list)}{' '}
            {t(getNumberOfDays(list) === 1 ? 'common.misc.days-unit-single' : 'common.misc.days-unit')})
        </Text>
    ) : (
        <Text style={styles.italic}>
            {getNumberOfDays(list)}{' '}
            {t(getNumberOfDays(list) === 1 ? 'common.misc.days-unit-single' : 'common.misc.days-unit')}
        </Text>
    );
};
