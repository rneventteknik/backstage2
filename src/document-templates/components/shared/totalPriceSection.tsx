import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';
import { formatNumberAsCurrency, getEquipmentListPrice, getEventPrice, getTotalTimeEstimatesPrice } from '../../../lib/pricingUtils';
import { TableRow, TableCellAutoWidth, TableCellFixedWidth } from './utils';
import { Event } from '../../../models/interfaces';
import { useTextResources } from '../../useTextResources';

const styles = StyleSheet.create({
    ...commonStyles,
    equipmentListSection: {
        flexDirection: 'column',
        marginBottom: 15
    },
});

type Props = {
    event: Event;
};
export const TotalPriceSection: React.FC<Props> = ({ event }: Props) => {
    const { t } = useTextResources();

    return (
        <View style={styles.equipmentListSection}>
            <Text style={styles.heading}>{t('common.total-price-section.heading')}</Text>

            <View>
                {event.equipmentLists?.map(list =>
                    <TableRow key={list.id}>
                        <TableCellAutoWidth>
                            <Text>{list.name}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={40} textAlign="right">
                            <Text>{formatNumberAsCurrency(getEquipmentListPrice(list))}</Text>
                        </TableCellFixedWidth>
                    </TableRow>
                )}
                    <TableRow>
                        <TableCellAutoWidth>
                            <Text>{t('common.total-price-section.time-estimate-sum')}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={40} textAlign="right">
                            <Text>{formatNumberAsCurrency(getTotalTimeEstimatesPrice(event.timeEstimates))}</Text>
                        </TableCellFixedWidth>
                    </TableRow>
            </View>

            <TableRow>
                <TableCellAutoWidth>
                    <Text style={styles.bold}>{t('common.total-price-section.total-sum')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={40} textAlign="right">
                    <Text style={styles.bold}>{formatNumberAsCurrency(getEventPrice(event))}</Text>
                </TableCellFixedWidth>
            </TableRow>
        </View>
    );
};
