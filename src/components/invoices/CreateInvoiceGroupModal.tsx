import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { IInvoiceGroupObjectionModel } from '../../models/objection-models/InvoiceGroupObjectionModel';
import useSwr from 'swr';
import { bookingsFetcher } from '../../lib/fetchers';
import { Button, Form, Modal } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { Status } from '../../models/enums/Status';
import { faCalendarDay, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PartialDeep } from 'type-fest';
import AdminBookingList from '../admin/AdminBookingList';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { formatDatetime, toBookingViewModel } from '../../lib/datetimeUtils';

type Props = {
    show: boolean;
    onHide: () => void;
    onCreate: (invoiceGroup: PartialDeep<IInvoiceGroupObjectionModel>) => void;
};

const CreateInvoiceGroupModal: React.FC<Props> = ({ show, onHide, onCreate }: Props) => {
    const [selectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);
    const [selectedGroupName, setSelectedGroupName] = useState<string>(
        'Fakturaunderlagsgrupp skapad ' + formatDatetime(new Date()),
    );
    const [allowInvoicedBookings, setAllowInvoicedBookings] = useState<boolean>(false);
    const [allowNotDoneBookings, setAllowNotDoneBookings] = useState<boolean>(false);

    const { data: bookings } = useSwr('/api/bookings', bookingsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const selectLastMonth = () => {
        const lastMonth = (new Date().getMonth() + 11) % 12;
        setSelectedBookingIds(
            bookings
                ?.map(toBookingViewModel)
                ?.filter((x) => !isDisabled(x))
                ?.filter((x) => x.usageStartDatetime && x.usageStartDatetime.getMonth() === lastMonth)
                .map((x) => x.id) ?? [],
        );
    };

    const toggleBookingSelection = (booking: Booking) => {
        if (selectedBookingIds.includes(booking.id)) {
            setSelectedBookingIds((ids) => ids.filter((x) => x !== booking.id));
            return;
        }

        if (isDisabled(booking)) {
            return;
        }

        setSelectedBookingIds((ids) => [...ids, booking.id]);
    };

    const isDisabled = (booking: Booking) => {
        if (!allowInvoicedBookings && booking.paymentStatus !== PaymentStatus.NOT_PAID) {
            return true;
        }

        if (!allowNotDoneBookings && booking.status !== Status.DONE) {
            return true;
        }

        return false;
    };

    const toggleAllowInvoicedBookings = () => {
        setAllowInvoicedBookings((x) => !x);

        setSelectedBookingIds(
            selectedBookingIds.filter(
                (id) => bookings?.find((b) => b.id === id)?.paymentStatus === PaymentStatus.NOT_PAID,
            ),
        );
    };

    const toggleNotDoneBookings = () => {
        setAllowNotDoneBookings((x) => !x);

        setSelectedBookingIds(
            selectedBookingIds.filter((id) => bookings?.find((b) => b.id === id)?.status === Status.DONE),
        );
    };

    const createGroup = () => {
        const group: PartialDeep<IInvoiceGroupObjectionModel> = {
            name: selectedGroupName,
            bookings: selectedBookingIds.map((id) => ({ id })),
        };

        onCreate(group);
        resetAndHide();
    };

    const resetAndHide = () => {
        onHide();
        setSelectedBookingIds([]);
    };

    if (!bookings) {
        return <Skeleton height={150} className="mb-3" />;
    }

    return (
        <Modal show={show} onHide={() => resetAndHide()} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Skapa Fakturaunderlagsgrupp</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formName">
                    <Form.Label>Namn</Form.Label>
                    <Form.Control
                        required={true}
                        type="text"
                        placeholder="Namn"
                        name="name"
                        value={selectedGroupName}
                        onChange={(e) => setSelectedGroupName(e.target.value)}
                    />
                </Form.Group>
                <Button onClick={selectLastMonth} variant="secondary" className="mr-2 mb-3">
                    <FontAwesomeIcon className="fa-fw mr-1" icon={faCalendarDay} />
                    Välj alla från förra månaden
                </Button>
                <Button onClick={toggleAllowInvoicedBookings} variant="secondary" className="mr-2 mb-3">
                    <FontAwesomeIcon className="fa-fw mr-1" icon={allowInvoicedBookings ? faLock : faLockOpen} />
                    {allowInvoicedBookings ? 'Lås' : 'Lås upp'} bokningar som redan är fakturerade eller betalda
                </Button>
                <Button onClick={toggleNotDoneBookings} variant="secondary" className="mr-2 mb-3">
                    <FontAwesomeIcon className="fa-fw mr-1" icon={allowNotDoneBookings ? faLock : faLockOpen} />
                    {allowNotDoneBookings ? 'Lås' : 'Lås upp'} bokningar som inte är klara
                </Button>
                <AdminBookingList
                    bookings={bookings
                        .map(toBookingViewModel)
                        .filter((b) => b.status === Status.DONE || b.status === Status.BOOKED)}
                    selectedBookingIds={selectedBookingIds}
                    onToggleSelect={toggleBookingSelection}
                    isDisabled={isDisabled}
                />
                <Button onClick={createGroup} variant="primary" disabled={selectedBookingIds.length === 0}>
                    Skapa Fakturaunderlagsgrupp
                </Button>
            </Modal.Body>
        </Modal>
    );
};

export default CreateInvoiceGroupModal;
