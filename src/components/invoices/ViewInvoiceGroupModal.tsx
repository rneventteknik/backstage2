import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { getResponseContentOrError } from '../../lib/utils';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import AdminBookingList from '../admin/AdminBookingList';
import { InvoiceGroup } from '../../models/interfaces/InvoiceGroup';
import {
    faCreditCard,
    faPaperPlane,
    faFileDownload,
    faPen,
    faTrashCan,
    faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { toBooking } from '../../lib/mappers/booking';
import { IBookingObjectionModel } from '../../models/objection-models';
import { useNotifications } from '../../lib/useNotifications';
import { formatDateForForm, toBookingViewModel, toDatetimeOrUndefined } from '../../lib/datetimeUtils';
import ConfirmModal from '../utils/ConfirmModal';
import EditTextModal from '../utils/EditTextModal';

type Props = {
    show: boolean;
    onHide: () => void;
    onMutate: () => void;
    invoiceGroup?: InvoiceGroup;
};

const ViewInvoiceGroupModal: React.FC<Props> = ({ show, onHide, onMutate, invoiceGroup }: Props) => {
    const [deSelectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [showChangeNameModal, setShowChangeNameModal] = useState(false);
    const [showSetInvoiceDateModal, setShowSetInvoiceDateModal] = useState(false);

    const {
        showSaveSuccessNotification,
        showSaveFailedNotification,
        showDeleteSuccessNotification,
        showDeleteFailedNotification,
    } = useNotifications();

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

    const setBookingInvoiceDates = (invoiceDate: Date | null, bookingIds: number[] | null = null) => {
        // If not bookings are specified, set status of all
        bookingIds = bookingIds ? bookingIds : invoiceGroup?.bookings?.map((b) => b.id) ?? [];

        bookingIds.forEach((bookingId) => {
            const body = {
                booking: {
                    id: bookingId,
                    invoiceDate: invoiceDate ? formatDateForForm(invoiceDate) : null,
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

    const setBookingInvoiceNumber = (invoiceNumber: string, bookingId: number) => {
        const body = {
            booking: {
                id: bookingId,
                invoiceNumber: invoiceNumber,
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
    };

    const deleteInvoiceGroup = (invoiceGroup: InvoiceGroup) => {
        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/invoiceGroups/' + invoiceGroup.id, request)
            .then(getResponseContentOrError)
            .then(() => {
                showDeleteSuccessNotification('Fakturaunderlagsgruppen');
                onMutate();
                onHide();
            })
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification('Fakturaunderlagsgruppen');
                onMutate();
            });
    };

    const updateInvoiceGroup = (invoiceGroup: Partial<InvoiceGroup>) => {
        const body = { invoiceGroup };
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/invoiceGroups/' + invoiceGroup.id, request)
            .then(getResponseContentOrError)
            .then(() => {
                showSaveSuccessNotification('Timarvodesunderlagsgruppen');
                onMutate();
            })
            .catch((error) => {
                console.error(error);
                showSaveFailedNotification('Timarvodesunderlagsgruppen');
                onMutate();
            });
    };

    const resetAndHide = () => {
        onHide();
        setSelectedBookingIds([]);
    };

    return (
        <>
            <Modal
                show={show && !showChangeNameModal && !showConfirmDeleteModal}
                onHide={() => resetAndHide()}
                size="xl"
            >
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
                                <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" /> Exportera
                                fakturaunderlag
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

                            <Button
                                variant="secondary"
                                className="mr-2 mb-2"
                                onClick={() => setShowSetInvoiceDateModal(true)}
                                disabled={deSelectedBookingIds.length === invoiceGroup.bookings?.length}
                            >
                                <FontAwesomeIcon icon={faCalendarDay} className="mr-2 fa-fw" />
                                Sätt fakturadatum
                            </Button>

                            <DropdownButton
                                id="dropdown-basic-button"
                                className="d-inline-block mb-2 align-middle"
                                variant="secondary"
                                title="Mer"
                            >
                                <Dropdown.Item onClick={() => setShowChangeNameModal(true)}>
                                    <FontAwesomeIcon icon={faPen} className="mr-1 fa-fw" /> Byt namn på
                                    fakturaunderlagsgrupp
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => setShowConfirmDeleteModal(true)} className="text-danger">
                                    <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort
                                    fakturaunderlagsgrupp
                                </Dropdown.Item>
                            </DropdownButton>

                            <AdminBookingList
                                bookings={invoiceGroup.bookings?.map(toBookingViewModel) ?? []}
                                selectedBookingIds={getSelectedBookingIds()}
                                onToggleSelect={toggleBookingSelection}
                                allowEditInvoiceNumber={true}
                                updateInvoiceNumber={(booking, newInvoiceNumber) =>
                                    setBookingInvoiceNumber(newInvoiceNumber, booking.id)
                                }
                                isDisabled={() => false}
                                tableSettingsOverride={{ hideTableFilter: true, hideTableCountControls: true }}
                            />
                        </>
                    ) : (
                        <Skeleton height={150} className="mb-3" />
                    )}
                </Modal.Body>
            </Modal>
            {invoiceGroup ? (
                <>
                    <EditTextModal
                        text={invoiceGroup.name}
                        onSubmit={(name) => updateInvoiceGroup({ id: invoiceGroup.id, name })}
                        hide={() => setShowChangeNameModal(false)}
                        show={showChangeNameModal}
                        modalTitle={'Byt namn'}
                        modalConfirmText={'Spara'}
                        textarea={false}
                    />
                    <EditTextModal
                        text={formatDateForForm(new Date())}
                        onSubmit={(invocieDateAsString) =>
                            setBookingInvoiceDates(
                                toDatetimeOrUndefined(invocieDateAsString) ?? null,
                                getSelectedBookingIds(),
                            )
                        }
                        hide={() => setShowSetInvoiceDateModal(false)}
                        show={showSetInvoiceDateModal}
                        modalTitle={'Sätt fakturadatum'}
                        modalConfirmText={'Spara'}
                        textarea={false}
                    />
                    <ConfirmModal
                        show={showConfirmDeleteModal}
                        onHide={() => setShowConfirmDeleteModal(false)}
                        onConfirm={() => {
                            deleteInvoiceGroup(invoiceGroup);
                            setShowConfirmDeleteModal(false);
                        }}
                        title="Bekräfta"
                        confirmLabel="Ta bort"
                        confirmButtonType="danger"
                    >
                        Är du säker på att du vill ta bort fakturaunderlagsgruppen {invoiceGroup.name}?
                    </ConfirmModal>
                </>
            ) : null}
        </>
    );
};

export default ViewInvoiceGroupModal;
