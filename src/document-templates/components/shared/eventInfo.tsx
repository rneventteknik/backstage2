import { View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';
import { Event } from '../../../models/interfaces';
import { formatDate } from '../../../lib/utils';
import { useTextResources } from '../../useTextResources';
import { EventType } from '../../../models/enums/EventType';
import { Col, InfoItem } from './utils';

const styles = StyleSheet.create({
    ...commonStyles,
    infoSection: {
        padding: 5,
        flexDirection: 'row',
        borderBottom: '1px solid black',
    },
});

type Props = {
    event: Event;
};
export const EventInfo: React.FC<Props> = ({ event }: Props) => {
    const { t } = useTextResources();

    const eventTypeTextResourceKey =
        event.eventType === EventType.GIG ? 'common.event-info.event-gig' : 'common.event-info.event-rental';

    return (
        <View style={styles.infoSection}>
            <Col>
                <InfoItem title={t(eventTypeTextResourceKey)} content={event.name}></InfoItem>
                <InfoItem title={t('common.event-info.contact-person')} content={event.contactPersonName}></InfoItem>
                <InfoItem
                    title={t('common.event-info.email-phone')}
                    content={`${event.contactPersonEmail ?? '-'} / ${event.contactPersonPhone ?? '-'}`}
                ></InfoItem>
            </Col>
            <Col>
                <InfoItem title={t('common.event-info.our-reference')} content={event.ownerUser?.name}></InfoItem>
                <InfoItem title={t('common.event-info.print-date')} content={formatDate(new Date())}></InfoItem>
            </Col>
        </View>
    );
};
