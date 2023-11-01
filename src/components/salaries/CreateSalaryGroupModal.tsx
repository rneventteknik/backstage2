import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { ISalaryGroupObjectionModel } from '../../models/objection-models/SalaryGroupObjectionModel';
import useSwr from 'swr';
import { bookingsFetcher } from '../../lib/fetchers';
import { Button, Form, Modal } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { Status } from '../../models/enums/Status';
import { faEye, faEyeSlash, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PartialDeep } from 'type-fest';
import AdminBookingList from '../admin/AdminBookingList';
import { formatDatetime, toBookingViewModel } from '../../lib/datetimeUtils';
import { SalaryStatus } from '../../models/enums/SalaryStatus';

type Props = {
    show: boolean;
    onHide: () => void;
    onCreate: (salaryGroup: PartialDeep<ISalaryGroupObjectionModel>) => void;
};

const CreateSalaryGroupModal: React.FC<Props> = ({ show, onHide, onCreate }: Props) => {
    const [selectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);
    const [selectedGroupName, setSelectedGroupName] = useState<string>(
        'Timarvodesunderlagsgrupp skapad ' + formatDatetime(new Date()),
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
        if (
            !allowAllBookings &&
            (booking.salaryStatus === SalaryStatus.SENT ||
                booking.status !== Status.DONE ||
                booking.timeReports?.every((x) => x.billableWorkingHours === 0))
        ) {
            return true;
        }

        return false;
    };

    const toggleAllowAllBookings = () => {
        setAllowAllBookings((x) => !x);

        setSelectedBookingIds(
            selectedBookingIds
                .filter((id) => bookings?.find((b) => b.id === id)?.salaryStatus === SalaryStatus.SENT)
                .filter((id) => bookings?.find((b) => b.id === id)?.status === Status.DONE)
                .filter(
                    (id) =>
                        !bookings?.find((b) => b.id === id)?.timeReports?.every((x) => x.billableWorkingHours === 0),
                ),
        );
    };

    const createGroup = () => {
        const group: PartialDeep<ISalaryGroupObjectionModel, { recurseIntoArrays: true }> = {
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
                <Modal.Title>Skapa Timarvodesunderlagsgrupp</Modal.Title>
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
                    {allowAllBookings ? 'Lås irrelevanta' : 'Lås upp irrelevanta'} bokningar
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
                    Skapa Löneunderlagsgrupp
                </Button>

                <p className="text-muted">
                    Relevanta bokningar syftar på klarmarkerade bokningar med tidsrapporter, vars timarvode inte är
                    skickat. I listan nedan visas endast bokningar vars startdatum har passerats, dvs inga bokningar
                    framåt i tiden.
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
                    Skapa Timarvodesunderlagsgrupp
                </Button>
            </Modal.Body>
        </Modal>
    );
};

export default CreateSalaryGroupModal;
