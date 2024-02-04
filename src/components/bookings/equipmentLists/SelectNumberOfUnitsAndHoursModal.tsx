import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Form, InputGroup, ListGroup, Modal } from 'react-bootstrap';
import useSwr from 'swr';
import { bookingsFetcher } from '../../../lib/fetchers';
import { getMaximumNumberOfUnitUsed, toIntOrUndefined } from '../../../lib/utils';
import { Status } from '../../../models/enums/Status';
import { Equipment } from '../../../models/interfaces';
import MarkdownCard from '../../MarkdownCard';
import RequiredIndicator from '../../utils/RequiredIndicator';
import { addVATToPriceWithTHS, formatPrice, formatTHSPrice } from '../../../lib/pricingUtils';
import { PricePlan } from '../../../models/enums/PricePlan';

type Props = {
    show: boolean;
    onHide: () => void;
    onSave: (numberOfUnits: number, hours: number, selectedPriceId?: number) => void;
    showNumberOfUnits: boolean;
    showNumberOfHours: boolean;
    title: string;
    equipment: Equipment;
    priceplan: PricePlan;
    startDatetime: Date | null;
    endDatetime: Date | null;
};

const SelectNumberOfUnitsAndHoursModal: React.FC<Props> = ({
    show,
    onHide,
    onSave,
    showNumberOfUnits,
    showNumberOfHours,
    title,
    equipment,
    priceplan,
    startDatetime,
    endDatetime,
}: Props) => {
    const [numberOfUnits, setNumberOfUnits] = useState<string>('1');
    const [numberOfHours, setNumberOfHours] = useState<string>(showNumberOfHours ? '1' : '0');
    const [selectedPriceId, setSelectedPriceId] = useState<number>();

    const numberOfUnitsRef = useRef<HTMLInputElement>(null);
    const numberOfHoursRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (numberOfUnitsRef && numberOfUnitsRef.current && numberOfUnitsRef.current.select) {
            numberOfUnitsRef.current.select();
        } else if (numberOfHoursRef && numberOfHoursRef.current && numberOfHoursRef.current.select) {
            numberOfHoursRef.current.select();
        }
    }, [numberOfUnitsRef, numberOfHoursRef]);

    useEffect(() => {
        setSelectedPriceId(equipment.prices[0].id);
    }, [equipment]);

    const { data: conflictData } = useSwr(
        startDatetime && endDatetime
            ? '/api/conflict-detection/booking-with-equipment?equipmentId=' +
                  equipment.id +
                  '&startDatetime=' +
                  startDatetime?.toISOString() +
                  '&endDatetime=' +
                  endDatetime?.toISOString()
            : null,
        bookingsFetcher,
    );

    // Filter bookings
    const bookings = conflictData?.filter((x) => x.status !== Status.CANCELED) ?? [];
    const overlappingEquipmentLists = bookings.flatMap((x) => x.equipmentLists ?? []);
    const numberOfUnitsUsed = getMaximumNumberOfUnitUsed(overlappingEquipmentLists, equipment);

    const getDescription = () => {
        if (!startDatetime || !endDatetime) {
            return null;
        }

        if (equipment.inventoryCount == null) {
            return `Totalt används ${numberOfUnitsUsed} den här tiden.`;
        }

        if (equipment.inventoryCount <= numberOfUnitsUsed) {
            return `Totalt finns ${equipment.inventoryCount} och alla används den här tiden.`;
        }

        if (equipment.inventoryCount && numberOfUnitsUsed === 0) {
            return `Totalt finns ${equipment.inventoryCount} och ingen används den här tiden.`;
        }

        return `Totalt finns ${equipment.inventoryCount} och ${numberOfUnitsUsed} används den här tiden.`;
    };

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
                            <Form.Text className="text-muted">{getDescription()}</Form.Text>
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
                    {equipment.prices && equipment.prices.length > 0 ? (
                        <Card className="mb-3">
                            <Card.Header>Prissättning (ink. moms)</Card.Header>
                            <ListGroup variant="flush">
                                {equipment.prices.map((p) => (
                                    <ListGroup.Item key={p.id}>
                                        <div className="d-flex flex-row align-items-center">
                                            <label htmlFor={'price-' + p.id} className="flex-grow-1 m-0">
                                                <span className="d-block">{p.name}</span>
                                                <span className="text-muted">
                                                    {priceplan === PricePlan.EXTERNAL
                                                        ? formatPrice(addVATToPriceWithTHS(p))
                                                        : formatTHSPrice(addVATToPriceWithTHS(p))}
                                                </span>
                                            </label>
                                            <Form.Check
                                                type="radio"
                                                id={'price-' + p.id}
                                                name="price"
                                                onChange={() => setSelectedPriceId(p.id)}
                                                checked={selectedPriceId === p.id}
                                            />
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    ) : null}
                    {startDatetime &&
                    endDatetime &&
                    equipment.inventoryCount &&
                    equipment.inventoryCount <= numberOfUnitsUsed ? (
                        <Alert variant="warning">
                            All utrustning av den här typen ({title}) används redan den här tiden.
                        </Alert>
                    ) : null}
                    {equipment.note && equipment.note.length > 0 ? (
                        <MarkdownCard
                            text={equipment.note}
                            readonly={true}
                            cardTitle="Utrustningsanteckningar"
                            onSubmit={() => false}
                        />
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

                            onSave(numberOfUnitsNumber, numberOfHoursNumber, selectedPriceId);
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
