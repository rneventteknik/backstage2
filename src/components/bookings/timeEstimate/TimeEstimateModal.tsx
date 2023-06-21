import React, { FormEvent } from 'react';
import { Modal, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { toIntOrUndefined } from '../../../lib/utils';
import PriceWithVATPreview from '../../utils/PriceWithVATPreview';
import RequiredIndicator from '../../utils/RequiredIndicator';
import { TimeEstimate } from '../../../models/interfaces';
import { formatNumberAsCurrency } from '../../../lib/pricingUtils';

type Props = {
    timeEstimate?: Partial<TimeEstimate>;
    setTimeEstimate: (timeEstimate: Partial<TimeEstimate>) => void;
    defaultLaborHourlyRate: number;
    formId: string;
    onSubmit: () => void;
    onHide: () => void;
};

const TimeEstimateModal: React.FC<Props> = ({
    timeEstimate,
    setTimeEstimate,
    formId,
    defaultLaborHourlyRate,
    onSubmit,
    onHide,
}: Props) => {
    const handleHide = () => {
        onHide();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
        handleHide();
    };

    return (
        <Modal show={!!timeEstimate} onHide={() => handleHide()} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{timeEstimate?.id ? 'Redigera tidsestimat' : 'Nytt tidsestimat'}</Modal.Title>
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
                                    defaultValue={timeEstimate?.name}
                                    onChange={(e) =>
                                        setTimeEstimate({
                                            ...timeEstimate,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} xs={6}>
                            <Form.Group>
                                <Form.Label>
                                    Antal timmar
                                    <RequiredIndicator />
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        required
                                        defaultValue={timeEstimate?.numberOfHours}
                                        type="text"
                                        onChange={(e) =>
                                            setTimeEstimate({
                                                ...timeEstimate,
                                                numberOfHours: toIntOrUndefined(e.target.value),
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
                                <Form.Label>
                                    Pris per timme (ex. moms)
                                    <RequiredIndicator />
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        required
                                        defaultValue={timeEstimate?.pricePerHour}
                                        onChange={(e) =>
                                            setTimeEstimate({
                                                ...timeEstimate,
                                                pricePerHour: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text>kr/h</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                                <PriceWithVATPreview price={timeEstimate?.pricePerHour} />
                                {timeEstimate?.pricePerHour !== defaultLaborHourlyRate ? (
                                    <Form.Text className="text-muted">
                                        Standardpris för detta evenemang är:{' '}
                                        {formatNumberAsCurrency(defaultLaborHourlyRate)}/h
                                    </Form.Text>
                                ) : null}
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => handleHide()}>
                    Avbryt
                </Button>
                <Button form={formId} type="submit" variant="primary">
                    Spara
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
export default TimeEstimateModal;
