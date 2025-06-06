import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { IBookingObjectionModel } from '../../models/objection-models';
import { Alert, Button } from 'react-bootstrap';
import { BookingType } from '../../models/enums/BookingType';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { RentalStatus } from '../../models/enums/RentalStatus';
import { PartialDeep } from 'type-fest';
import BookingReturnalNoteModal from './BookingReturnalNoteModal';
import ConfirmModal from '../utils/ConfirmModal';
import { Status } from '../../models/enums/Status';

type Props = {
    booking: Partial<Booking>;
    onChange: (booking: PartialDeep<IBookingObjectionModel, { recurseIntoArrays: true }>) => void;
    alwaysShowRentalControls: boolean;
    className?: string;
};

const BookingRentalStatusButton: React.FC<Props> = ({
    booking,
    onChange,
    className,
    alwaysShowRentalControls,
}: Props) => {
    const [showConfirmOutModal, setShowConfirmOutModal] = useState(false);
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

    if (
        booking.bookingType === BookingType.GIG &&
        !booking.equipmentLists?.some((list) => list.rentalStatus == RentalStatus.OUT) &&
        !alwaysShowRentalControls
    ) {
        return null;
    }

    if (booking.equipmentLists?.every((list) => list.rentalStatus === RentalStatus.RETURNED)) {
        return null;
    }

    if (booking.equipmentLists?.some((list) => list.rentalStatus == undefined)) {
        return (
            <>
                <Button variant="secondary" className={className} onClick={() => setShowConfirmOutModal(true)}>
                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-1" /> Lämna ut
                </Button>
                <ConfirmModal
                    show={showConfirmOutModal}
                    onHide={() => setShowConfirmOutModal(false)}
                    onConfirm={() => {
                        changeRentalStatusTo(RentalStatus.OUT);
                        setShowConfirmOutModal(false);
                    }}
                    title="Bekräfta"
                    confirmLabel="Lämna ut"
                    confirmButtonType="primary"
                >
                    {booking.status === Status.DRAFT ? (
                        <Alert variant="danger">
                            Är du säker på att du vill lämna ut bokningen {booking.name} trots att den är ett utkast?
                            Bokningar som lämnas ut bör vara bokade.
                        </Alert>
                    ) : (
                        <>Är du säker på att du vill lämna ut bokningen {booking.name}?</>
                    )}
                </ConfirmModal>
            </>
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
