import React, { useState } from 'react';
import { Card, Button, DropdownButton, Dropdown, Modal, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { TableDisplay, TableConfiguration } from '../../TableDisplay';
import { bookingFetcher, usersFetcher } from '../../../lib/fetchers';
import useSwr from 'swr';
import { ITimeReportObjectionModel } from '../../../models/objection-models';
import { getAccountKindName, getResponseContentOrError, toIntOrUndefined } from '../../../lib/utils';
import {
    faAngleDown,
    faAngleUp,
    faExclamationCircle,
    faGears,
    faTrashCan,
    faStopwatch,
    faAdd,
} from '@fortawesome/free-solid-svg-icons';
import { TimeReport, User } from '../../../models/interfaces';
import { AccountKind } from '../../../models/enums/AccountKind';
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
import { DoubleClickToEdit, DoubleClickToEditDatetime, DoubleClickToEditDropdown } from '../../utils/DoubleClickToEdit';
import { getNextSortIndex, sortIndexSortFn } from '../../../lib/sortIndexUtils';
import { formatDatetime, validDate, toDatetimeOrUndefined } from '../../../lib/datetimeUtils';
import TimeReportAddButton from './TimeReportAddButton';
import PriceWithVATPreview from '../../utils/PriceWithVATPreview';

type Props = {
    bookingId: number;
    pricePlan: number;
    currentUser: CurrentUserInfo;
    readonly: boolean;
    showContent: boolean;
    setShowContent: (bol: boolean) => void;
    defaultLaborHourlyRate: number;
};

const TimeReportList: React.FC<Props> = ({
    bookingId,
    currentUser,
    readonly,
    showContent,
    setShowContent,
    defaultLaborHourlyRate,
}: Props) => {
    const { data: booking, mutate, error } = useSwr('/api/bookings/' + bookingId, (url) => bookingFetcher(url));
    const { data: users } = useSwr('/api/users', usersFetcher);

    const [timeReportToEditViewModel, setTimeReportToEditViewModel] = useState<
        | (Partial<TimeReport> &
              Pick<TimeReport, 'id' | 'bookingId'> & {
                  editedStartDatetimeString?: string;
                  editedEndDatetimeString?: string;
              })
        | null
    >(null);

    const { showSaveFailedNotification, showDeleteFailedNotification } = useNotifications();

    // Extract the lists
    //
    const timeReports = booking?.timeReports;

    const mutateTimeReports = (updatedTimeReports: TimeReport[]) => {
        if (!booking) {
            throw new Error('Invalid booking');
        }
        mutate({ ...booking, timeReports: updatedTimeReports }, false);
    };

    // Error handling
    //
    if (error || (booking && !timeReports)) {
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
    if (!booking || !timeReports) {
        return <Skeleton height={200} className="mb-3" />;
    }

    const updateTimeReport = (timeReport: TimeReport) => {
        const filteredTimeReports = timeReports?.map((x) => (x.id !== timeReport.id ? x : timeReport));

        mutateTimeReports(filteredTimeReports);

        const body = { timeReport: timeReport };
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        fetch('/api/bookings/' + timeReport.bookingId + '/timeReport/' + timeReport.id, request)
            .then((apiResponse) => getResponseContentOrError<ITimeReportObjectionModel>(apiResponse))
            .then(toTimeReport)
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Tidrapporten');
            });
    };

    const deleteTimeReport = (timeReport: TimeReport) => {
        const filteredTimeReports = timeReports?.filter((x) => x.id !== timeReport.id);
        mutateTimeReports(filteredTimeReports);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/bookings/' + timeReport.bookingId + '/timeReport/' + timeReport?.id, request)
            .then(getResponseContentOrError)
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification('Tidrapporten');
            });
    };

    const TimeReportNameDisplayFn = (timeReport: TimeReport) => (
        <DoubleClickToEdit
            value={timeReport.name}
            onUpdate={(newValue) =>
                updateTimeReport({
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
    );

    const TimeReportBillableWorkingHoursDisplayFn = (timeReport: TimeReport) => (
        <DoubleClickToEdit
            value={timeReport.billableWorkingHours?.toString()}
            onUpdate={(newValue) =>
                updateTimeReport({
                    ...timeReport,
                    billableWorkingHours: toIntOrUndefined(newValue) ?? 0,
                })
            }
            size="sm"
            readonly={readonly}
        >
            {timeReport.billableWorkingHours ? (
                timeReport.billableWorkingHours + ' h'
            ) : (
                <span className="text-muted font-italic">Dubbelklicka för att lägga till en tid</span>
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
                    ? updateTimeReport({
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
        </DoubleClickToEditDropdown>
    );

    const TimeReportStartDatetimeDisplayFn = (timeReport: TimeReport) => (
        <DoubleClickToEditDatetime
            value={timeReport.startDatetime}
            onUpdate={(newValue) =>
                updateTimeReport({
                    ...timeReport,
                    startDatetime: newValue,
                })
            }
            readonly={readonly}
        />
    );

    const TimeReportEndDatetimeDisplayFn = (timeReport: TimeReport) => (
        <DoubleClickToEditDatetime
            value={timeReport.endDatetime}
            onUpdate={(newValue) =>
                updateTimeReport({
                    ...timeReport,
                    endDatetime: newValue,
                })
            }
            readonly={readonly}
        />
    );

    const TimeReportEntryActionsDisplayFn = (entry: TimeReport) => (
        <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm" disabled={readonly}>
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

    const tableSettings: TableConfiguration<TimeReport> = {
        entityTypeDisplayName: '',
        defaultSortAscending: true,
        customSortFn: sortFn,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Beskrivning',
                getValue: (timeReport: TimeReport) => timeReport.name,
                getContentOverride: TimeReportNameDisplayFn,
                columnWidth: 100,
            },
            {
                key: 'userId',
                displayName: 'Användare',
                getValue: (timeReport: TimeReport) => timeReport.user?.name ?? '',
                getContentOverride: TimeReportUserIdDisplayFn,
                columnWidth: 20,
            },
            {
                key: 'startDatetime',
                displayName: 'Start',
                getValue: (timeReport: TimeReport) =>
                    timeReport.startDatetime ? formatDatetime(timeReport.startDatetime) : '-',
                getContentOverride: TimeReportStartDatetimeDisplayFn,
                columnWidth: 150,
            },
            {
                key: 'endDatetime',
                displayName: 'Slut',
                getValue: (timeReport: TimeReport) =>
                    timeReport.endDatetime ? formatDatetime(timeReport.endDatetime) : '-',
                getContentOverride: TimeReportEndDatetimeDisplayFn,
                columnWidth: 150,
            },
            {
                key: 'billableWorkingHours',
                displayName: 'Fakturerade timmar',
                getValue: (timeReport: TimeReport) => timeReport.billableWorkingHours + ' h',
                getContentOverride: TimeReportBillableWorkingHoursDisplayFn,
                textAlignment: 'right',
                columnWidth: 20,
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (timeReport: TimeReport) => formatNumberAsCurrency(addVAT(getTimeReportPrice(timeReport))),
                getContentOverride: TimeReportSumDisplayFn,
                textAlignment: 'right',
                columnWidth: 20,
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

    if (!timeReports.length) {
        return null;
    }

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
                        Tidrapportering
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
                    <TableDisplay entities={timeReports} configuration={tableSettings} />
                    <TimeReportAddButton
                        currentUser={currentUser}
                        disabled={readonly}
                        booking={booking}
                        sortIndex={getNextSortIndex(booking.timeReports ?? [])}
                        onAdd={onAdd}
                        className="ml-2 mr-2 mb-2"
                        variant="secondary"
                        size="sm"
                        icon={faAdd}
                        defaultLaborHourlyRate={defaultLaborHourlyRate}
                    >
                        Ny rad
                    </TimeReportAddButton>
                </>
            ) : null}
            <Modal show={!!timeReportToEditViewModel} onHide={() => setTimeReportToEditViewModel(null)} size="lg">
                {!!timeReportToEditViewModel ? (
                    <Modal.Body>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Namn</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={timeReportToEditViewModel?.name}
                                        onChange={(e) =>
                                            setTimeReportToEditViewModel({
                                                ...timeReportToEditViewModel,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Fakturerade timmar</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={timeReportToEditViewModel?.billableWorkingHours ?? ''}
                                            onChange={(e) =>
                                                setTimeReportToEditViewModel({
                                                    ...timeReportToEditViewModel,
                                                    billableWorkingHours: toIntOrUndefined(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>h</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Jobbade timmar</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={timeReportToEditViewModel.actualWorkingHours ?? ''}
                                            onChange={(e) =>
                                                setTimeReportToEditViewModel({
                                                    ...timeReportToEditViewModel,
                                                    actualWorkingHours: toIntOrUndefined(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>h</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Pris per timme (ex. moms)</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={timeReportToEditViewModel.pricePerHour ?? ''}
                                            onChange={(e) =>
                                                setTimeReportToEditViewModel({
                                                    ...timeReportToEditViewModel,
                                                    pricePerHour: toIntOrUndefined(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>kr/h</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <PriceWithVATPreview price={timeReportToEditViewModel.pricePerHour} />
                                </Form.Group>
                            </Col>
                            <Col md={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Konto</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="accountKind"
                                        defaultValue={timeReportToEditViewModel.accountKind}
                                        onChange={(e) =>
                                            setTimeReportToEditViewModel({
                                                ...timeReportToEditViewModel,
                                                accountKind: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    >
                                        {timeReportToEditViewModel.accountKind ? null : (
                                            <option value="">Välj kontotyp</option>
                                        )}
                                        <option value={AccountKind.EXTERNAL}>
                                            {getAccountKindName(AccountKind.EXTERNAL)}
                                        </option>
                                        <option value={AccountKind.INTERNAL}>
                                            {getAccountKindName(AccountKind.INTERNAL)}
                                        </option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Ansvarig medlem</Form.Label>
                                    <Form.Control
                                        as="select"
                                        defaultValue={timeReportToEditViewModel.userId}
                                        onChange={(e) =>
                                            setTimeReportToEditViewModel({
                                                ...timeReportToEditViewModel,
                                                userId: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    >
                                        <option value="">Inte tilldelat</option>
                                        {users?.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Start</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={
                                            timeReportToEditViewModel.editedStartDatetimeString ??
                                            (timeReportToEditViewModel.startDatetime
                                                ? formatDatetime(timeReportToEditViewModel.startDatetime)
                                                : '-')
                                        }
                                        onChange={(e) =>
                                            setTimeReportToEditViewModel({
                                                ...timeReportToEditViewModel,
                                                editedStartDatetimeString: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Slut</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={
                                            timeReportToEditViewModel.editedEndDatetimeString ??
                                            (timeReportToEditViewModel.endDatetime
                                                ? formatDatetime(timeReportToEditViewModel.endDatetime)
                                                : '-')
                                        }
                                        onChange={(e) =>
                                            setTimeReportToEditViewModel({
                                                ...timeReportToEditViewModel,
                                                editedEndDatetimeString: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                ) : null}
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setTimeReportToEditViewModel(null)}>
                        Avbryt
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (!timeReportToEditViewModel) {
                                throw new Error('Invalid timeReportToEditViewModel');
                            }

                            // Since we are editing a partial model we need to set default values to any properties without value before saving
                            const entryToSave: TimeReport = {
                                bookingId: timeReportToEditViewModel.bookingId,
                                id: timeReportToEditViewModel.id,
                                userId: timeReportToEditViewModel.userId ?? 0,
                                user: users?.find((x) => x.id === timeReportToEditViewModel.userId),
                                accountKind: timeReportToEditViewModel.accountKind ?? AccountKind.INTERNAL,
                                name: timeReportToEditViewModel.name ?? '',
                                actualWorkingHours: timeReportToEditViewModel.actualWorkingHours ?? 0,
                                billableWorkingHours: timeReportToEditViewModel.billableWorkingHours ?? 0,
                                pricePerHour: timeReportToEditViewModel.pricePerHour ?? 0,
                                startDatetime: timeReportToEditViewModel.editedStartDatetimeString
                                    ? validDate(
                                          toDatetimeOrUndefined(timeReportToEditViewModel.editedStartDatetimeString),
                                      )
                                        ? toDatetimeOrUndefined(timeReportToEditViewModel.editedStartDatetimeString)
                                        : undefined
                                    : timeReportToEditViewModel.startDatetime,
                                endDatetime: timeReportToEditViewModel.editedEndDatetimeString
                                    ? validDate(
                                          toDatetimeOrUndefined(timeReportToEditViewModel.editedEndDatetimeString),
                                      )
                                        ? toDatetimeOrUndefined(timeReportToEditViewModel.editedEndDatetimeString)
                                        : undefined
                                    : timeReportToEditViewModel.endDatetime,
                                sortIndex: timeReportToEditViewModel.sortIndex ?? 0,
                            };
                            updateTimeReport(entryToSave);
                            setTimeReportToEditViewModel(null);
                        }}
                    >
                        Spara
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default TimeReportList;
