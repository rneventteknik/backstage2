import React, { FormEvent } from 'react';
import { Modal, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { usersFetcher } from '../../../lib/fetchers';
import { toIntOrUndefined } from '../../../lib/utils';
import PriceWithVATPreview from '../../utils/PriceWithVATPreview';
import useSwr from 'swr';
import RequiredIndicator from '../../utils/RequiredIndicator';
import { BookingViewModel, TimeReport } from '../../../models/interfaces';
import { formatDatetimeForForm } from '../../../lib/datetimeUtils';
import { getNextSortIndex } from '../../../lib/sortIndexUtils';
import { ITimeReportObjectionModel } from '../../../models/objection-models';
import { formatNumberAsCurrency } from '../../../lib/pricingUtils';

type Props = {
    booking: BookingViewModel;
    timeReport?: Partial<TimeReport>;
    setTimeReport: (timeReport: Partial<TimeReport>) => void;
    defaultLaborHourlyRate: number;
    formId: string;
    readonly?: boolean;
    onSubmit: (timeReport: ITimeReportObjectionModel) => void;
    onHide: () => void;
};

const TimeReportModal: React.FC<Props> = ({
    booking,
    timeReport,
    setTimeReport,
    formId,
    defaultLaborHourlyRate,
    onSubmit,
    onHide,
    readonly = false,
}: Props) => {
    const { data: users } = useSwr('/api/users', usersFetcher);

    let calculatedWorkingHours = 0;
    if (timeReport?.startDatetime && timeReport.endDatetime) {
        calculatedWorkingHours = Math.round(
            (timeReport.endDatetime?.getTime() - timeReport?.startDatetime?.getTime()) / 1000 / 60 / 60,
        );
    }

    const handleHide = () => {
        onHide();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const userId = timeReport?.userId;

        if (userId === undefined) {
            return;
        }

        const timeReportToSend: ITimeReportObjectionModel = {
            id: timeReport?.id,
            bookingId: booking.id,
            billableWorkingHours: timeReport?.billableWorkingHours ?? calculatedWorkingHours,
            actualWorkingHours: timeReport?.actualWorkingHours ?? calculatedWorkingHours,
            userId: userId,
            startDatetime: timeReport?.startDatetime?.toISOString() ?? '',
            endDatetime: timeReport?.endDatetime?.toISOString() ?? '',
            pricePerHour: timeReport?.pricePerHour ?? 0,
            name: timeReport?.name ?? '',
            sortIndex: getNextSortIndex(booking.timeReports ?? []),
        };

        onSubmit(timeReportToSend);
        handleHide();
    };

    return (
        <Modal show={!!timeReport} onHide={() => handleHide()} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {readonly ? 'Visa tidsrapport' : timeReport?.id ? 'Redigera tidrapport' : 'Ny tidrapport'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} id={formId}>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>
                                    Beskrivning
                                    <RequiredIndicator />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    defaultValue={timeReport?.name}
                                    readOnly={readonly}
                                    onChange={(e) =>
                                        setTimeReport({
                                            ...timeReport,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                    Arbetet startade
                                    <RequiredIndicator />
                                </Form.Label>
                                <Form.Control
                                    defaultValue={formatDatetimeForForm(timeReport?.startDatetime)}
                                    type="datetime-local"
                                    required
                                    readOnly={readonly}
                                    onChange={(e) =>
                                        setTimeReport({
                                            ...timeReport,
                                            startDatetime: new Date(e.target.value),
                                        })
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                    Arbetet slutade
                                    <RequiredIndicator />
                                </Form.Label>
                                <Form.Control
                                    defaultValue={formatDatetimeForForm(timeReport?.endDatetime)}
                                    type="datetime-local"
                                    required
                                    readOnly={readonly}
                                    onChange={(e) =>
                                        setTimeReport({
                                            ...timeReport,
                                            endDatetime: new Date(e.target.value),
                                        })
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col md={4} xs={6}>
                            <Form.Group>
                                <Form.Label>
                                    Pris per timme (ex. moms)
                                    <RequiredIndicator />
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        required
                                        readOnly={readonly}
                                        defaultValue={timeReport?.pricePerHour}
                                        onChange={(e) =>
                                            setTimeReport({
                                                ...timeReport,
                                                pricePerHour: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text>kr/h</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                                <PriceWithVATPreview price={timeReport?.pricePerHour} />
                                {timeReport?.pricePerHour !== defaultLaborHourlyRate ? (
                                    <Form.Text className="text-muted">
                                        Standardpris för detta evenemang är:{' '}
                                        {formatNumberAsCurrency(defaultLaborHourlyRate)}/h
                                    </Form.Text>
                                ) : null}
                            </Form.Group>
                        </Col>
                        <Col md={4} xs={6}>
                            <Form.Group>
                                <Form.Label>Fakturerade timmar</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        defaultValue={timeReport?.billableWorkingHours}
                                        placeholder={calculatedWorkingHours.toString()}
                                        type="text"
                                        readOnly={readonly}
                                        onChange={(e) =>
                                            setTimeReport({
                                                ...timeReport,
                                                billableWorkingHours: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text>h</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Lämna fältet tomt för att beräknas från datum och tid.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={4} xs={6}>
                            <Form.Group>
                                <Form.Label>Arbetade timmar</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        defaultValue={timeReport?.actualWorkingHours}
                                        placeholder={calculatedWorkingHours.toString()}
                                        type="text"
                                        readOnly={readonly}
                                        onChange={(e) =>
                                            setTimeReport({
                                                ...timeReport,
                                                actualWorkingHours: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text>h</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    Lämna fältet tomt för att beräknas från datum och tid.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={4} xs={6}>
                            <Form.Group>
                                <Form.Label>
                                    Användare
                                    <RequiredIndicator />
                                </Form.Label>
                                <Form.Control
                                    as="select"
                                    defaultValue={timeReport?.userId}
                                    required
                                    readOnly={readonly}
                                    onChange={(e) =>
                                        setTimeReport({
                                            ...timeReport,
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
                    </Row>
                    <span className="text-muted">
                        Tidrapporter används för att fakturera kunden för arbetad tid. Vill du skapa en prisuppskattning
                        med personalkostnad i, använd tidsestimat istället.
                    </span>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {readonly ? (
                    <Button variant="primary" onClick={() => handleHide()}>
                        Stäng
                    </Button>
                ) : (
                    <>
                        <Button variant="secondary" onClick={() => handleHide()}>
                            Avbryt
                        </Button>
                        <Button form={formId} type="submit" variant="primary">
                            Spara
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};
export default TimeReportModal;
