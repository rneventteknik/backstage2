import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles, formatEquipmentListEntryCountOrHours, formatEquipmentListEntryPrice } from '../../utils';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { formatNumberAsCurrency, getPrice, getEquipmentListPrice } from '../../../lib/pricingUtils';
import { TableRow, TableCellAutoWidth, TableCellFixedWidth } from './utils';
import { useTextResources } from '../../useTextResources';
import { getNumberOfDays } from '../../../lib/datetimeUtils';
import { Booking } from '../../../models/interfaces';
import { EquipmentListDateInfo } from './equipmentListDateInfo';

const styles = StyleSheet.create({
    ...commonStyles,
    equipmentListSection: {
        flexDirection: 'column',
        marginBottom: 15,
    },
});

type Props = {
    list: EquipmentList;
    booking: Booking;
};
export const EquipmentListInfo: React.FC<Props> = ({ list, booking }: Props) => {
    const { t } = useTextResources();

    return (
        <View style={styles.equipmentListSection}>
            <Text style={styles.heading}>{list.name}</Text>
            <EquipmentListDateInfo list={list} booking={booking} />

            <TableRow>
                <TableCellAutoWidth>
                    <Text style={styles.italic}>{t('common.equipment-list.table-header.specification')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.italic}>{t('common.equipment-list.table-header.count')}</Text>
                </TableCellFixedWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.italic}>{t('common.equipment-list.table-header.price')}</Text>
                </TableCellFixedWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.italic}>{t('common.equipment-list.table-header.discount')}</Text>
                </TableCellFixedWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.italic}>{t('common.equipment-list.table-header.total-price')}</Text>
                </TableCellFixedWidth>
            </TableRow>

            <View>
                {list.equipmentListEntries.map((entry) => (
                    <TableRow key={entry.id}>
                        <TableCellAutoWidth>
                            <Text>{entry.name}</Text>
                            <Text style={{ color: '#999999' }}>{entry.description}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text>{formatEquipmentListEntryCountOrHours(entry, t)}</Text>
                        </TableCellFixedWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text>{formatEquipmentListEntryPrice(entry, t)}</Text>
                        </TableCellFixedWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text>{entry.discount > 0 ? formatNumberAsCurrency(entry.discount) : ''}</Text>
                        </TableCellFixedWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text>{formatNumberAsCurrency(getPrice(entry, getNumberOfDays(list)))}</Text>
                        </TableCellFixedWidth>
                    </TableRow>
                ))}
            </View>

            <TableRow>
                <TableCellAutoWidth>
                    <Text style={styles.bold}>{t('common.equipment-list.total')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={40} textAlign="right">
                    <Text style={styles.bold}>{formatNumberAsCurrency(getEquipmentListPrice(list))}</Text>
                </TableCellFixedWidth>
            </TableRow>
        </View>
    );
};
