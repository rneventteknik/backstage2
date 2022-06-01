import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { IBookingObjectionModel } from '../../models/objection-models';
import { Status } from '../../models/enums/Status';
import { Alert, Button, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import BookingForm from './BookingForm';
import { BookingType } from '../../models/enums/BookingType';
import { timeReportsFetcher } from '../../lib/fetchers';
import useSwr from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck as faCircleCheckRegular, faTimesCircle, faDotCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck as faCircleCheckSolid } from '@fortawesome/free-solid-svg-icons';

type Props = {
    booking: Partial<Booking>;
    onChange: (booking: Partial<IBookingObjectionModel>) => void;
    className: string;
};

const BookingStatusButton: React.FC<Props> = ({ booking, onChange, className }: Props) => {
    const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);

    const changeStatusTo = (status: Status) => onChange({ status: status });

    switch (booking.status) {
        case Status.DRAFT:
            return (
                <>
                    <Dropdown as={ButtonGroup} className={className}>
                        <Button variant="dark" onClick={() => setShowStatusChangeModal(true)}>
                            <FontAwesomeIcon icon={faCircleCheckRegular} className="mr-1" /> Sätt till bokad
                        </Button>

                        <Dropdown.Toggle split variant="dark" id="booking-status-dropdown" />

                        <Dropdown.Menu>
                            <BookingStatusCancelButton onClick={() => changeStatusTo(Status.CANCELED)} />
                        </Dropdown.Menu>
                    </Dropdown>
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
                        <Button variant="dark" onClick={() => setShowStatusChangeModal(true)}>
                            <FontAwesomeIcon icon={faCircleCheckSolid} className="mr-1" /> Klarmarkera
                        </Button>

                        <Dropdown.Toggle split variant="dark" id="booking-status-dropdown" />

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => changeStatusTo(Status.DRAFT)}>
                                <FontAwesomeIcon icon={faDotCircle} className="mr-1" /> Gör till utkast
                            </Dropdown.Item>
                            <BookingStatusCancelButton onClick={() => changeStatusTo(Status.CANCELED)} />
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
                    <Button variant="dark" onClick={() => changeStatusTo(Status.DRAFT)}>
                        <FontAwesomeIcon icon={faDotCircle} className="mr-1" /> Gör till utkast
                    </Button>
                </Dropdown>
            );
        default:
            return null;
    }
};

type BookingStatusCancelButtonProps = {
    onClick: () => void;
};

const BookingStatusCancelButton: React.FC<BookingStatusCancelButtonProps> = ({
    onClick,
}: BookingStatusCancelButtonProps) => {
    return (
        <>
            <Dropdown.Item onClick={onClick}>
                <span className="text-danger">
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Ställ in bokningen
                </span>
            </Dropdown.Item>
        </>
    );
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
    const { data: timeReports } = useSwr('/api/bookings/' + booking.id + '/timeReport', timeReportsFetcher);

    const onSubmit = (booking: Partial<IBookingObjectionModel>) => {
        hide();
        onChange(booking);
    };
    return (
        <Modal show={show} onHide={hide} size="lg">
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
                <BookingForm
                    booking={booking}
                    handleSubmitBooking={onSubmit}
                    formId="status-modal-booking-form"
                    disableStatusField={true}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={hide}>
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
