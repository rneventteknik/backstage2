import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React, { ReactNode } from 'react';
import { commonStyles } from '../../utils';
import { Event } from '../../../interfaces';
import { formatDate } from '../../../lib/utils';
import { useTextResources } from '../../useTextResources';
import { EventType } from '../../../interfaces/enums/EventType';

const styles = StyleSheet.create({
    ...commonStyles,
    infoSection: {
        padding: 5,
        flexDirection: 'row',
        borderBottom: '1px solid black',
    },
});

type ColProps = {
    children?: ReactNode;
};
export const Col: React.FC<ColProps> = ({ children }: ColProps) => <View style={styles.col}>{children}</View>;

type InfoItemProps = {
    title?: string;
    content?: string;
};
export const InfoItem: React.FC<InfoItemProps> = ({ title, content }: InfoItemProps) => (
    <View style={[styles.marginBottom, { flexDirection: 'row' }]}>
        <View style={[styles.flexGrow, { flex: '0 0 80' }]}>
            <Text>{title}:</Text>
        </View>
        <View style={styles.flexGrow}>
            <Text style={styles.bold}>{content}</Text>
        </View>
    </View>
);

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
