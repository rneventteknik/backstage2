import React from 'react';
import { Booking } from '../../models/interfaces';
import { Page, View, Document } from '@react-pdf/renderer';
import { commonStyles } from '../utils';
import { BookingInfo } from './shared/bookingInfo';
import { PageCount } from './shared/pageCount';
import { Header } from './shared/header';
import { MainContent } from './shared/mainContent';
import { Footer } from './shared/footer';
import { useTextResources } from '../useTextResources';
import { EquipmentListPackingInfo } from './shared/equipmentListPackingInfo';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { getSortedList } from '../../lib/sortIndexUtils';

type Props = {
    booking: Booking;
    globalSettings: KeyValue[];
    equipmentListId?: number;
};

const styles = {
    ...commonStyles,
};

export const PackingListDocument: React.FC<Props> = ({
    booking,
    globalSettings,
    equipmentListId: equipmentListId,
}: Props) => {
    const { t } = useTextResources();

    return (
        <Document title={t('packing-list.title')}>
            <Page size="A4" style={styles.page}>
                <PageCount />

                <Header
                    title={t('packing-list.title')}
                    subTitle={
                        equipmentListId === undefined
                            ? booking.name
                            : `${booking.name} - ${booking.equipmentLists?.find((l) => l.id === equipmentListId)?.name}`
                    }
                    globalSettings={globalSettings}
                />
                <BookingInfo booking={booking} />

                <MainContent>
                    <View style={styles.flexGrow}>
                        {getSortedList(booking.equipmentLists ?? [])
                            ?.filter((l) => equipmentListId === undefined || equipmentListId === l.id)
                            .map((l) => <EquipmentListPackingInfo list={l} booking={booking} key={l.id} />)}
                    </View>
                </MainContent>

                <Footer booking={booking} />
            </Page>
        </Document>
    );
};
