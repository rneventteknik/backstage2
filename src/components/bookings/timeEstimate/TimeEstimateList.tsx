import React, { useState } from 'react';
import { Card, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { TableDisplay, TableConfiguration } from '../../TableDisplay';
import { bookingFetcher } from '../../../lib/fetchers';
import useSwr from 'swr';
import { ITimeEstimateObjectionModel } from '../../../models/objection-models';
import { getResponseContentOrError } from '../../../lib/utils';
import { toTimeEstimate } from '../../../lib/mappers/timeEstimate';
import { TimeEstimate } from '../../../models/interfaces/TimeEstimate';
import { useNotifications } from '../../../lib/useNotifications';
import { DoubleClickToEdit } from '../../utils/DoubleClickToEdit';
import { PricePlan } from '../../../models/enums/PricePlan';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faExclamationCircle, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { formatNumberAsCurrency, getTimeEstimatePrice, getTotalTimeEstimatesPrice } from '../../../lib/pricingUtils';
import Skeleton from 'react-loading-skeleton';

type Props = {
    bookingId: number;
    pricePlan: number;
    readonly: boolean;
};

const TimeEstimateList: React.FC<Props> = ({ bookingId, pricePlan, readonly }: Props) => {
    const { data: booking, mutate, error } = useSwr('/api/bookings/' + bookingId, (url) => bookingFetcher(url));

    const [showListContent, setShowListContent] = useState(false);

    const { showCreateFailedNotification, showSaveFailedNotification, showDeleteFailedNotification } =
        useNotifications();

    // Extract the lists
    //
    const timeEstimates = booking?.timeEstimates;

    const mutateTimeEstimates = (updatedTimeEstimates: TimeEstimate[]) => {
        if (!booking) {
            throw new Error('Invalid booking');
        }
        mutate({ ...booking, timeEstimates: updatedTimeEstimates }, false);
    };

    // Error handling
    //
    if (error || (booking && !timeEstimates)) {
        return (
            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex">
                        <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                            Utrustning
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <p className="text-danger">
                        <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda tidsrapporterna.
                    </p>
                    <p className="text-monospace text-muted mb-0">{error?.message}</p>
                </Card.Body>
            </Card>
        );
    }

    // Loading skeleton
    //
    if (!booking || !timeEstimates) {
        return <Skeleton height={200} className="mb-3" />;
    }

    const addEmptyTimeEstimate = async () => {
        if (!process.env.NEXT_PUBLIC_SALARY_NORMAL)
            throw new Error('Configuration missing salary for the Normal price plan');

        if (!process.env.NEXT_PUBLIC_SALARY_THS) throw new Error('Configuration missing salary for the THS price plan');

        const pricePerHour =
            pricePlan == PricePlan.EXTERNAL
                ? process.env.NEXT_PUBLIC_SALARY_NORMAL
                : process.env.NEXT_PUBLIC_SALARY_THS;

        const timeEstimate: ITimeEstimateObjectionModel = {
            bookingId: bookingId,
            numberOfHours: 0,
            pricePerHour: isNaN(parseInt(pricePerHour)) ? 0 : parseInt(pricePerHour),
            name: '',
        };

        const body = { timeEstimate: timeEstimate };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + bookingId + '/timeEstimate', request)
            .then((apiResponse) => getResponseContentOrError<ITimeEstimateObjectionModel>(apiResponse))
            .then(toTimeEstimate)
            .then((data) => {
                mutateTimeEstimates([...(timeEstimates ?? []), data]);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Tidsestimatet');
            });
    };

    const updateTimeEstimate = (timeEstimate: TimeEstimate) => {
        const filteredtimeEstimates = timeEstimates?.map((x) => (x.id !== timeEstimate.id ? x : timeEstimate));

        mutateTimeEstimates(filteredtimeEstimates);

        const body = { timeEstimate: timeEstimate };
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        fetch('/api/bookings/' + timeEstimate.bookingId + '/timeEstimate/' + timeEstimate.id, request)
            .then((apiResponse) => getResponseContentOrError<ITimeEstimateObjectionModel>(apiResponse))
            .then(toTimeEstimate)
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Tidsuppskattningen');
            });
    };

    const deleteTimeEstimate = (timeEstimate: TimeEstimate) => {
        const filteredtimeEstimates = timeEstimates?.filter((x) => x.id !== timeEstimate.id);
        mutateTimeEstimates(filteredtimeEstimates);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/bookings/' + timeEstimate.bookingId + '/timeEstimate/' + timeEstimate?.id, request)
            .then(getResponseContentOrError)
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification('Tidsuppskattningen');
            });
    };

    const TimeEstimateNameDisplayFn = (timeEstimate: TimeEstimate) => (
        <DoubleClickToEdit
            value={timeEstimate.name}
            onUpdate={(newValue) =>
                updateTimeEstimate({
                    ...timeEstimate,
                    name: newValue && newValue.length > 0 ? newValue : timeEstimate.name,
                })
            }
            size="sm"
            readonly={readonly}
        >
            {timeEstimate && timeEstimate.name && timeEstimate.name.trim() && timeEstimate.name.trim().length > 0 ? (
                timeEstimate.name
            ) : (
                <span className="text-muted font-italic">Dubbelklicka för att lägga till en beskrivning</span>
            )}
        </DoubleClickToEdit>
    );

    const TimeEstimateNumberOfHoursDisplayFn = (timeEstimate: TimeEstimate) => (
        <DoubleClickToEdit
            value={timeEstimate.numberOfHours?.toString()}
            onUpdate={(newValue) =>
                updateTimeEstimate({
                    ...timeEstimate,
                    numberOfHours: isNaN(parseInt(newValue)) ? 0 : parseInt(newValue),
                })
            }
            size="sm"
            readonly={readonly}
        >
            {timeEstimate.numberOfHours ? (
                timeEstimate.numberOfHours + ' h'
            ) : (
                <span className="text-muted font-italic">Dubbelklicka för att lägga till en tid</span>
            )}
        </DoubleClickToEdit>
    );

    const TimeEstimatePricePerHourDisplayFn = (timeEstimate: TimeEstimate) => (
        <DoubleClickToEdit
            value={timeEstimate.pricePerHour?.toString()}
            onUpdate={(newValue) =>
                updateTimeEstimate({
                    ...timeEstimate,
                    pricePerHour: isNaN(parseInt(newValue)) ? 0 : parseInt(newValue),
                })
            }
            size="sm"
            readonly={readonly}
        >
            {timeEstimate.pricePerHour} kr/h
        </DoubleClickToEdit>
    );

    const TimeEstimateTotalPriceDisplayFn = (entry: TimeEstimate) => {
        return <em>{formatNumberAsCurrency(getTimeEstimatePrice(entry))}</em>;
    };

    const TimeEstimateEntryActionsDisplayFn = (entry: TimeEstimate) => {
        return (
            <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm" disabled={readonly}>
                <Dropdown.Item onClick={() => deleteTimeEstimate(entry)} className="text-danger">
                    <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort rad
                </Dropdown.Item>
            </DropdownButton>
        );
    };

    const tableSettings: TableConfiguration<TimeEstimate> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'price',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Beskrivning',
                getValue: (timeEstimate: TimeEstimate) => timeEstimate.name,
                getContentOverride: TimeEstimateNameDisplayFn,
            },
            {
                key: 'count',
                displayName: 'Antal',
                getValue: (timeEstimate: TimeEstimate) => timeEstimate.numberOfHours + ' h',
                getContentOverride: TimeEstimateNumberOfHoursDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
            },
            {
                key: 'price',
                displayName: 'A pris',
                getValue: (timeEstimate: TimeEstimate) => timeEstimate.pricePerHour + ' kr/h',
                getContentOverride: TimeEstimatePricePerHourDisplayFn,
                columnWidth: 140,
                textAlignment: 'right',
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (timeEstimate: TimeEstimate) => getTimeEstimatePrice(timeEstimate),
                getContentOverride: TimeEstimateTotalPriceDisplayFn,
                columnWidth: 90,
                textAlignment: 'right',
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                disableSort: true,
                getContentOverride: TimeEstimateEntryActionsDisplayFn,
                columnWidth: 75,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <Card className="mb-3">
            <Card.Header>
                <div className="d-flex">
                    <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                        Tidsuppskattning
                    </div>
                    <div className="d-flex">
                        <Button className="mr-2" variant="" onClick={() => setShowListContent(!showListContent)}>
                            <FontAwesomeIcon icon={showListContent ? faAngleUp : faAngleDown} />
                        </Button>
                    </div>
                </div>
                <p className="text-muted">
                    {timeEstimates.reduce((sum: number, entry: TimeEstimate) => sum + entry.numberOfHours, 0)} h /{' '}
                    {formatNumberAsCurrency(getTotalTimeEstimatesPrice(timeEstimates))}
                </p>
            </Card.Header>
            {showListContent ? (
                <>
                    <TableDisplay entities={timeEstimates} configuration={tableSettings} />
                    {readonly ? null : (
                        <Button className="ml-2 mr-2 mb-2" onClick={addEmptyTimeEstimate} variant="secondary" size="sm">
                            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Ny rad
                        </Button>
                    )}
                </>
            ) : null}
        </Card>
    );
};

export default TimeEstimateList;