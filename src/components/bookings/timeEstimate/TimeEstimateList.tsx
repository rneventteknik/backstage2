import React, { useState } from 'react';
import { Card, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { TableDisplay, TableConfiguration } from '../../TableDisplay';
import { bookingFetcher } from '../../../lib/fetchers';
import useSwr from 'swr';
import { ITimeEstimateObjectionModel } from '../../../models/objection-models';
import { getResponseContentOrError, toIntOrUndefined, updateItemsInArrayById } from '../../../lib/utils';
import { toTimeEstimate } from '../../../lib/mappers/timeEstimate';
import { TimeEstimate } from '../../../models/interfaces/TimeEstimate';
import { useNotifications } from '../../../lib/useNotifications';
import { DoubleClickToEdit } from '../../utils/DoubleClickToEdit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faAngleUp,
    faExclamationCircle,
    faTrashCan,
    faClock,
    faPlus,
    faGears,
} from '@fortawesome/free-solid-svg-icons';
import {
    addVAT,
    formatNumberAsCurrency,
    getTimeEstimatePrice,
    getTotalTimeEstimatesPrice,
} from '../../../lib/pricingUtils';
import Skeleton from 'react-loading-skeleton';
import {
    getNextSortIndex,
    isFirst,
    isLast,
    moveItemDown,
    moveItemToItem,
    moveItemUp,
    sortIndexSortFn,
} from '../../../lib/sortIndexUtils';
import TimeEstimateAddButton from './TimeEstimateAddButton';
import TimeEstimateModal from './TimeEstimateModal';

type Props = {
    bookingId: number;
    pricePlan: number;
    readonly: boolean;
    defaultLaborHourlyRate: number;
};

