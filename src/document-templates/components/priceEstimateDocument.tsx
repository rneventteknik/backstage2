import React from 'react';
import { Event } from '../../models/interfaces';
import { Page, View, Text, Document } from '@react-pdf/renderer';
import { commonStyles, getEventDocumentId } from '../utils';
import { EventInfo } from './shared/eventInfo';
import { PageCount } from './shared/pageCount';
import { Header } from './shared/header';
import { MainContent } from './shared/mainContent';
import { Footer } from './shared/footer';
import { useTextResources } from '../useTextResources';
import { TotalPriceSection } from './shared/totalPriceSection';
import { EquipmentListInfo } from './shared/equipmentListInfo';
import { TimeEstimateListInfo } from './shared/timeEstimateListInfo';

type Props = {
    event: Event;
};

const styles = {
    ...commonStyles,
};

export const PriceEstimateDocument: React.FC<Props> = ({ event }: Props) => {
    const { t } = useTextResources();

    return (
        <Document title={t('price-estimate.title')}>
            <Page size="A4" style={styles.page}>
                <PageCount />

                <Header title={t('price-estimate.title')} documentId={getEventDocumentId(event)} />
                <EventInfo event={event} />

                <MainContent>
                    <View style={styles.flexGrow}>
                        {event.equipmentLists?.map((l) => (
                            <EquipmentListInfo list={l} key={l.id} />
                        ))}
                        <TimeEstimateListInfo event={event} />
                        <TotalPriceSection event={event} />
                    </View>

                    <Text style={styles.bold}>{t('price-estimate.legal-note.title')}</Text>
                    <Text>{t('price-estimate.legal-note.content')}</Text>
                </MainContent>

                <Footer />
            </Page>
        </Document>
    );
};
