import React from 'react';
import { Booking } from '../../models/interfaces';
import { Page, View, Text, Document } from '@react-pdf/renderer';
import { commonStyles } from '../utils';
import { BookingInfo } from './shared/bookingInfo';
import { PageCount } from './shared/pageCount';
import { Header } from './shared/header';
import { MainContent } from './shared/mainContent';
import { Footer } from './shared/footer';
import { useTextResources } from '../useTextResources';
import { TotalPriceSection } from './shared/totalPriceSection';
import { EquipmentListInfo } from './shared/equipmentListInfo';
import { TimeEstimateListInfo } from './shared/timeEstimateListInfo';
import { getSortedList } from '../../lib/sortIndexUtils';

type Props = {
    booking: Booking;
};

const styles = {
    ...commonStyles,
};

export const PriceEstimateDocument: React.FC<Props> = ({ booking }: Props) => {
    const { t } = useTextResources();

    return (
        <Document title={t('price-estimate.title')}>
            <Page size="A4" style={styles.page}>
                <PageCount />

                <Header title={t('price-estimate.title')} subTitle={booking.name} />
                <BookingInfo booking={booking} />

                <MainContent>
                    <View style={styles.flexGrow}>
                        {getSortedList(booking.equipmentLists ?? []).map((l) => (
                            <EquipmentListInfo list={l} booking={booking} key={l.id} />
                        ))}
                        <TimeEstimateListInfo booking={booking} />
                    </View>

                    <TotalPriceSection booking={booking} />
                    <Text style={styles.bold}>{t('price-estimate.legal-note.title')}</Text>
                    <Text>{t('price-estimate.legal-note.content')}</Text>
                </MainContent>

                <Footer booking={booking} />
            </Page>
        </Document>
    );
};
