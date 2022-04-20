import React, { useState } from 'react';
import { Card, Button, DropdownButton, Dropdown, Modal, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { Alert } from 'react-bootstrap';
import ActivityIndicator from '../../components/utils/ActivityIndicator';
// import TimeReportForm from './TimeReportForm';
import { eventFetcher, timeReportsFetcher, usersFetcher } from '../../lib/fetchers';
import useSwr from 'swr';
import { ITimeReportObjectionModel } from '../../models/objection-models';
import {
    formatDate,
    getAccountKindName,
    getResponseContentOrError,
    toDateOrUndefined,
    toIntOrUndefined,
} from '../../lib/utils';
import { toTimeReport } from '../../lib/mappers/timeReport';
import { TimeReport } from '../../models/interfaces/TimeReport';
import { useNotifications } from '../../lib/useNotifications';
import { DoubleClickToEdit, DoubleClickToEditDate, DoubleClickToEditDropdown } from '../utils/DoubleClickToEdit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumberAsCurrency, getTimeReportPrice, getTotalTimeReportsPrice } from '../../lib/pricingUtils';
import { faAngleDown, faAngleUp, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../models/interfaces';
import { AccountKind } from '../../models/enums/AccountKind';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { getPricePerHour } from '../../lib/utils';

type Props = {
    eventId: number;
    pricePlan: number;
    currentUser: CurrentUserInfo;
    readonly: boolean;
};

const TimeReportList: React.FC<Props> = ({ eventId, pricePlan, currentUser, readonly }: Props) => {
    const [showListContent, setShowListContent] = useState(false);
    const [timeReportToEditViewModel, setTimeReportToEditViewModel] = useState<
        (Partial<TimeReport> & Pick<TimeReport, 'id' | 'eventId'>) | null
    >(null);

    const { showCreateFailedNotification, showSaveFailedNotification, showDeleteFailedNotification } =
        useNotifications();

    const {
        data: timeReports,
        error,
        isValidating,
        mutate,
    } = useSwr('/api/events/' + eventId + '/timeReport', timeReportsFetcher);

    const {
        data: eventData,
        error: eventError,
        isValidating: eventIsValidating,
    } = useSwr('/api/events/' + eventId, eventFetcher);

    const { data: users, isValidating: usersIsValidating } = useSwr('/api/users', usersFetcher);

    const addEmptyTimeReport = async () => {
        if (!currentUser.userId) {
            showCreateFailedNotification('Tidrapporten');
            return;
        }

        const pricePerHour = getPricePerHour(pricePlan);

        const timeReport: ITimeReportObjectionModel = {
            eventId: eventId,
            billableWorkingHours: 0,
            actualWorkingHours: 0,
            userId: currentUser.userId,
            startDatetime: formatDate(new Date()),
            endDatetime: formatDate(new Date()),
            pricePerHour: pricePerHour ?? 0,
            name: '',
            accountKind: 0,
        };

        const body = { timeReport: timeReport };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/events/' + eventId + '/timeReport', request)
            .then((apiResponse) => getResponseContentOrError<ITimeReportObjectionModel>(apiResponse))
            .then(toTimeReport)
            .then((data) => {
                mutate([...(timeReports ?? []), data]);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Tidrapporten');
            });
    };

    const updateTimeReport = (timeReport: TimeReport) => {
        const filteredtimeReports = timeReports?.map((x) => (x.id !== timeReport.id ? x : timeReport));

        mutate(filteredtimeReports, false);

        const body = { timeReport: timeReport };
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        fetch('/api/events/' + timeReport.eventId + '/timeReport/' + timeReport.id, request)
            .then((apiResponse) => getResponseContentOrError<ITimeReportObjectionModel>(apiResponse))
            .then(toTimeReport)
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Tidrapporten');
            });
    };

    const deleteTimeReport = (timeReport: TimeReport) => {
        const filteredtimeReports = timeReports?.filter((x) => x.id !== timeReport.id);
        mutate(filteredtimeReports, false);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/events/' + timeReport.eventId + '/timeReport/' + timeReport?.id, request)
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
        <DoubleClickToEditDate
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
        <DoubleClickToEditDate
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
                Ta bort rad
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setTimeReportToEditViewModel(entry)}>Avancerad redigering</Dropdown.Item>
        </DropdownButton>
    );

    const TimeReportSumDisplayFn = (entry: TimeReport) => {
        const getPricePerHourIfChanged = (timeReport: TimeReport) => {
            const pricePerHour = getPricePerHour(pricePlan);
            return timeReport.pricePerHour === pricePerHour
                ? ''
                : formatNumberAsCurrency(timeReport.pricePerHour) + '/h';
        };

        return (
            <>
                {formatNumberAsCurrency(getTimeReportPrice(entry))}
                <div className="text-muted font-italic mb-0">{getPricePerHourIfChanged(entry)}</div>
            </>
        );
    };

    const tableSettings: TableConfiguration<TimeReport> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
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
                    timeReport.startDatetime ? formatDate(timeReport.startDatetime) : '-',
                getContentOverride: TimeReportStartDatetimeDisplayFn,
                columnWidth: 150,
            },
            {
                key: 'endDatetime',
                displayName: 'Slut',
                getValue: (timeReport: TimeReport) =>
                    timeReport.endDatetime ? formatDate(timeReport.endDatetime) : '-',
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
                getValue: (timeReport: TimeReport) => formatNumberAsCurrency(getTimeReportPrice(timeReport)),
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

    if ((isValidating || eventIsValidating || usersIsValidating) && (!eventData || !timeReports || !users)) {
        return (
            <Card className="mb-3">
                <Card.Header>Tidrapport</Card.Header>
                <ActivityIndicator />
            </Card>
        );
    }
    if (error || !timeReports || eventError || !eventData) {
        return (
            <Card className="mb-3">
                <Card.Header>Tidrapportering</Card.Header>
                <Alert variant="danger">
                    <strong> Fel </strong> Tidrapporter kunde inte hämtas
                </Alert>
            </Card>
        );
    }

    return (
        <Card className="mb-3">
            <Card.Header>
                <div className="d-flex">
                    <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                        Tidrapportering
                    </div>
                    <div className="d-flex">
                        <Button className="mr-2" variant="" onClick={() => setShowListContent(!showListContent)}>
                            <FontAwesomeIcon icon={showListContent ? faAngleUp : faAngleDown} />
                        </Button>
                    </div>
                </div>
                <p className="text-muted">
                    {timeReports.reduce((sum, entry) => sum + entry.billableWorkingHours, 0)} h /{' '}
                    {formatNumberAsCurrency(getTotalTimeReportsPrice(timeReports))}
                </p>
            </Card.Header>
            {showListContent ? (
                <>
                    <TableDisplay entities={timeReports} configuration={tableSettings} />
                    {readonly ? null : (
                        <Button className="ml-2 mr-2 mb-2" onClick={addEmptyTimeReport} variant="secondary" size="sm">
                            <FontAwesomeIcon icon={faPlusCircle} /> Ny rad
                        </Button>
                    )}
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
                                            value={timeReportToEditViewModel?.billableWorkingHours}
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
                                            value={timeReportToEditViewModel.actualWorkingHours}
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
                                    <Form.Label>Pris per timme</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={timeReportToEditViewModel.pricePerHour}
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
                                        )
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
                                            timeReportToEditViewModel.startDatetime
                                                ? formatDate(timeReportToEditViewModel.startDatetime)
                                                : '-'
                                        }
                                        onChange={(e) =>
                                            setTimeReportToEditViewModel({
                                                ...timeReportToEditViewModel,
                                                startDatetime: toDateOrUndefined(e.target.value),
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
                                            timeReportToEditViewModel.endDatetime
                                                ? formatDate(timeReportToEditViewModel.endDatetime)
                                                : '-'
                                        }
                                        onChange={(e) =>
                                            setTimeReportToEditViewModel({
                                                ...timeReportToEditViewModel,
                                                endDatetime: toDateOrUndefined(e.target.value),
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
                                ...timeReportToEditViewModel,
                                userId: timeReportToEditViewModel.userId ?? 0,
                                accountKind: timeReportToEditViewModel.accountKind ?? AccountKind.INTERNAL,
                                name: timeReportToEditViewModel.name ?? '',
                                actualWorkingHours: timeReportToEditViewModel.actualWorkingHours ?? 0,
                                billableWorkingHours: timeReportToEditViewModel.billableWorkingHours ?? 0,
                                pricePerHour: timeReportToEditViewModel.pricePerHour ?? 0,
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
