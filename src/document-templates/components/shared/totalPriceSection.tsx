import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';
import {
    getEquipmentListPrice,
    getBookingPrice,
    getTotalTimeEstimatesPrice,
    addVAT,
    getVAT,
    formatCurrency,
} from '../../../lib/pricingUtils';
import { TableRow, TableCellAutoWidth, TableCellFixedWidth } from './utils';
import { Booking } from '../../../models/interfaces';
import { useTextResources } from '../../useTextResources';
import { getSortedList } from '../../../lib/sortIndexUtils';

const styles = StyleSheet.create({
    ...commonStyles,
    totalPriceSection: {
        flexDirection: 'column',
        marginBottom: 15,
        marginLeft: 263,
    },
});

type Props = {
    booking: Booking;
    showEquipmentCosts?: boolean;
    showPersonnelCosts?: boolean;
    priceByAgreement?: boolean;
};
export const TotalPriceSection: React.FC<Props> = ({
    booking,
    showEquipmentCosts = true,
    showPersonnelCosts = true,
    priceByAgreement = false,
}: Props) => {
    const { t } = useTextResources();

    return (
        <View style={styles.totalPriceSection} wrap={false}>
            <Text style={{ ...styles.heading, ...styles.bold }}>{t('common.total-price-section.heading')}</Text>

            <View>
                {showEquipmentCosts
                    ? getSortedList(booking.equipmentLists ?? []).map((list) => (
                          <TableRow key={list.id}>
                              <TableCellAutoWidth>
                                  <Text>{list.name}</Text>
                              </TableCellAutoWidth>
                              <TableCellFixedWidth width={90} textAlign="right">
                                  <Text>{formatCurrency(addVAT(getEquipmentListPrice(list)))}</Text>
                              </TableCellFixedWidth>
                          </TableRow>
                      ))
                    : null}
                {showPersonnelCosts ? (
                    <TableRow>
                        <TableCellAutoWidth>
                            <Text>{t('common.total-price-section.time-estimate-sum')}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text>
                                {formatCurrency(addVAT(getTotalTimeEstimatesPrice(booking.timeEstimates)))}
                            </Text>
                        </TableCellFixedWidth>
                    </TableRow>
                ) : null}
            </View>

            <TableRow>
                <TableCellAutoWidth>
                    <Text style={styles.bold}>
                        {t(
                            priceByAgreement
                                ? 'common.total-price-section.price-by-agreement'
                                : 'common.total-price-section.total-sum',
                        )}
                    </Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.bold}>{formatCurrency(addVAT(getBookingPrice(booking, true)))}</Text>
                </TableCellFixedWidth>
            </TableRow>

            <TableRow>
                <TableCellAutoWidth>
                    <Text style={styles.bold}>{t('common.total-price-section.vat')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.bold}>{formatCurrency(getVAT(getBookingPrice(booking, true)))}</Text>
                </TableCellFixedWidth>
            </TableRow>
        </View>
    );
};
