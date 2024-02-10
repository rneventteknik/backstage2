import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';
import {
    formatNumberAsCurrency,
    getTimeEstimatePrice,
    getTotalTimeEstimatesPrice,
    addVAT,
} from '../../../lib/pricingUtils';
import { TableRow, TableCellAutoWidth, TableCellFixedWidth } from './utils';
import { useTextResources } from '../../useTextResources';
import { Booking } from '../../../models/interfaces';
import { getSortedList } from '../../../lib/sortIndexUtils';

const styles = StyleSheet.create({
    ...commonStyles,
    equipmentListSection: {
        flexDirection: 'column',
        marginBottom: 15,
    },
});

type Props = {
    booking: Booking;
    showPrices: boolean;
};
export const TimeEstimateListInfo: React.FC<Props> = ({ booking, showPrices }: Props) => {
    const { t } = useTextResources();

    return (
        <View style={styles.equipmentListSection}>
            <Text style={styles.heading}>{t('common.time-estimate-list.heading')}</Text>

            <TableRow>
                <TableCellAutoWidth>
                    <Text style={styles.italic}>{t('common.time-estimate-list.table-header.description')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.italic}>{t('common.time-estimate-list.table-header.count')}</Text>
                </TableCellFixedWidth>
                {showPrices ? (
                    <>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text style={styles.italic}>{t('common.time-estimate-list.table-header.price')}</Text>
                        </TableCellFixedWidth>
                        <TableCellFixedWidth width={180} textAlign="right">
                            <Text style={styles.italic}>{t('common.time-estimate-list.table-header.total-price')}</Text>
                        </TableCellFixedWidth>
                    </>
                ) : null}
            </TableRow>

            <View>
                {getSortedList(booking.timeEstimates ?? []).map((timeEstimate) => (
                    <TableRow key={timeEstimate.id}>
                        <TableCellAutoWidth>
                            <Text>{timeEstimate.name}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text>
                                {timeEstimate.numberOfHours} {t('common.misc.hours-unit')}
                            </Text>
                        </TableCellFixedWidth>
                        {showPrices ? (
                            <>
                                <TableCellFixedWidth width={90} textAlign="right">
                                    <Text>{formatNumberAsCurrency(addVAT(timeEstimate.pricePerHour))}</Text>
                                </TableCellFixedWidth>
                                <TableCellFixedWidth width={180} textAlign="right">
                                    <Text>{formatNumberAsCurrency(addVAT(getTimeEstimatePrice(timeEstimate)))}</Text>
                                </TableCellFixedWidth>
                            </>
                        ) : null}
                    </TableRow>
                ))}
            </View>
            {showPrices ? (
                <>
                    <TableRow>
                        <TableCellAutoWidth>
                            <Text style={styles.bold}>{t('common.equipment-list.total')}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text style={styles.bold}>
                                {formatNumberAsCurrency(addVAT(getTotalTimeEstimatesPrice(booking.timeEstimates)))}
                            </Text>
                        </TableCellFixedWidth>
                    </TableRow>
                </>
            ) : null}
        </View>
    );
};
