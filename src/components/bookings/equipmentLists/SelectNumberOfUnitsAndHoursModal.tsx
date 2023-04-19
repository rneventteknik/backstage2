import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { toIntOrUndefined } from '../../../lib/utils';
import RequiredIndicator from '../../utils/RequiredIndicator';

type Props = {
    show: boolean;
    onHide: () => void;
    onSave: (numberOfUnits: number, hours: number) => void;
    showNumberOfUnits: boolean;
    showNumberOfHours: boolean;
    title: string;
};

const SelectNumberOfUnitsAndHoursModal: React.FC<Props> = ({
    show,
    onHide,
    onSave,
    showNumberOfUnits,
    showNumberOfHours,
    title,
}: Props) => {
    const [numberOfUnits, setNumberOfUnits] = useState<string>('1');
    const [numberOfHours, setNumberOfHours] = useState<string>(showNumberOfHours ? '1' : '0');

    const numberOfUnitsRef = useRef<HTMLInputElement>(null);
    const numberOfHoursRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (numberOfUnitsRef && numberOfUnitsRef.current && numberOfUnitsRef.current.select) {
            numberOfUnitsRef.current.select();
        } else if (numberOfHoursRef && numberOfHoursRef.current && numberOfHoursRef.current.select) {
            numberOfHoursRef.current.select();
        }
    }, [numberOfUnitsRef, numberOfHoursRef]);

    return (
        <Modal show={show} onHide={() => onHide()}>
            <Form>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showNumberOfUnits ? (
                        <Form.Group>
                            <Form.Label>
                                Antal
                                <RequiredIndicator />
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    ref={numberOfUnitsRef}
                                    value={numberOfUnits}
                                    onChange={(e) => setNumberOfUnits(e.target.value)}
                                />
                                <InputGroup.Append>
                                    <InputGroup.Text>st</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                        </Form.Group>
                    ) : null}
                    {showNumberOfHours ? (
                        <Form.Group>
                            <Form.Label>
                                Timmar
                                <RequiredIndicator />
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    ref={numberOfHoursRef}
                                    value={numberOfHours}
                                    onChange={(e) => setNumberOfHours(e.target.value)}
                                />
                                <InputGroup.Append>
                                    <InputGroup.Text>h</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                        </Form.Group>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => onHide()}>
                        Avbryt
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={
                            (showNumberOfUnits && toIntOrUndefined(numberOfUnits, true) === undefined) ||
                            (showNumberOfHours && toIntOrUndefined(numberOfHours, true) === undefined)
                        }
                        onClick={() => {
                            const numberOfUnitsNumber = toIntOrUndefined(numberOfUnits, true);
                            const numberOfHoursNumber = toIntOrUndefined(numberOfHours, true);

                            if (numberOfUnitsNumber === undefined || numberOfHoursNumber === undefined) {
                                throw new Error('Invalid state.');
                            }

                            onSave(numberOfUnitsNumber, numberOfHoursNumber);
                        }}
                    >
                        Lägg till
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default SelectNumberOfUnitsAndHoursModal;
