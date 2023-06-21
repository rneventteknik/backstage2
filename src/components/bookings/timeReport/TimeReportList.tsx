import React, { useState } from 'react';
import { Card, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { TableDisplay, TableConfiguration } from '../../TableDisplay';
import { bookingFetcher, usersFetcher } from '../../../lib/fetchers';
import useSwr from 'swr';
import { ITimeReportObjectionModel } from '../../../models/objection-models';
import { getResponseContentOrError, toIntOrUndefined, updateItemsInArrayById } from '../../../lib/utils';
import {
    faAngleDown,
    faAngleUp,
    faExclamationCircle,
    faGears,
    faTrashCan,
    faStopwatch,
    faAdd,
    faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { TimeReport, User } from '../../../models/interfaces';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import Skeleton from 'react-loading-skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toTimeReport } from '../../../lib/mappers/timeReport';
import {
    addVAT,
    formatNumberAsCurrency,
    getTimeReportPrice,
    getTotalTimeReportsPrice,
} from '../../../lib/pricingUtils';
import { useNotifications } from '../../../lib/useNotifications';
import { DoubleClickToEdit, DoubleClickToEditDropdown } from '../../utils/DoubleClickToEdit';
import {
    isFirst,
    isLast,
    moveItemDown,
    moveItemToItem,
    moveItemUp,
    sortIndexSortFn,
} from '../../../lib/sortIndexUtils';
import { formatDatetime, toBookingViewModel } from '../../../lib/datetimeUtils';
import TimeReportAddButton from './TimeReportAddButton';
import TimeReportModal from './TimeReportModal';

type Props = {
    bookingId: number;
    pricePlan: number;
    currentUser: CurrentUserInfo;
    readonly: boolean;
    defaultLaborHourlyRate: number;
};

const TimeReportList: React.FC<Props> = ({ bookingId, currentUser, readonly, defaultLaborHourlyRate }: Props) => {
    const { data: data, mutate, error } = useSwr('/api/bookings/' + bookingId, (url) => bookingFetcher(url));
    const { data: users } = useSwr('/api/users', usersFetcher);

    const [timeReportToEditViewModel, setTimeReportToEditViewModel] = useState<Partial<TimeReport> | null>(null);
    const [showContent, setShowContent] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showDeleteFailedNotification } =
        useNotifications();

    // Extract the lists
    //
    const timeReports = data?.timeReports;

    const mutateTimeReports = (updatedTimeReports: TimeReport[]) => {
        if (!booking) {
            throw new Error('Invalid booking');
        }
        mutate({ ...booking, timeReports: updatedTimeReports }, false);
    };

    // Error handling
    //
    if (error || (data && !timeReports)) {
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
    if (!data || !timeReports) {
        return <Skeleton height={200} className="mb-3" />;
    }

    const booking = toBookingViewModel(data);

    const updateTimeReports = (...updatedTimeReports: TimeReport[]) => {
        mutateTimeReports(updateItemsInArrayById(timeReports, ...updatedTimeReports));

        Promise.all(
            updatedTimeReports.map(async (timeReport) => {
                const body = { timeReport: timeReport };

                const request = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                };

                return fetch('/api/bookings/' + timeReport.bookingId + '/timeReport/' + timeReport.id, request)
                    .then((apiResponse) => getResponseContentOrError<ITimeReportObjectionModel>(apiResponse))
                    .then(toTimeReport);
            }),
        )
            .then(() => {
                showSaveSuccessNotification('Tidrapporten');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Tidrapporten');
                mutate();
            });
    };

    const deleteTimeReport = (timeReport: TimeReport) => {
        const filteredTimeReports = timeReports?.filter((x) => x.id !== timeReport.id);
        mutateTimeReports(filteredTimeReports);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/bookings/' + timeReport.bookingId + '/timeReport/' + timeReport.id, request)
            .then(getResponseContentOrError)
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification('Tidrapporten');
            });
    };

    const TimeReportSpecificationDisplayFn = (timeReport: TimeReport) => (
        <>
            <DoubleClickToEdit
                value={timeReport.name}
                onUpdate={(newValue) =>
                    updateTimeReports({
                        ...timeReport,
                        name: newValue && newValue.length > 0 ? newValue : timeReport.name,
                    })
                }
                size="sm"
                readonly={readonly}
            >
                {timeReport && timeReport.name && timeReport.name.trim() && timeReport.name.trim().length > 0 ? (
                    timeReport.name
                ) : (
                    <span className="text-muted font-italic">Dubbelklicka för att lägga till en beskrivning</span>
                )}
            </DoubleClickToEdit>
            {readonly ? (
                <p className="text-muted">
                    {formatDatetime(timeReport.startDatetime)} - {formatDatetime(timeReport.endDatetime)}
                </p>
            ) : (
                <p role="button" onClick={() => setTimeReportToEditViewModel(timeReport)} className="text-muted">
                    {formatDatetime(timeReport.startDatetime)} - {formatDatetime(timeReport.endDatetime)}
                </p>
            )}
        </>
    );

    const TimeReportBillableWorkingHoursDisplayFn = (timeReport: TimeReport) => (
        <DoubleClickToEdit
            value={timeReport.billableWorkingHours?.toString()}
            onUpdate={(newValue) =>
                updateTimeReports({
                    ...timeReport,
                    billableWorkingHours: toIntOrUndefined(newValue) ?? timeReport.billableWorkingHours,
                })
            }
            size="sm"
            readonly={readonly}
        >
            {isNaN(timeReport.billableWorkingHours) ? (
                <span className="text-muted font-italic">Dubbelklicka för att lägga till en tid</span>
            ) : (
                timeReport.billableWorkingHours + ' h'
            )}
        </DoubleClickToEdit>
    );

    const TimeReportUserIdDisplayFn = (timeReport: TimeReport) => (
        <DoubleClickToEditDropdown<User | undefined>
            value={timeReport.user}
            options={users ?? []}
            optionLabelFn={(x) => x?.name ?? 'Ingen användare konfigurerad'}
            optionKeyFn={(x) => x?.id.toString() ?? ''}
            onChange={(newValue) =>
                newValue
                    ? updateTimeReports({
                          ...timeReport,
                          userId: newValue.id,
                          user: newValue,
                      })
                    : null
            }
            readonly={readonly}
        >
            {timeReport.user?.name ?? (
                <span className="text-muted font-italic">Dubbelklicka för att välja användare</span>
            )}
            <div className="mb-0 text-muted d-md-none">{timeReport.billableWorkingHours + ' h'}</div>
            <div className="mb-0 text-muted d-md-none">
                {formatNumberAsCurrency(addVAT(getTimeReportPrice(timeReport)))}
            </div>
        </DoubleClickToEditDropdown>
    );

    const TimeReportEntryActionsDisplayFn = (entry: TimeReport) => (
        <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm" disabled={readonly}>
            <Dropdown.Item
                onClick={() => updateTimeReports(...moveItemUp(timeReports, entry))}
                disabled={isFirst(timeReports, entry)}
            >
                <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
            </Dropdown.Item>
            <Dropdown.Item
                onClick={() => updateTimeReports(...moveItemDown(timeReports, entry))}
                disabled={isLast(timeReports, entry)}
            >
                <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => deleteTimeReport(entry)} className="text-danger">
                <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort rad
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setTimeReportToEditViewModel(entry)}>
                <FontAwesomeIcon icon={faGears} className="mr-1 fa-fw" /> Avancerad redigering
            </Dropdown.Item>
        </DropdownButton>
    );

    const TimeReportSumDisplayFn = (entry: TimeReport) => {
        const getPricePerHourIfNotDefault = (timeReport: TimeReport) => {
            return timeReport.pricePerHour === defaultLaborHourlyRate
                ? ''
                : formatNumberAsCurrency(addVAT(timeReport.pricePerHour)) + '/h';
        };

        return (
            <>
                {formatNumberAsCurrency(addVAT(getTimeReportPrice(entry)))}
                <div className="text-muted font-italic mb-0">{getPricePerHourIfNotDefault(entry)}</div>
            </>
        );
    };

    const sortFn = (a: TimeReport, b: TimeReport) => sortIndexSortFn(a, b);
    const moveFn = (a: TimeReport, b: TimeReport) => updateTimeReports(...moveItemToItem(timeReports, a, b));

    const tableSettings: TableConfiguration<TimeReport> = {
        entityTypeDisplayName: '',
        defaultSortAscending: true,
        customSortFn: sortFn,
        moveFn: readonly ? undefined : moveFn,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'userId',
                displayName: 'Användare',
                getValue: (timeReport: TimeReport) => timeReport.user?.name ?? '',
                getContentOverride: TimeReportUserIdDisplayFn,
                columnWidth: 150,
            },
            {
                key: 'specification',
                displayName: 'Beskrivning',
                getValue: (timeReport: TimeReport) =>
                    timeReport.startDatetime ? formatDatetime(timeReport.startDatetime) : '-',
                getContentOverride: TimeReportSpecificationDisplayFn,
            },
            {
                key: 'billableWorkingHours',
                displayName: 'Fakturerade timmar',
                getValue: (timeReport: TimeReport) => timeReport.billableWorkingHours + ' h',
                getContentOverride: TimeReportBillableWorkingHoursDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
                cellHideSize: 'md',
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (timeReport: TimeReport) => formatNumberAsCurrency(addVAT(getTimeReportPrice(timeReport))),
                getContentOverride: TimeReportSumDisplayFn,
                textAlignment: 'right',
                columnWidth: 20,
                cellHideSize: 'md',
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                disableSort: true,
                getContentOverride: TimeReportEntryActionsDisplayFn,
                columnWidth: 20,
                textAlignment: 'center',
            },
        ],
    };

    const onAdd = async (data: TimeReport) => {
        setShowContent(true);
        mutateTimeReports([...(timeReports ?? []), data]);
    };

    return (
        <Card className="mb-3">
            <Card.Header>
                <div className="d-flex">
                    <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                        <FontAwesomeIcon className="mr-2" icon={faStopwatch} />
                        Tidrapporter
                    </div>
                    <div className="d-flex">
                        <Button className="mr-2" variant="" onClick={() => setShowContent(!showContent)}>
                            <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                        </Button>
                    </div>
                </div>
                <p className="text-muted">
                    {formatNumberAsCurrency(addVAT(getTotalTimeReportsPrice(timeReports)))} /{' '}
                    {timeReports.reduce((sum, entry) => sum + entry.billableWorkingHours, 0)} h
                </p>
            </Card.Header>
            {showContent ? (
                <>
                    <TableDisplay entities={timeReports} configuration={tableSettings} tableId="time-report-list" />
                    {readonly ? null : (
                        <TimeReportAddButton
                            currentUser={currentUser}
                            disabled={readonly}
                            booking={booking}
                            onAdd={onAdd}
                            className="ml-2 mr-2 mb-2"
                            variant="secondary"
                            size="sm"
                            icon={faAdd}
                            defaultLaborHourlyRate={defaultLaborHourlyRate}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                            Ny tidrapport
                        </TimeReportAddButton>
                    )}
                </>
            ) : null}
            <TimeReportModal
                formId="form-edit-timeReport-modal"
                booking={booking}
                defaultLaborHourlyRate={defaultLaborHourlyRate}
                setTimeReport={setTimeReportToEditViewModel}
                timeReport={timeReportToEditViewModel ?? undefined}
                onHide={() => {
                    setTimeReportToEditViewModel(null);
                }}
                onSubmit={(timeReport) => {
                    const tr: TimeReport = {
                        ...toTimeReport(timeReport),
                        user: users?.find((x) => x.id === timeReport.userId),
                    };
                    updateTimeReports(tr);
                }}
            ></TimeReportModal>
        </Card>
    );
};

export default TimeReportList;
