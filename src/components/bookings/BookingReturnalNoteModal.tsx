import React from 'react';
import { Booking } from '../../models/interfaces';
import EditTextModal from '../utils/EditTextModal';

type Props = {
    booking: Partial<Booking>;
    onSubmit: (returnalNote: string) => void;
    onCancel?: () => void;
    hide: () => void;
    show: boolean;
};

const BookingReturnalNoteModal: React.FC<Props> = ({ booking, onSubmit, onCancel, hide, show }: Props) => (
    <EditTextModal
        text={booking.returnalNote}
        onSubmit={onSubmit}
        onCancel={onCancel}
        hide={hide}
        show={show}
        modalTitle={'Återlämningsanmärkning'}
        modalHelpText={'Notera eventuell saknad eller skadad utrustning i fältet ovan.'}
        modalConfirmText={'Markera som återlämnad'}
    />
);

export default BookingReturnalNoteModal;
