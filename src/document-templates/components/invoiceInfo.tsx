import { View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../utils';
import { useTextResources } from '../useTextResources';
import { Col, InfoItem } from './shared/utils';
import { InvoiceData } from '../../models/misc/Invoice';
import { BookingType } from '../../models/enums/BookingType';

const styles = StyleSheet.create({
    ...commonStyles,
    infoSection: {
        padding: 5,
        flexDirection: 'row',
        borderBottom: '1px solid black',
    },
});

type Props = {
    invoiceData: InvoiceData;
};
export const InvoiceInfo: React.FC<Props> = ({ invoiceData }: Props) => {
    const { t } = useTextResources();

    return (
        <View style={styles.infoSection}>
            <Col>
                <InfoItem
                    title={t(
                        invoiceData.bookingType === BookingType.GIG
                            ? 'common.booking-info.booking-gig'
                            : 'common.booking-info.booking-rental',
                    )}
                    content={invoiceData.name}
                />
                <InfoItem title={t('common.booking-info.dates')} content={invoiceData.dates} />
                <InfoItem title={t('common.booking-info.our-reference')} content={invoiceData.ourReference} />
                <InfoItem title={t('invoice.tag')} content={invoiceData.invoiceTag} />
            </Col>
            <Col>
                <InfoItem
                    title={t('invoice.customer')}
                    content={`${invoiceData.customer.name} / ${invoiceData.customer.invoiceHogiaId}`}
                />
                <InfoItem title={t('invoice.address')} content={invoiceData.customer.invoiceAddress} />
                <InfoItem
                    title={t('common.booking-info.contact-person')}
                    content={invoiceData.customer.theirReference}
                />
                <InfoItem
                    title={t('common.booking-info.email-phone')}
                    content={`${invoiceData.customer.email ?? '-'} / ${invoiceData.customer.phone ?? '-'}`}
                />
            </Col>
        </View>
    );
};
