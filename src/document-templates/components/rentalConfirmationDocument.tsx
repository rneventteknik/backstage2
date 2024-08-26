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
import { getSortedList } from '../../lib/sortIndexUtils';
import { EquipmentListInfo } from './shared/equipmentListInfo';
import { TimeEstimateListInfo } from './shared/timeEstimateListInfo';
import { TotalPriceSection } from './shared/totalPriceSection';
import { Col, Row } from './shared/utils';
import { Signature } from './shared/signature';
import { getTotalTimeEstimatesPrice } from '../../lib/pricingUtils';
import { KeyValue } from '../../models/interfaces/KeyValue';

type Props = {
    booking: Booking;
    globalSettings: KeyValue[];
};

const styles = {
    ...commonStyles,
};

export const RentalConfirmationDocument: React.FC<Props> = ({ booking, globalSettings }: Props) => {
    const { t } = useTextResources();

    const showPrices = booking.fixedPrice === null;
    const showPersonnelCosts = getTotalTimeEstimatesPrice(booking.timeEstimates).value !== 0 && showPrices;

    return (
        <Document title={t('rental-agreement.title')}>
            <Page size="A4" style={styles.page}>
                <PageCount />

                <Header title={t('rental-agreement.title')} subTitle={booking.name} globalSettings={globalSettings} />

                <BookingInfo booking={booking} />

                <MainContent>
                    <View style={styles.flexGrow}>
                        {getSortedList(booking.equipmentLists ?? []).map((l) => (
                            <EquipmentListInfo list={l} booking={booking} key={l.id} showPrices={showPrices} />
                        ))}
                        {showPersonnelCosts ? <TimeEstimateListInfo booking={booking} showPrices={showPrices} /> : null}
                    </View>
                    <TotalPriceSection
                        booking={booking}
                        showPersonnelCosts={showPersonnelCosts}
                        showEquipmentCosts={showPrices}
                        priceByAgreement={!showPrices}
                    />
                    <View wrap={false}>
                        <Text style={[styles.bold, styles.marginTopLarge]}>
                            {t('rental-agreement.legal-note.title')}
                        </Text>
                        <Text>
                            {t('rental-agreement.legal-note.content')}{' '}
                            <Link src={t('rental-agreement.legal-note.url')}>
                                {t('rental-agreement.legal-note.url')}
                            </Link>
                        </Text>

                        <View>
                            <Row>
                                <Col>
                                    <Signature label={t('rental-agreement.signature.1')} />
                                </Col>
                                <Col>
                                    <Signature label={t('rental-agreement.signature.2')} />
                                </Col>
                                <Col>
                                    <Signature label={t('rental-agreement.signature.3')} />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Signature label={t('rental-agreement.signature.4')} />
                                </Col>
                                <Col>
                                    <Signature label={t('rental-agreement.signature.5')} />
                                </Col>
                                <Col>
                                    <Signature label={t('rental-agreement.signature.6')} light />
                                </Col>
                            </Row>
                        </View>
                    </View>
                </MainContent>

                <Footer booking={booking} />
            </Page>
        </Document>
    );
};
