import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { IInvoiceGroupObjectionModel } from '../../models/objection-models/InvoiceGroupObjectionModel';
import useSwr from 'swr';
import { bookingsFetcher } from '../../lib/fetchers';
import { Button, Form, Modal } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { Status } from '../../models/enums/Status';
import { faEye, faEyeSlash, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PartialDeep } from 'type-fest';
import AdminBookingList from '../admin/AdminBookingList';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { formatDatetime, toBookingViewModel } from '../../lib/datetimeUtils';
import { getPaymentStatusName } from '../../lib/utils';

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
    const [allowAllBookings, setAllowAllBookings] = useState<boolean>(false);
    const [hideLockedBookings, setHideLockedBookings] = useState<boolean>(true);

    const { data: bookings } = useSwr('/api/bookings', bookingsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

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
        if (!allowAllBookings && (booking.paymentStatus !== PaymentStatus.NOT_PAID || booking.status !== Status.DONE)) {
            return true;
        }

        return false;
    };

    const toggleAllowAllBookings = () => {
        setAllowAllBookings((x) => !x);

        setSelectedBookingIds(
            selectedBookingIds
                .filter((id) => bookings?.find((b) => b.id === id)?.paymentStatus === PaymentStatus.NOT_PAID)
                .filter((id) => bookings?.find((b) => b.id === id)?.status === Status.DONE),
        );
    };

    const createGroup = () => {
        const group: PartialDeep<IInvoiceGroupObjectionModel, { recurseIntoArrays: true }> = {
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
                <Button onClick={toggleAllowAllBookings} variant="secondary" className="mr-2 mb-3">
                    <FontAwesomeIcon className="fa-fw mr-1" icon={allowAllBookings ? faLock : faLockOpen} />
                    {allowAllBookings ? 'Lås orelevanta' : 'Lås upp orelevanta'} bokningar
                </Button>
                <Button
                    onClick={() => setHideLockedBookings((x) => !x)}
                    variant="secondary"
                    className="mr-2 mb-3"
                    disabled={allowAllBookings}
                >
                    <FontAwesomeIcon className="fa-fw mr-1" icon={hideLockedBookings ? faEye : faEyeSlash} />
                    {hideLockedBookings ? 'Visa låsta' : 'Dölj låsta'} bokningar
                </Button>
                <Button
                    onClick={createGroup}
                    variant="primary"
                    className="mr-2 mb-3"
                    disabled={selectedBookingIds.length === 0}
                >
                    Skapa Fakturaunderlagsgrupp
                </Button>

                <p className="text-muted">
                    Relevanta bokningar syftar på klarmarkerade bokningar med betalningsstatus &quot;
                    {getPaymentStatusName(PaymentStatus.NOT_PAID)}&quot;, dvs de bokningar som ska betalas och där ingen
                    betalning är påbörjad eller slutförd. I listan nedan visas endast bokningar vars startdatum har
                    passerats, dvs inga bokningar framåt i tiden.
                </p>
                <AdminBookingList
                    bookings={bookings
                        .map(toBookingViewModel)
                        .filter((b) => !isDisabled(b) || !hideLockedBookings)
                        .filter((b) => b.usageStartDatetime && b.usageStartDatetime?.getTime() < Date.now())}
                    selectedBookingIds={selectedBookingIds}
                    onToggleSelect={toggleBookingSelection}
                    isDisabled={isDisabled}
                    showHeadings={true}
                />
                <Button onClick={createGroup} variant="primary" disabled={selectedBookingIds.length === 0}>
                    Skapa Fakturaunderlagsgrupp
                </Button>
            </Modal.Body>
        </Modal>
    );
};

export default CreateInvoiceGroupModal;
