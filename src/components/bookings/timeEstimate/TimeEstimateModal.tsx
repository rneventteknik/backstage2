import React, { FormEvent, useState } from 'react';
import { Modal, Col, Form, InputGroup, Button, Card } from 'react-bootstrap';
import { toIntOrUndefined } from '../../../lib/utils';
import PriceWithVATPreview from '../../utils/PriceWithVATPreview';
import RequiredIndicator from '../../utils/RequiredIndicator';
import { TimeEstimate } from '../../../models/interfaces';
import { formatNumberAsCurrency } from '../../../lib/pricingUtils';
import { Language } from '../../../models/enums/Language';
import { useLocalStorageState } from '../../../lib/useLocalStorageState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import currency from 'currency.js';

type Props = {
    timeEstimate?: Partial<TimeEstimate>;
    setTimeEstimate: (timeEstimate: Partial<TimeEstimate>) => void;
    defaultLaborHourlyRate: number;
    formId: string;
    readonly?: boolean;
    showWizard?: boolean;
    wizardLanguage?: Language;
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
    readonly = false,
    showWizard = true,
    wizardLanguage = Language.SV,
}: Props) => {
    const [wizardNumberOfTechnicians, setWizardNumberOfTechnicians] = useState('2');
    const [wizardStartHour, setWizardStartHour] = useState('');
    const [wizardEndHour, setWizardEndHour] = useState('');
    const [userHasClosedWizard, setUserHasClosedWizard] = useLocalStorageState('hide-time-estimate-wizard', false);

    const handleHide = () => {
        onHide();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
        handleHide();
    };

    const getTitle = () => {
        if (readonly) {
            return 'Visa tidsestimat';
        }

        if (!timeEstimate?.id) {
            return 'Nytt tidsestimat';
        }

        return 'Redigera tidsestimat';
    };

    const handleSubmitWizard = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const numberOfTechnicians = parseInt(wizardNumberOfTechnicians);
        const startHour = parseInt(wizardStartHour);
        const endHour = parseInt(wizardEndHour);

        const formattedStartHour = startHour.toString().padStart(2, '0');
        const formattedEndHour = endHour.toString().padStart(2, '0');
        const name =
            wizardLanguage === Language.SV
                ? `${numberOfTechnicians} tekniker (${formattedStartHour}:00-${formattedEndHour}:00)`
                : `${numberOfTechnicians} technicians (${formattedStartHour}:00-${formattedEndHour}:00)`;

        setTimeEstimate({
            name: name,
            numberOfHours: numberOfTechnicians * (startHour < endHour ? endHour - startHour : endHour - startHour + 24),
            pricePerHour: currency(defaultLaborHourlyRate),
        });
    };

    return (
        <Modal show={!!timeEstimate} onHide={() => handleHide()} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{getTitle()}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {showWizard ? (
                    <Card className="mb-3">
                        <Card.Body>
                            <div className="d-flex">
                                <strong className="flex-grow-1">Beräkna tidsestimat från klockslag</strong>
                                <Button
                                    className="mr-2"
                                    variant=""
                                    size="sm"
                                    onClick={() => setUserHasClosedWizard((x) => !x)}
                                >
                                    <FontAwesomeIcon icon={!userHasClosedWizard ? faAngleUp : faAngleDown} />
                                </Button>
                            </div>
                            {!userHasClosedWizard ? (
                                <Form onSubmit={handleSubmitWizard} id={formId + '-wizard'} inline>
                                    <Form.Control
                                        required
                                        defaultValue={wizardNumberOfTechnicians}
                                        placeholder="2"
                                        type="number"
                                        htmlSize={6}
                                        onChange={(e) => setWizardNumberOfTechnicians(e.target.value)}
                                        className="mr-2 mt-2"
                                        min={0}
                                    />

                                    <span className="mr-2 mt-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                                        tekniker mellan klockan
                                    </span>

                                    <Form.Control
                                        required
                                        defaultValue={wizardStartHour}
                                        placeholder="12"
                                        type="number"
                                        htmlSize={7}
                                        onChange={(e) => setWizardStartHour(e.target.value)}
                                        className="mr-2 mt-2"
                                        min={0}
                                        max={23}
                                    />

                                    <span className="mr-2 mt-2">och</span>

                                    <Form.Control
                                        required
                                        defaultValue={wizardEndHour}
                                        placeholder="03"
                                        type="number"
                                        htmlSize={7}
                                        onChange={(e) => setWizardEndHour(e.target.value)}
                                        className="mr-2 mt-2"
                                        min={0}
                                        max={23}
                                    />

                                    <Button
                                        form={formId + '-wizard'}
                                        type="submit"
                                        variant="secondary"
                                        className="mt-2"
                                        disabled={
                                            toIntOrUndefined(wizardNumberOfTechnicians) === undefined ||
                                            toIntOrUndefined(wizardStartHour) === undefined ||
                                            toIntOrUndefined(wizardEndHour) === undefined
                                        }
                                    >
                                        Beräkna
                                    </Button>
                                </Form>
                            ) : null}
                        </Card.Body>
                    </Card>
                ) : null}

                <Form onSubmit={handleSubmit} id={formId}>
                    <Form.Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>
                                    Beskrivning
                                    <RequiredIndicator />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    readOnly={readonly}
                                    value={timeEstimate?.name}
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
                                        value={timeEstimate?.numberOfHours}
                                        type="text"
                                        readOnly={readonly}
                                        onChange={(e) =>
                                            setTimeEstimate({
                                                ...timeEstimate,
                                                numberOfHours: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Text>h</InputGroup.Text>
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
                                        readOnly={readonly}
                                        value={timeEstimate?.pricePerHour?.value}
                                        onChange={(e) =>
                                            setTimeEstimate({
                                                ...timeEstimate,
                                                pricePerHour: currency(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Text>kr/h</InputGroup.Text>
                                </InputGroup>
                                <PriceWithVATPreview price={timeEstimate?.pricePerHour} />
                                {timeEstimate?.pricePerHour?.value !== defaultLaborHourlyRate ? (
                                    <Form.Text className="text-muted">
                                        Standardpris för detta evenemang är:{' '}
                                        {formatNumberAsCurrency(defaultLaborHourlyRate)}/h
                                    </Form.Text>
                                ) : null}
                            </Form.Group>
                        </Col>
                    </Form.Row>
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
export default TimeEstimateModal;
