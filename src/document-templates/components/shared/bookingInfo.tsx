import { View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { allListsAreOneDay, allListsHaveSameDates, commonStyles } from '../../utils';
import { Booking } from '../../../models/interfaces';
import { useTextResources } from '../../useTextResources';
import { Col, InfoItem } from './utils';
import { getEquipmentListDateDisplayValues, getNumberOfDays } from '../../../lib/datetimeUtils';

const styles = StyleSheet.create({
    ...commonStyles,
    infoSection: {
        padding: 5,
        flexDirection: 'row',
        borderBottom: '1px solid black',
    },
});

type Props = {
    booking: Booking;
};
export const BookingInfo: React.FC<Props> = ({ booking }: Props) => {
    const { t, locale } = useTextResources();

    return (
        <View style={styles.infoSection}>
            <Col>
                <InfoItem title={t('common.booking-info.customer')} content={booking.customerName}></InfoItem>
                <InfoItem
                    title={t('common.booking-info.contact-person')}
                    content={booking.contactPersonName}
                ></InfoItem>
                {allListsHaveSameDates(booking) && booking.equipmentLists ? (
                    <InfoItem
                        title={t('common.booking-info.dates')}
                        content={
                            getEquipmentListDateDisplayValues(booking.equipmentLists[0], booking, locale)
                                .displayUsageInterval
                        }
                    ></InfoItem>
                ) : null}
            </Col>
            <Col>
                <InfoItem
                    title={t('common.booking-info.email-phone')}
                    content={`${booking.contactPersonEmail ?? '-'} / ${booking.contactPersonPhone ?? '-'}`}
                ></InfoItem>
                <InfoItem title={t('common.booking-info.our-reference')} content={booking.ownerUser?.name}></InfoItem>
                {allListsHaveSameDates(booking) && !allListsAreOneDay(booking) && booking.equipmentLists ? (
                    <InfoItem
                        title={t('common.booking-info.days')}
                        content={`${getNumberOfDays(booking.equipmentLists[0])} ${t(
                            getNumberOfDays(booking.equipmentLists[0]) === 1
                                ? 'common.misc.days-unit-single'
                                : 'common.misc.days-unit',
                        )}`}
                    ></InfoItem>
                ) : null}
            </Col>
        </View>
    );
};
