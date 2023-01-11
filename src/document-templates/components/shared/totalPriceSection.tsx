import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';
import {
    formatNumberAsCurrency,
    getEquipmentListPrice,
    getBookingPrice,
    getTotalTimeEstimatesPrice,
    addVAT,
} from '../../../lib/pricingUtils';
import { TableRow, TableCellAutoWidth, TableCellFixedWidth } from './utils';
import { Booking } from '../../../models/interfaces';
import { useTextResources } from '../../useTextResources';

const styles = StyleSheet.create({
    ...commonStyles,
    equipmentListSection: {
        flexDirection: 'column',
        marginBottom: 15,
        marginLeft: 263,
    },
});

type Props = {
    booking: Booking;
    showPersonnelCosts?: boolean;
};
export const TotalPriceSection: React.FC<Props> = ({ booking, showPersonnelCosts = true }: Props) => {
    const { t } = useTextResources();

    return (
        <View style={styles.equipmentListSection} wrap={false}>
            <Text style={{ ...styles.heading, ...styles.bold }}>{t('common.total-price-section.heading')}</Text>

            <View>
                {booking.equipmentLists?.map((list) => (
                    <TableRow key={list.id}>
                        <TableCellAutoWidth>
                            <Text>{list.name}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text>{formatNumberAsCurrency(addVAT(getEquipmentListPrice(list)))}</Text>
                        </TableCellFixedWidth>
                    </TableRow>
                ))}
                {showPersonnelCosts ? (
                    <TableRow>
                        <TableCellAutoWidth>
                            <Text>{t('common.total-price-section.time-estimate-sum')}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text>
                                {formatNumberAsCurrency(addVAT(getTotalTimeEstimatesPrice(booking.timeEstimates)))}
                            </Text>
                        </TableCellFixedWidth>
                    </TableRow>
                ) : null}
            </View>

            <TableRow>
                <TableCellAutoWidth>
                    <Text style={styles.bold}>{t('common.total-price-section.total-sum')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.bold}>{formatNumberAsCurrency(addVAT(getBookingPrice(booking, true)))}</Text>
                </TableCellFixedWidth>
            </TableRow>

            <TableRow>
                <TableCellAutoWidth>
                    <Text style={styles.bold}>{t('common.total-price-section.vat')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.bold}>
                        {formatNumberAsCurrency(
                            addVAT(getBookingPrice(booking, true)) - getBookingPrice(booking, true),
                        )}
                    </Text>
                </TableCellFixedWidth>
            </TableRow>
        </View>
    );
};
