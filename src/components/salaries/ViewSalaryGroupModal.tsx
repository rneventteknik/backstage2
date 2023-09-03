import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { getResponseContentOrError } from '../../lib/utils';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import AdminBookingList from '../admin/AdminBookingList';
import { SalaryGroup } from '../../models/interfaces/SalaryGroup';
import { faPaperPlane, faFileDownload, faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toBooking } from '../../lib/mappers/booking';
import { IBookingObjectionModel } from '../../models/objection-models';
import { useNotifications } from '../../lib/useNotifications';
import { toBookingViewModel } from '../../lib/datetimeUtils';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import ConfirmModal from '../utils/ConfirmModal';
import EditTextModal from '../utils/EditTextModal';

type Props = {
    show: boolean;
    onHide: () => void;
    onMutate: () => void;
    salaryGroup?: SalaryGroup;
};

const ViewSalaryGroupModal: React.FC<Props> = ({ show, onHide, onMutate, salaryGroup }: Props) => {
    const [deSelectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [showChangeNameModal, setShowChangeNameModal] = useState(false);

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
        salaryGroup?.bookings?.map((b) => b.id).filter((id) => !deSelectedBookingIds.includes(id));

    const setBookingSalaryStatus = (salaryStatus: SalaryStatus, bookingIds: number[] | null = null) => {
        // If not bookings are specified, set status of all
        bookingIds = bookingIds ? bookingIds : salaryGroup?.bookings?.map((b) => b.id) ?? [];

        bookingIds.forEach((bookingId) => {
            const body = {
                booking: {
                    id: bookingId,
                    salaryStatus: salaryStatus,
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

    const deleteSalaryGroup = (salaryGroup: SalaryGroup) => {
        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/salaryGroups/' + salaryGroup.id, request)
            .then(getResponseContentOrError)
            .then(() => {
                showDeleteSuccessNotification('Löneunderlagsgruppen');
                onMutate();
                onHide();
            })
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification('Löneunderlagsgruppen');
                onMutate();
            });
    };

    const updateSalaryGroup = (salaryGroup: Partial<SalaryGroup>) => {
        const body = { salaryGroup };
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/salaryGroups/' + salaryGroup.id, request)
            .then(getResponseContentOrError)
            .then(() => {
                showSaveSuccessNotification('Löneunderlagsgruppen');
                onMutate();
            })
            .catch((error) => {
                console.error(error);
                showSaveFailedNotification('Löneunderlagsgruppen');
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
                    <Modal.Title>{salaryGroup?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {salaryGroup ? (
                        <>
                            <Button
                                variant="secondary"
                                className="d-inline-block mr-2 mb-2"
                                href={`/api/documents/salary-report/${salaryGroup.id}?${getSelectedBookingIds()
                                    ?.map((id) => `bookingId=${id}`)
                                    .join('&')}`}
                                target="_blank"
                                disabled={deSelectedBookingIds.length === salaryGroup.bookings?.length}
                            >
                                <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" /> Exportera löneunderlag
                            </Button>

                            <Button
                                variant="secondary"
                                className="mr-2 mb-2"
                                onClick={() => setBookingSalaryStatus(SalaryStatus.SENT, getSelectedBookingIds())}
                                disabled={deSelectedBookingIds.length === salaryGroup.bookings?.length}
                            >
                                <FontAwesomeIcon icon={faPaperPlane} className="mr-2 fa-fw" />
                                Markera lön som skickad
                            </Button>

                            <DropdownButton
                                id="dropdown-basic-button"
                                className="d-inline-block mb-2 align-middle"
                                variant="secondary"
                                title="Mer"
                            >
                                <Dropdown.Item onClick={() => setShowChangeNameModal(true)}>
                                    <FontAwesomeIcon icon={faPen} className="mr-1 fa-fw" /> Byt namn på
                                    löneunderlagsgrupp
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => setShowConfirmDeleteModal(true)} className="text-danger">
                                    <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort
                                    löneunderlagsgrupp
                                </Dropdown.Item>
                            </DropdownButton>

                            <AdminBookingList
                                bookings={salaryGroup.bookings?.map(toBookingViewModel) ?? []}
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
            {salaryGroup ? (
                <>
                    <EditTextModal
                        text={salaryGroup.name}
                        onSubmit={(name) => updateSalaryGroup({ id: salaryGroup.id, name })}
                        hide={() => setShowChangeNameModal(false)}
                        show={showChangeNameModal}
                        modalTitle={'Byt namn'}
                        modalConfirmText={'Spara'}
                        textarea={false}
                    />
                    <ConfirmModal
                        show={showConfirmDeleteModal}
                        onHide={() => setShowConfirmDeleteModal(false)}
                        onConfirm={() => {
                            deleteSalaryGroup(salaryGroup);
                            setShowConfirmDeleteModal(false);
                        }}
                        title="Bekräfta"
                        confirmLabel="Ta bort"
                        confirmButtonType="danger"
                    >
                        Är du säker på att du vill ta bort löneunderlagsgruppen {salaryGroup.name}?
                    </ConfirmModal>
                </>
            ) : null}
        </>
    );
};

export default ViewSalaryGroupModal;
