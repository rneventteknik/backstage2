import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { IBookingObjectionModel } from '../../models/objection-models';
import { Button } from 'react-bootstrap';
import { BookingType } from '../../models/enums/BookingType';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { RentalStatus } from '../../models/enums/RentalStatus';
import { PartialDeep } from 'type-fest';
import BookingReturnalNoteModal from './BookingReturnalNoteModal';

type Props = {
    booking: Partial<Booking>;
    onChange: (booking: PartialDeep<IBookingObjectionModel, { recurseIntoArrays: true }>) => void;
    className?: string;
};

const BookingRentalStatusButton: React.FC<Props> = ({ booking, onChange, className }: Props) => {
    const [showReturnalNoteModal, setShowReturnalNoteModal] = useState(false);

    const changeRentalStatusTo = (status: RentalStatus, returnalNote?: string) =>
        onChange({
            equipmentLists: booking.equipmentLists?.map((list) => ({
                id: list.id,
                rentalStatus: list.rentalStatus === RentalStatus.RETURNED ? RentalStatus.RETURNED : status,
            })),
            returnalNote: returnalNote
                ? returnalNote !== booking.returnalNote
                    ? returnalNote
                    : undefined
                : booking.returnalNote,
        });

    if (booking.bookingType === BookingType.GIG) {
        return null;
    }

    if (booking.equipmentLists?.every((list) => list.rentalStatus === RentalStatus.RETURNED)) {
        return null;
    }

    if (booking.equipmentLists?.some((list) => list.rentalStatus == undefined)) {
        return (
            <Button variant="secondary" className={className} onClick={() => changeRentalStatusTo(RentalStatus.OUT)}>
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-1" /> Lämna ut
            </Button>
        );
    }

    if (booking.equipmentLists?.some((list) => list.rentalStatus === RentalStatus.OUT)) {
        return (
            <>
                <Button variant="secondary" className={className} onClick={() => setShowReturnalNoteModal(true)}>
                    <FontAwesomeIcon icon={faRightToBracket} className="mr-1" /> Ta emot
                </Button>
                <BookingReturnalNoteModal
                    returnalNote={booking.returnalNote}
                    onSubmit={(returnalNote) => changeRentalStatusTo(RentalStatus.RETURNED, returnalNote)}
                    hide={() => setShowReturnalNoteModal(false)}
                    show={showReturnalNoteModal}
                />
            </>
        );
    }

    return null;
};

export default BookingRentalStatusButton;
