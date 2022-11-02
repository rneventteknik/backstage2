import React from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { toIntOrUndefined } from '../../../lib/utils';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FormNumberFieldWithoutScroll } from '../../utils/FormNumberFieldWithoutScroll';
import { EquipmentPrice } from '../../../models/interfaces';

type Props = {
    show: boolean;
    onHide: () => void;
    priceDisplayFn: (price: EquipmentPrice) => string;
    getEquipmentListEntryPrices: (equipmentPrice: EquipmentPrice) => {
        pricePerHour: number;
        pricePerUnit: number;
        equipmentPrice: EquipmentPrice;
    };
    equipmentListEntryToEditViewModel: Partial<EquipmentListEntry> | null;
    setEquipmentListEntryToEditViewModel: React.Dispatch<React.SetStateAction<Partial<EquipmentListEntry> | null>>;
    onSave: (entryToSave: EquipmentListEntry, isNew: boolean) => void;
    nextId: number;
    nextSortIndex: number;
};

const EditEquipmentListEntryModal: React.FC<Props> = ({
    show,
    onHide,
    equipmentListEntryToEditViewModel,
    setEquipmentListEntryToEditViewModel,
    priceDisplayFn,
    getEquipmentListEntryPrices,
    nextId,
    nextSortIndex,
    onSave,
}: Props) => {
    return (
        <Modal show={show} onHide={() => onHide()} size="lg">
            {!!equipmentListEntryToEditViewModel ? (
                <Modal.Body>
                    <Row>
                        <Col lg={4}>
                            <Form.Group>
                                <Form.Label>Namn</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={equipmentListEntryToEditViewModel?.name}
                                    onChange={(e) =>
                                        setEquipmentListEntryToEditViewModel({
                                            ...equipmentListEntryToEditViewModel,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col lg={4} xs={6}>
                            <Form.Group>
                                <Form.Label>Antal</Form.Label>
                                <InputGroup>
                                    <FormNumberFieldWithoutScroll
                                        type="number"
                                        min="0"
                                        value={equipmentListEntryToEditViewModel?.numberOfUnits ?? ''}
                                        onChange={(e) =>
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                numberOfUnits: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text>st</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col lg={4} xs={6}>
                            <Form.Group>
                                <Form.Label>Timmar</Form.Label>
                                <InputGroup>
                                    <FormNumberFieldWithoutScroll
                                        type="number"
                                        min="0"
                                        value={equipmentListEntryToEditViewModel.numberOfHours ?? ''}
                                        onChange={(e) =>
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
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
                    </Row>
                    {equipmentListEntryToEditViewModel.isHidden ? null : (
                        <Row>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>Pris</Form.Label>

                                    <Form.Control
                                        as="select"
                                        disabled={!equipmentListEntryToEditViewModel.equipment}
                                        defaultValue={equipmentListEntryToEditViewModel.equipmentPrice?.id}
                                        onChange={(e) => {
                                            const newEquipmentPrice =
                                                equipmentListEntryToEditViewModel.equipment?.prices.filter(
                                                    (x) => x.id == toIntOrUndefined(e.target.value),
                                                )[0];
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                ...(newEquipmentPrice
                                                    ? getEquipmentListEntryPrices(newEquipmentPrice)
                                                    : { equipmentPrice: undefined }),
                                            });
                                        }}
                                    >
                                        <option value={undefined}>Anpassat pris</option>
                                        {equipmentListEntryToEditViewModel.equipment?.prices?.map((x) => (
                                            <option key={x.id.toString()} value={x.id.toString()}>
                                                {x.name} {priceDisplayFn(x)}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Pris per styck</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={!equipmentListEntryToEditViewModel.equipmentPrice ? 'number' : 'text'}
                                            min="0"
                                            disabled={!!equipmentListEntryToEditViewModel.equipmentPrice}
                                            value={equipmentListEntryToEditViewModel?.pricePerUnit ?? ''}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    pricePerUnit: toIntOrUndefined(e.target.value, true),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>kr/st</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Pris per timme</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={!equipmentListEntryToEditViewModel.equipmentPrice ? 'number' : 'text'}
                                            min="0"
                                            disabled={!!equipmentListEntryToEditViewModel.equipmentPrice}
                                            value={equipmentListEntryToEditViewModel?.pricePerHour ?? ''}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    pricePerHour: toIntOrUndefined(e.target.value, true),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>kr/h</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                    <Row>
                        <Col lg={4} xs={6}>
                            <Form.Group>
                                <Form.Label>Rabatt</Form.Label>
                                <InputGroup>
                                    <FormNumberFieldWithoutScroll
                                        type="number"
                                        min="0"
                                        value={equipmentListEntryToEditViewModel?.discount ?? ''}
                                        onChange={(e) =>
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                discount: toIntOrUndefined(e.target.value, true),
                                            })
                                        }
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text>kr</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="formPrices">
                                <Form.Label>Beskrivning</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    value={equipmentListEntryToEditViewModel?.description}
                                    onChange={(e) =>
                                        setEquipmentListEntryToEditViewModel({
                                            ...equipmentListEntryToEditViewModel,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {!!equipmentListEntryToEditViewModel.equipment ? (
                        <p className="text-muted">
                            <span>
                                <FontAwesomeIcon icon={faLink} className="mr-1" size="sm" />
                                Den här raden är länkad till utrustningen{' '}
                                <em>{equipmentListEntryToEditViewModel.equipment.name}</em>.{' '}
                            </span>
                            <a
                                href="#"
                                className="text-danger"
                                onClick={() =>
                                    setEquipmentListEntryToEditViewModel({
                                        ...equipmentListEntryToEditViewModel,
                                        equipment: undefined,
                                        equipmentId: undefined,
                                        equipmentPrice: undefined,
                                    })
                                }
                            >
                                Ta bort koppling
                            </a>
                        </p>
                    ) : null}
                </Modal.Body>
            ) : null}
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setEquipmentListEntryToEditViewModel(null)}>
                    Avbryt
                </Button>
                <Button
                    variant="primary"
                    disabled={!equipmentListEntryToEditViewModel?.name}
                    onClick={() => {
                        if (!equipmentListEntryToEditViewModel) {
                            throw new Error('Invalid equipmentListEntryToEditViewModel');
                        }

                        // Since we are editing a partial model we need to set default values to any properties without value before saving
                        const entryToSave: EquipmentListEntry = {
                            id: equipmentListEntryToEditViewModel.id ?? nextId,
                            sortIndex: equipmentListEntryToEditViewModel.sortIndex ?? nextSortIndex,
                            equipment: equipmentListEntryToEditViewModel.equipment,
                            equipmentId: equipmentListEntryToEditViewModel.equipmentId,
                            name: equipmentListEntryToEditViewModel.name ?? '',
                            description: equipmentListEntryToEditViewModel.description ?? '',
                            numberOfUnits: Math.abs(equipmentListEntryToEditViewModel.numberOfUnits ?? 1),
                            numberOfHours: Math.abs(equipmentListEntryToEditViewModel.numberOfHours ?? 0),
                            pricePerUnit: Math.abs(equipmentListEntryToEditViewModel.pricePerUnit ?? 0),
                            pricePerHour: Math.abs(equipmentListEntryToEditViewModel.pricePerHour ?? 0),
                            equipmentPrice: equipmentListEntryToEditViewModel.equipmentPrice,
                            discount: Math.abs(equipmentListEntryToEditViewModel.discount ?? 0),
                            isHidden: equipmentListEntryToEditViewModel.isHidden ?? false,
                        };

                        onSave(entryToSave, !equipmentListEntryToEditViewModel.id);
                    }}
                >
                    Spara
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditEquipmentListEntryModal;
