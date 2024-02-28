import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles, formatEquipmentListEntryCountOrHours, formatEquipmentListEntryPriceWithVAT } from '../../utils';
import { EquipmentList, EquipmentListEntry, EquipmentListHeading } from '../../../models/interfaces/EquipmentList';
import {
    getPrice,
    getEquipmentListPrice,
    getEquipmentListHeadingPrice,
    getCalculatedDiscount,
    addVAT,
    formatCurrency,
} from '../../../lib/pricingUtils';
import { TableRow, TableCellAutoWidth, TableCellFixedWidth } from './utils';
import { useTextResources } from '../../useTextResources';
import { getNumberOfDays } from '../../../lib/datetimeUtils';
import { Booking } from '../../../models/interfaces';
import { EquipmentListDateInfo } from './equipmentListDateInfo';
import { getSortedList } from '../../../lib/sortIndexUtils';
import currency from 'currency.js';

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
    showPrices: boolean;
};
export const EquipmentListInfo: React.FC<Props> = ({ list, booking, showPrices }: Props) => {
    const { t } = useTextResources();

    const wrapEntity = (entity: EquipmentListEntry | EquipmentListHeading, typeIdentifier: 'E' | 'H') => ({
        typeIdentifier,
        entity,
        id: typeIdentifier + entity.id,
        sortIndex: entity.sortIndex,
    });
    const sortedListEntriesAndHeadings = getSortedList([
        ...list.listEntries.filter((x) => !x.isHidden).map((x) => wrapEntity(x, 'E')),
        ...list.listHeadings.map((x) => wrapEntity(x, 'H')),
    ]);

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
                {showPrices ? (
                    <>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text style={styles.italic}>{t('common.equipment-list.table-header.price')}</Text>
                        </TableCellFixedWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text style={styles.italic}>{t('common.equipment-list.table-header.discount')}</Text>
                        </TableCellFixedWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text style={styles.italic}>{t('common.equipment-list.table-header.total-price')}</Text>
                        </TableCellFixedWidth>
                    </>
                ) : null}
            </TableRow>

            <View>
                {sortedListEntriesAndHeadings.map((wrappedEntry) => {
                    const entry = wrappedEntry.entity as EquipmentListEntry;
                    const heading = wrappedEntry.entity as EquipmentListHeading;
                    const isHeading = wrappedEntry.typeIdentifier === 'H';
                    return (
                        <>
                            <TableRow key={wrappedEntry.id + wrappedEntry.typeIdentifier}>
                                <TableCellAutoWidth>
                                    <Text>{wrappedEntry.entity.description}</Text>
                                </TableCellAutoWidth>
                                <TableCellFixedWidth width={90} textAlign="right">
                                    {!isHeading ? (
                                        <Text>{formatEquipmentListEntryCountOrHours(entry, t)}</Text>
                                    ) : (
                                        <Text>1 {t('common.misc.count-unit-single')}</Text>
                                    )}
                                </TableCellFixedWidth>
                                {showPrices ? (
                                    <>
                                        <TableCellFixedWidth width={90} textAlign="right">
                                            {!isHeading ? (
                                                <Text>{formatEquipmentListEntryPriceWithVAT(entry, t)}</Text>
                                            ) : (
                                                <Text>
                                                    {formatEquipmentListEntryPriceWithVAT(
                                                        {
                                                            pricePerUnit: getEquipmentListHeadingPrice(
                                                                heading,
                                                                getNumberOfDays(list),
                                                            ),
                                                            pricePerHour: currency(0),
                                                        },
                                                        t,
                                                    )}
                                                </Text>
                                            )}
                                        </TableCellFixedWidth>
                                        <TableCellFixedWidth width={90} textAlign="right">
                                            {!isHeading ? (
                                                <Text>
                                                    {getCalculatedDiscount(entry, getNumberOfDays(list)).value > 0
                                                        ? formatCurrency(
                                                              addVAT(
                                                                  getCalculatedDiscount(entry, getNumberOfDays(list)),
                                                              ),
                                                          )
                                                        : ''}
                                                </Text>
                                            ) : null}
                                        </TableCellFixedWidth>
                                        <TableCellFixedWidth width={90} textAlign="right">
                                            {!isHeading ? (
                                                <Text>
                                                    {formatCurrency(addVAT(getPrice(entry, getNumberOfDays(list))))}
                                                </Text>
                                            ) : (
                                                <Text>
                                                    {formatCurrency(
                                                        addVAT(
                                                            getEquipmentListHeadingPrice(
                                                                heading,
                                                                getNumberOfDays(list),
                                                            ),
                                                        ),
                                                    )}
                                                </Text>
                                            )}
                                        </TableCellFixedWidth>
                                    </>
                                ) : null}
                            </TableRow>
                        </>
                    );
                })}
            </View>
            {showPrices ? (
                <>
                    <TableRow>
                        <TableCellAutoWidth>
                            <Text style={styles.bold}>{t('common.equipment-list.total')}</Text>
                        </TableCellAutoWidth>
                        <TableCellFixedWidth width={90} textAlign="right">
                            <Text style={styles.bold}>{formatCurrency(addVAT(getEquipmentListPrice(list)))}</Text>
                        </TableCellFixedWidth>
                    </TableRow>
                </>
            ) : null}
        </View>
    );
};