const TimeEstimateList: React.FC<Props> = ({ bookingId, readonly, defaultLaborHourlyRate }: Props) => {
    const { data: booking, mutate, error } = useSwr('/api/bookings/' + bookingId, (url) => bookingFetcher(url));

    const [timeEstimateToEditViewModel, setTimeEstimateToEditViewModel] = useState<Partial<TimeEstimate> | null>(null);
    const [showContent, setShowContent] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showDeleteFailedNotification } =
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
                        <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda tidsestimaten.
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

    const updateTimeEstimates = (...updatedTimeEstimates: TimeEstimate[]) => {
        mutateTimeEstimates(updateItemsInArrayById(timeEstimates, ...updatedTimeEstimates));

        Promise.all(
            updatedTimeEstimates.map(async (timeEstimate) => {
                const body = { timeEstimate: timeEstimate };
                const request = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                };
                return fetch('/api/bookings/' + timeEstimate.bookingId + '/timeEstimate/' + timeEstimate.id, request)
                    .then((apiResponse) => getResponseContentOrError<ITimeEstimateObjectionModel>(apiResponse))
                    .then(toTimeEstimate);
            }),
        )
            .then(() => {
                showSaveSuccessNotification('Tidsestimatet');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Tidsestimatet');
                mutate();
            });
    };

    const deleteTimeEstimate = (timeEstimate: TimeEstimate) => {
        const filteredTimeEstimates = timeEstimates?.filter((x) => x.id !== timeEstimate.id);
        mutateTimeEstimates(filteredTimeEstimates);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/bookings/' + timeEstimate.bookingId + '/timeEstimate/' + timeEstimate?.id, request)
            .then(getResponseContentOrError)
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification('Tidsestimatet');
            });
    };

    const TimeEstimateNameDisplayFn = (timeEstimate: TimeEstimate) => (
        <DoubleClickToEdit
            value={timeEstimate.name}
            onUpdate={(newValue) =>
                updateTimeEstimates({
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
                updateTimeEstimates({
                    ...timeEstimate,
                    numberOfHours: toIntOrUndefined(newValue) ?? timeEstimate.numberOfHours,
                })
            }
            size="sm"
            readonly={readonly}
        >
            {isNaN(timeEstimate.numberOfHours) ? (
                <span className="text-muted font-italic">Dubbelklicka för att lägga till en tid</span>
            ) : (
                timeEstimate.numberOfHours + ' h'
            )}
        </DoubleClickToEdit>
    );

    const TimeEstimateTotalPriceDisplayFn = (entry: TimeEstimate) => {
        return <em>{formatNumberAsCurrency(addVAT(getTimeEstimatePrice(entry)))}</em>;
    };

    const TimeEstimateEntryActionsDisplayFn = (entry: TimeEstimate) => {
        return (
            <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                {!readonly ? (
                    <>
                        <Dropdown.Item
                            onClick={() => updateTimeEstimates(...moveItemUp(timeEstimates, entry))}
                            disabled={isFirst(timeEstimates, entry)}
                        >
                            <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => updateTimeEstimates(...moveItemDown(timeEstimates, entry))}
                            disabled={isLast(timeEstimates, entry)}
                        >
                            <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => deleteTimeEstimate(entry)} className="text-danger">
                            <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort rad
                        </Dropdown.Item>
                    </>
                ) : null}
                <Dropdown.Item onClick={() => setTimeEstimateToEditViewModel(entry)}>
                    <FontAwesomeIcon icon={faGears} className="mr-1 fa-fw" />{' '}
                    {readonly ? 'Visa detaljer' : 'Avancerad redigering'}
                </Dropdown.Item>
            </DropdownButton>
        );
    };

    const sortFn = (a: TimeEstimate, b: TimeEstimate) => sortIndexSortFn(a, b);
    const moveFn = (a: TimeEstimate, b: TimeEstimate) => updateTimeEstimates(...moveItemToItem(timeEstimates, a, b));

    const tableSettings: TableConfiguration<TimeEstimate> = {
        entityTypeDisplayName: '',
        defaultSortAscending: true,
        customSortFn: sortFn,
        moveFn: readonly ? undefined : moveFn,
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
                displayName: 'Timmar',
                getValue: (timeEstimate: TimeEstimate) => timeEstimate.numberOfHours + ' h',
                getContentOverride: TimeEstimateNumberOfHoursDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (timeEstimate: TimeEstimate) => addVAT(getTimeEstimatePrice(timeEstimate)).value,
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

    const onAdd = async (data: TimeEstimate) => {
        setShowContent(true);
        mutateTimeEstimates([...(timeEstimates ?? []), data]);
    };

    return (
        <Card className="mb-3">
            <Card.Header>
                <div className="d-flex">
                    <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                        <FontAwesomeIcon className="mr-2" icon={faClock} />
                        Tidsestimat
                    </div>
                    <div className="d-flex">
                        <Button className="mr-2" variant="" onClick={() => setShowContent(!showContent)}>
                            <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                        </Button>
                    </div>
                </div>
                <p className="text-muted">
                    {formatNumberAsCurrency(addVAT(getTotalTimeEstimatesPrice(timeEstimates)))} /{' '}
                    {timeEstimates.reduce((sum: number, entry: TimeEstimate) => sum + entry.numberOfHours, 0)} h
                </p>
            </Card.Header>
            {showContent ? (
                <>
                    <TableDisplay entities={timeEstimates} configuration={tableSettings} tableId="time-estimate-list" />
                    {readonly ? null : (
                        <TimeEstimateAddButton
                            booking={booking}
                            disabled={readonly}
                            sortIndex={getNextSortIndex(timeEstimates)}
                            onAdd={onAdd}
                            variant="secondary"
                            size="sm"
                            defaultLaborHourlyRate={defaultLaborHourlyRate}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                            Nytt tidsestimat
                        </TimeEstimateAddButton>
                    )}
                </>
            ) : null}
            <TimeEstimateModal
                formId="form-edit-timeEstimate-modal"
                defaultLaborHourlyRate={defaultLaborHourlyRate}
                setTimeEstimate={setTimeEstimateToEditViewModel}
                timeEstimate={timeEstimateToEditViewModel ?? undefined}
                onHide={() => {
                    setTimeEstimateToEditViewModel(null);
                }}
                readonly={readonly}
                onSubmit={() => {
                    if (timeEstimateToEditViewModel?.id) {
                        const timeEstimateToSend: TimeEstimate = {
                            ...timeEstimateToEditViewModel,
                            id: timeEstimateToEditViewModel.id,
                            bookingId: booking.id,
                            numberOfHours: timeEstimateToEditViewModel?.numberOfHours ?? 0,
                            pricePerHour: timeEstimateToEditViewModel?.pricePerHour ?? 0,
                            name: timeEstimateToEditViewModel?.name ?? '',
                            sortIndex: getNextSortIndex(booking.timeEstimates ?? []),
                        };
                        updateTimeEstimates(timeEstimateToSend);
                    }
                }}
                showWizard={false}
            ></TimeEstimateModal>
        </Card>
    );
};

export default TimeEstimateList;
