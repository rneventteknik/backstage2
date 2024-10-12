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
import {
    TableRow,
    TableCellAutoWidth,
    TableCellFixedWidth,
    TableRowWithNoBorder,
    TableRowWithTopBorder,
} from './utils';
import { useTextResources } from '../../useTextResources';
import { getNumberOfDays } from '../../../lib/datetimeUtils';
import { Booking } from '../../../models/interfaces';
import { EquipmentListDateInfo } from './equipmentListDateInfo';
import { getSortedList } from '../../../lib/sortIndexUtils';
import currency from 'currency.js';
import { EquipmentListDiscountInfo } from './equipmentListDiscountInfo';

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
            <View style={styles.marginBottom}>
                <Text style={styles.heading}>{list.name}</Text>
                <EquipmentListDateInfo list={list} booking={booking} />
                <EquipmentListDiscountInfo list={list} />
            </View>

            <TableRowWithNoBorder>
                <TableCellAutoWidth>
                    <Text style={styles.italic}>{t('common.equipment-list.table-header.specification')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.italic}>{t('common.equipment-list.table-header.count')}</Text>
                </TableCellFixedWidth>
                {showPrices ? (
                    <>
                        <TableCellFixedWidth width={110} textAlign="right">
                            <Text style={styles.italic}>{t('common.equipment-list.table-header.price')}</Text>
                        </TableCellFixedWidth>
                        <TableCellFixedWidth width={80} textAlign="right">
                            <Text style={styles.italic}>{t('common.equipment-list.table-header.discount')}</Text>
                        </TableCellFixedWidth>
                        <TableCellFixedWidth width={80} textAlign="right">
                            <Text style={styles.italic}>{t('common.equipment-list.table-header.total-price')}</Text>
                        </TableCellFixedWidth>
                    </>
                ) : null}
            </TableRowWithNoBorder>

            <View>
                {sortedListEntriesAndHeadings.map((wrappedEntry) => {
                    const entry = wrappedEntry.entity as EquipmentListEntry;
                    const heading = wrappedEntry.entity as EquipmentListHeading;
                    const isHeading = wrappedEntry.typeIdentifier === 'H';
                    return (
                        <>
                            <TableRowWithTopBorder key={wrappedEntry.id + wrappedEntry.typeIdentifier}>
                                <TableCellAutoWidth>
                                    <Text>{wrappedEntry.entity.name}</Text>
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
                                        <TableCellFixedWidth width={110} textAlign="right">
                                            {!isHeading ? (
                                                <Text>{formatEquipmentListEntryPriceWithVAT(entry, t)}</Text>
                                            ) : (
                                                <Text>
                                                    {formatEquipmentListEntryPriceWithVAT(
                                                        {
                                                            pricePerUnit: getEquipmentListHeadingPrice(
                                                                heading,
                                                                getNumberOfDays(list),
                                                                list.discountPercentage,
                                                            ),
                                                            pricePerHour: currency(0),
                                                        },
                                                        t,
                                                    )}
                                                </Text>
                                            )}
                                        </TableCellFixedWidth>
                                        <TableCellFixedWidth width={80} textAlign="right">
                                            {!isHeading ? (
                                                <Text>
                                                    {getCalculatedDiscount(
                                                        entry,
                                                        getNumberOfDays(list),
                                                        list.discountPercentage,
                                                    ).value > 0
                                                        ? formatCurrency(
                                                              addVAT(
                                                                  getCalculatedDiscount(
                                                                      entry,
                                                                      getNumberOfDays(list),
                                                                      list.discountPercentage,
                                                                  ),
                                                              ),
                                                          )
                                                        : ''}
                                                </Text>
                                            ) : null}
                                        </TableCellFixedWidth>
                                        <TableCellFixedWidth width={80} textAlign="right">
                                            {!isHeading ? (
                                                <Text>
                                                    {formatCurrency(
                                                        addVAT(
                                                            getPrice(
                                                                entry,
                                                                getNumberOfDays(list),
                                                                list.discountPercentage,
                                                            ),
                                                        ),
                                                    )}
                                                </Text>
                                            ) : (
                                                <Text>
                                                    {formatCurrency(
                                                        addVAT(
                                                            getEquipmentListHeadingPrice(
                                                                heading,
                                                                getNumberOfDays(list),
                                                                list.discountPercentage,
                                                            ),
                                                        ),
                                                    )}
                                                </Text>
                                            )}
                                        </TableCellFixedWidth>
                                    </>
                                ) : null}
                            </TableRowWithTopBorder>
                            <TableRowWithNoBorder>
                                <TableCellAutoWidth>
                                    <Text style={{ color: '#999999' }}>{wrappedEntry.entity.description}</Text>
                                </TableCellAutoWidth>
                            </TableRowWithNoBorder>
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
