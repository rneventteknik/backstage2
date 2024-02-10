import React from 'react';
import EditTextModal from '../utils/EditTextModal';

type Props = {
    returnalNote: string | undefined;
    onSubmit: (returnalNote: string) => void;
    onCancel?: () => void;
    hide: () => void;
    show: boolean;
};

const BookingReturnalNoteModal: React.FC<Props> = ({ returnalNote, onSubmit, onCancel, hide, show }: Props) => (
    <EditTextModal
        text={returnalNote}
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
