import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { getResponseContentOrError } from '../../lib/utils';
import { Button, Modal } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import AdminBookingList from '../admin/AdminBookingList';
import { InvoiceGroup } from '../../models/interfaces/InvoiceGroup';
import { faCreditCard, faPaperPlane, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { toBooking } from '../../lib/mappers/booking';
import { IBookingObjectionModel } from '../../models/objection-models';
import { useNotifications } from '../../lib/useNotifications';
import { toBookingViewModel } from '../../lib/datetimeUtils';

type Props = {
    show: boolean;
    onHide: () => void;
    onMutate: () => void;
    invoiceGroup?: InvoiceGroup;
};

const ViewInvoiceGroupModal: React.FC<Props> = ({ show, onHide, onMutate, invoiceGroup }: Props) => {
    const [deSelectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);

    const { showSaveSuccessNotification, showSaveFailedNotification } = useNotifications();

    const toggleBookingSelection = (booking: Booking) => {
        if (deSelectedBookingIds.includes(booking.id)) {
            setSelectedBookingIds((ids) => ids.filter((x) => x !== booking.id));
            return;
        }

        setSelectedBookingIds((ids) => [...ids, booking.id]);
    };

    const getSelectedBookingIds = () =>
        invoiceGroup?.bookings?.map((b) => b.id).filter((id) => !deSelectedBookingIds.includes(id));

    const setBookingPaymentStatus = (paymentStatus: PaymentStatus, bookingIds: number[] | null = null) => {
        // If not bookings are specified, set status of all
        bookingIds = bookingIds ? bookingIds : invoiceGroup?.bookings?.map((b) => b.id) ?? [];

        bookingIds.forEach((bookingId) => {
            const body = {
                booking: {
                    id: bookingId,
                    paymentStatus: paymentStatus,
                },
            };

            const request = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            };

            fetch('/api/bookings/' + bookingId, request)
                .then((apiResponse) => getResponseContentOrError<IBookingObjectionModel>(apiResponse))
                .then(toBooking)
                .then(() => {
                    showSaveSuccessNotification('Bokningen');
                    onMutate();
                })
                .catch((error: Error) => {
                    console.error(error);
                    showSaveFailedNotification('Bokningen');
                });
        });
    };

    const resetAndHide = () => {
        onHide();
        setSelectedBookingIds([]);
    };

    return (
        <Modal show={show} onHide={() => resetAndHide()} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{invoiceGroup?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {invoiceGroup ? (
                    <>
                        <Button
                            variant="secondary"
                            className="d-inline-block mr-2 mb-2"
                            href={`/api/documents/invoice?${getSelectedBookingIds()
                                ?.map((id) => `bookingId=${id}`)
                                .join('&')}`}
                            target="_blank"
                            disabled={deSelectedBookingIds.length === invoiceGroup.bookings?.length}
                        >
                            <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" /> Exportera fakturaunderlag
                        </Button>

                        <Button
                            variant="secondary"
                            className="mr-2 mb-2"
                            onClick={() => setBookingPaymentStatus(PaymentStatus.INVOICED, getSelectedBookingIds())}
                            disabled={deSelectedBookingIds.length === invoiceGroup.bookings?.length}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} className="mr-2 fa-fw" />
                            Markera som fakturerade
                        </Button>

                        <Button
                            variant="secondary"
                            className="mr-2 mb-2"
                            onClick={() =>
                                setBookingPaymentStatus(PaymentStatus.PAID_WITH_INVOICE, getSelectedBookingIds())
                            }
                            disabled={deSelectedBookingIds.length === invoiceGroup.bookings?.length}
                        >
                            <FontAwesomeIcon icon={faCreditCard} className="mr-2 fa-fw" />
                            Markera som betalda
                        </Button>

                        <AdminBookingList
                            bookings={invoiceGroup.bookings?.map(toBookingViewModel) ?? []}
                            selectedBookingIds={getSelectedBookingIds()}
                            onToggleSelect={toggleBookingSelection}
                            isDisabled={() => false}
                            tableSettingsOverride={{ hideTableFilter: true, hideTableCountControls: true }}
                        />
                    </>
                ) : (
                    <Skeleton height={150} className="mb-3" />
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ViewInvoiceGroupModal;
