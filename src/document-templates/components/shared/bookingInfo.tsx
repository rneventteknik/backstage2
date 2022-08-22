import { View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';
import { Booking } from '../../../models/interfaces';
import { useTextResources } from '../../useTextResources';
import { BookingType } from '../../../models/enums/BookingType';
import { Col, InfoItem } from './utils';
import { formatDatetime } from '../../../lib/datetimeUtils';

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
    const { t } = useTextResources();

    const bookingTypeTextResourceKey =
        booking.bookingType === BookingType.GIG
            ? 'common.booking-info.booking-gig'
            : 'common.booking-info.booking-rental';

    return (
        <View style={styles.infoSection}>
            <Col>
                <InfoItem title={t(bookingTypeTextResourceKey)} content={booking.name}></InfoItem>
                <InfoItem
                    title={t('common.booking-info.contact-person')}
                    content={booking.contactPersonName}
                ></InfoItem>
                <InfoItem
                    title={t('common.booking-info.email-phone')}
                    content={`${booking.contactPersonEmail ?? '-'} / ${booking.contactPersonPhone ?? '-'}`}
                ></InfoItem>
            </Col>
            <Col>
                <InfoItem title={t('common.booking-info.our-reference')} content={booking.ownerUser?.name}></InfoItem>
                <InfoItem title={t('common.booking-info.print-date')} content={formatDatetime(new Date())}></InfoItem>
            </Col>
        </View>
    );
};
