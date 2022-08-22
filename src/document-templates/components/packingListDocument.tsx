import React from 'react';
import { Booking } from '../../models/interfaces';
import { Page, View, Document } from '@react-pdf/renderer';
import { commonStyles, getBookingDocumentId } from '../utils';
import { BookingInfo } from './shared/bookingInfo';
import { PageCount } from './shared/pageCount';
import { Header } from './shared/header';
import { MainContent } from './shared/mainContent';
import { Footer } from './shared/footer';
import { useTextResources } from '../useTextResources';
import { EquipmentListPackingInfo } from './shared/equipmentListPackingInfo';

type Props = {
    booking: Booking;
};

const styles = {
    ...commonStyles,
};

export const PackingListDocument: React.FC<Props> = ({ booking }: Props) => {
    const { t } = useTextResources();

    return (
        <Document title={t('packing-list.title')}>
            <Page size="A4" style={styles.page}>
                <PageCount />

                <Header title={t('packing-list.title')} documentId={getBookingDocumentId(booking)} />
                <BookingInfo booking={booking} />

                <MainContent>
                    <View style={styles.flexGrow}>
                        {booking.equipmentLists?.map((l) => (
                            <EquipmentListPackingInfo list={l} booking={booking} key={l.id} />
                        ))}
                    </View>
                </MainContent>

                <Footer />
            </Page>
        </Document>
    );
};
