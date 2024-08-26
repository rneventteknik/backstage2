import React from 'react';
import { Booking } from '../../models/interfaces';
import { Page, View, Text, Document, Link } from '@react-pdf/renderer';
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
import { KeyValue } from '../../models/interfaces/KeyValue';

type Props = {
    booking: Booking;
    globalSettings: KeyValue[];
};

const styles = {
    ...commonStyles,
};

export const PriceEstimateDocument: React.FC<Props> = ({ booking, globalSettings }: Props) => {
    const { t } = useTextResources();

    const showPrices = booking.fixedPrice === null;

    return (
        <Document title={t('price-estimate.title')}>
            <Page size="A4" style={styles.page}>
                <PageCount />

                <Header title={t('price-estimate.title')} subTitle={booking.name} globalSettings={globalSettings} />
                <BookingInfo booking={booking} />

                <MainContent>
                    <View style={styles.flexGrow}>
                        {getSortedList(booking.equipmentLists ?? []).map((l) => (
                            <EquipmentListInfo list={l} booking={booking} showPrices={showPrices} key={l.id} />
                        ))}
                        <TimeEstimateListInfo booking={booking} showPrices={showPrices} />
                    </View>

                    <TotalPriceSection
                        booking={booking}
                        showEquipmentCosts={showPrices}
                        showPersonnelCosts={showPrices}
                        priceByAgreement={!showPrices}
                    />
                    <Text style={styles.bold}>{t('price-estimate.legal-note.title')}</Text>
                    <Text>
                        {t('price-estimate.legal-note.content')}{' '}
                        <Link src={t('price-estimate.legal-note.url')}>{t('price-estimate.legal-note.shown-url')}</Link>
                    </Text>
                </MainContent>

                <Footer booking={booking} />
            </Page>
        </Document>
    );
};
