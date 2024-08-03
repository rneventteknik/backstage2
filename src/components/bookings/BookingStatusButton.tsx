import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { IBookingObjectionModel } from '../../models/objection-models';
import { Status } from '../../models/enums/Status';
import { Alert, Button, ButtonGroup, Dropdown, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import BookingForm from './BookingForm';
import { BookingType } from '../../models/enums/BookingType';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck as faCircleCheckRegular, faDotCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck as faCircleCheckSolid } from '@fortawesome/free-solid-svg-icons';
import { RentalStatus } from '../../models/enums/RentalStatus';

type Props = {
    booking: Partial<Booking>;
    onChange: (booking: Partial<IBookingObjectionModel>) => void;
    className?: string;
};

const BookingStatusButton: React.FC<Props> = ({ booking, onChange, className }: Props) => {
    const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);

    const changeStatusTo = (status: Status) => onChange({ status: status });

    const allEquipmentListsHaveDates =
        booking.equipmentLists?.every((list) => list.usageStartDatetime && list.usageEndDatetime) ?? false;

    switch (booking.status) {
        case Status.DRAFT:
            return (
                <>
                    <OverlayTrigger
                        placement="bottom"
                        overlay={
                            allEquipmentListsHaveDates ? (
                                <span />
                            ) : (
                                <Tooltip id="1">
                                    <strong>
                                        För att markera en bokning som bokad måste alla utrustningslistor ha datum
                                        konfigurerade.
                                    </strong>
                                </Tooltip>
                            )
                        }
                    >
                        <Dropdown as={ButtonGroup} className={className}>
                            <Button
                                variant="secondary"
                                onClick={() => setShowStatusChangeModal(true)}
                                disabled={!allEquipmentListsHaveDates}
                            >
                                <FontAwesomeIcon icon={faCircleCheckRegular} className="mr-1" /> Sätt till bokad
                            </Button>
                        </Dropdown>
                    </OverlayTrigger>
                    <BookingStatusModal
                        show={showStatusChangeModal}
                        hide={() => setShowStatusChangeModal(false)}
                        onChange={onChange}
                        booking={{ ...booking, status: Status.BOOKED }}
                    />
                </>
            );

        case Status.BOOKED:
            return (
                <>
                    <Dropdown as={ButtonGroup} className={className}>
                        <Button variant="secondary" onClick={() => setShowStatusChangeModal(true)}>
                            <FontAwesomeIcon icon={faCircleCheckSolid} className="mr-1" /> Klarmarkera
                        </Button>

                        <Dropdown.Toggle split variant="secondary" id="booking-status-dropdown" />

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => changeStatusTo(Status.DRAFT)}>
                                <FontAwesomeIcon icon={faDotCircle} className="mr-1" /> Gör till utkast
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <BookingStatusModal
                        show={showStatusChangeModal}
                        hide={() => setShowStatusChangeModal(false)}
                        onChange={onChange}
                        booking={{ ...booking, status: Status.DONE }}
                    />
                </>
            );

        case Status.CANCELED:
            return (
                <Dropdown as={ButtonGroup} className={className}>
                    <Button variant="secondary" onClick={() => changeStatusTo(Status.DRAFT)}>
                        <FontAwesomeIcon icon={faDotCircle} className="mr-1" /> Gör till utkast
                    </Button>
                </Dropdown>
            );
        default:
            return null;
    }
};

type BookingStatusModalProps = {
    booking: Partial<Booking>;
    onChange: (booking: Partial<IBookingObjectionModel>) => void;
    hide: () => void;
    show: boolean;
};

const BookingStatusModal: React.FC<BookingStatusModalProps> = ({
    booking,
    onChange,
    hide,
    show,
}: BookingStatusModalProps) => {
    const timeReports = booking.timeReports;
    const equipmentLists = booking.equipmentLists;

    const onSubmit = (booking: Partial<IBookingObjectionModel>) => {
        hide();
        onChange(booking);
    };
    return (
        <Modal show={show} onHide={hide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Verifiera bokningsinformationen</Modal.Title>
            </Modal.Header>
            <Modal.Body className="was-validated">
                {booking.status === Status.DONE &&
                booking.bookingType === BookingType.GIG &&
                timeReports &&
                timeReports.length === 0 ? (
                    <Alert variant="danger">
                        Den här bokningen har ingen tid rapporterad. Är du säker på att du vill klarmarkera den?
                    </Alert>
                ) : null}
                {booking.status === Status.DONE &&
                equipmentLists &&
                equipmentLists.some((x) => x.rentalStatus === RentalStatus.OUT) ? (
                    <Alert variant="danger">
                        Den här bokningen har utlämnad utrustning. Är du säker på att du vill klarmarkera den?
                    </Alert>
                ) : null}
                <BookingForm
                    booking={booking}
                    handleSubmitBooking={onSubmit}
                    formId="status-modal-booking-form"
                    disableStatusField={true}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Avbryt
                </Button>
                <Button variant="primary" form="status-modal-booking-form" type="submit">
                    Fortsätt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BookingStatusButton;
