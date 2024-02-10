import { Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { allListsAreOneDay, allListsHaveSameDates, commonStyles } from '../../utils';
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

    const thisListHasDates = list.usageStartDatetime && list.usageEndDatetime;

    if (allListsHaveSameDates(booking)) {
        return null;
    }

    if (thisListHasDates && allListsAreOneDay(booking)) {
        return (
            <Text style={styles.italic}>
                {getEquipmentListDateDisplayValues(list, booking, locale).displayUsageInterval}
            </Text>
        );
    }

    if (thisListHasDates) {
        return (
            <Text style={styles.italic}>
                {getEquipmentListDateDisplayValues(list, booking, locale).displayUsageInterval} ({getNumberOfDays(list)}{' '}
                {t(getNumberOfDays(list) === 1 ? 'common.misc.days-unit-single' : 'common.misc.days-unit')})
            </Text>
        );
    }

    return (
        <Text style={styles.italic}>
            {getNumberOfDays(list)}{' '}
            {t(getNumberOfDays(list) === 1 ? 'common.misc.days-unit-single' : 'common.misc.days-unit')}
        </Text>
    );
};
