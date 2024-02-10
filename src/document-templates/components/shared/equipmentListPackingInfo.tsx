import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles, formatEquipmentListEntryCount } from '../../utils';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { TableRow, TableCellAutoWidth, TableCellFixedWidth } from './utils';
import { groupBy, onlyUniqueById } from '../../../lib/utils';
import { useTextResources } from '../../useTextResources';
import { EquipmentLocation } from '../../../models/interfaces/EquipmentLocation';
import { getSortedList } from '../../../lib/sortIndexUtils';
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
export const EquipmentListPackingInfo: React.FC<Props> = ({ list, booking }: Props) => {
    const { t } = useTextResources();

    const allListEntries = [...list.listEntries, ...list.listHeadings.flatMap((x) => x.listEntries ?? [])];
    const defaultEquipmentLocation: EquipmentLocation = { id: 0, name: 'Okänd plats', sortIndex: Infinity };
    const uniqueEquipmentLocations = getSortedList(
        allListEntries.map((x) => x.equipment?.equipmentLocation ?? defaultEquipmentLocation).filter(onlyUniqueById),
    );
    const equipmentListEntriesByLocationId = groupBy(allListEntries, (x) => x.equipment?.equipmentLocation?.id ?? 0);

    return (
        <View style={styles.equipmentListSection}>
            <Text style={styles.heading}>{list.name}</Text>
            <EquipmentListDateInfo list={list} booking={booking} />

            {uniqueEquipmentLocations.map((location) => (
                <>
                    <Text style={styles.heading2}>{location.name}</Text>

                    <TableRow>
                        <TableCellAutoWidth>
                            <Text style={styles.italic}>{t('common.equipment-list.table-header.specification')}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text style={styles.italic}>{t('common.equipment-list.table-header.count')}</Text>
                        </TableCellFixedWidth>
                    </TableRow>

                    <View>
                        {equipmentListEntriesByLocationId[location.id].map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCellAutoWidth>
                                    <Text>{entry.name}</Text>
                                    <Text style={{ color: '#999999' }}>{entry.description}</Text>
                                </TableCellAutoWidth>
                                <TableCellFixedWidth width={90} textAlign="right">
                                    <Text>{formatEquipmentListEntryCount(entry, t)}</Text>
                                </TableCellFixedWidth>
                            </TableRow>
                        ))}
                    </View>
                </>
            ))}
        </View>
    );
};
