import React from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { getGlobalSetting, replaceEmptyStringWithNull, toIntOrUndefined } from '../../../lib/utils';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FormNumberFieldWithoutScroll } from '../../utils/FormNumberFieldWithoutScroll';
import { EquipmentPrice } from '../../../models/interfaces';
import { Typeahead } from 'react-bootstrap-typeahead';
import PriceWithVATPreview from '../../utils/PriceWithVATPreview';
import { KeyValue } from '../../../models/interfaces/KeyValue';
import RequiredIndicator from '../../utils/RequiredIndicator';
import { PricedEntityWithTHS } from '../../../models/interfaces/BaseEntity';
import currency from 'currency.js';

type Props = {
    show: boolean;
    onHide: () => void;
    priceDisplayFn: (price: PricedEntityWithTHS) => string;
    getEquipmentListEntryPrices: (equipmentPrice: EquipmentPrice) => {
        pricePerHour: currency;
        pricePerUnit: currency;
        equipmentPrice: EquipmentPrice;
    };
    equipmentListEntryToEditViewModel: Partial<EquipmentListEntry> | null;
    setEquipmentListEntryToEditViewModel: React.Dispatch<React.SetStateAction<Partial<EquipmentListEntry> | null>>;
    onSave: (entryToSave: EquipmentListEntry, isNew: boolean) => void;
    nextId: number;
    nextSortIndex: number;
    globalSettings: KeyValue[];
    equipmentListDiscountPercentage: number;
    readonly?: boolean;
};

type Account = {
    accountNumber: string;
    description: string;
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
    globalSettings,
    equipmentListDiscountPercentage,
    readonly = false,
}: Props) => {
    const invoiceAccounts: Account[] = JSON.parse(getGlobalSetting('accounts.availableAccounts', globalSettings, '[]'));
    return (
        <Modal show={show} onHide={() => onHide()} size="lg" backdrop="static">
            {!!equipmentListEntryToEditViewModel ? (
                <Modal.Body>
                    <Row>
                        <Col lg={4}>
                            <Form.Group>
                                <Form.Label>
                                    Namn
                                    <RequiredIndicator />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={equipmentListEntryToEditViewModel?.name}
                                    readOnly={readonly}
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
                                        readOnly={readonly}
                                        onChange={(e) =>
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                numberOfUnits: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Text>st</InputGroup.Text>
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
                                        readOnly={readonly}
                                        onChange={(e) =>
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                numberOfHours: toIntOrUndefined(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Text>h</InputGroup.Text>
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
                                        disabled={!equipmentListEntryToEditViewModel.equipment || readonly}
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
                                    <Form.Label>Pris per styck (ex. moms)</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={!equipmentListEntryToEditViewModel.equipmentPrice ? 'number' : 'text'}
                                            min="0"
                                            disabled={!!equipmentListEntryToEditViewModel.equipmentPrice || readonly}
                                            value={equipmentListEntryToEditViewModel?.pricePerUnit?.value ?? ''}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    pricePerUnit: currency(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Text>kr/st</InputGroup.Text>
                                    </InputGroup>
                                    <PriceWithVATPreview price={equipmentListEntryToEditViewModel?.pricePerUnit} />
                                </Form.Group>
                            </Col>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Pris per timme (ex. moms)</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={!equipmentListEntryToEditViewModel.equipmentPrice ? 'number' : 'text'}
                                            min="0"
                                            disabled={!!equipmentListEntryToEditViewModel.equipmentPrice || readonly}
                                            value={equipmentListEntryToEditViewModel?.pricePerHour?.value ?? ''}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    pricePerHour: currency(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Text>kr/h</InputGroup.Text>
                                    </InputGroup>
                                    <PriceWithVATPreview price={equipmentListEntryToEditViewModel?.pricePerHour} />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                    <Row>
                        <Col lg={4} xs={6}>
                            <Form.Group>
                                <Form.Label>Rabatt (ex. moms)</Form.Label>
                                <InputGroup>
                                    <FormNumberFieldWithoutScroll
                                        type="number"
                                        min="0"
                                        value={equipmentListEntryToEditViewModel?.discount?.value ?? ''}
                                        readOnly={readonly}
                                        onChange={(e) =>
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                discount: currency(e.target.value),
                                            })
                                        }
                                    />
                                    <InputGroup.Text>kr</InputGroup.Text>
                                </InputGroup>
                                <PriceWithVATPreview
                                    price={equipmentListEntryToEditViewModel?.discount}
                                    text={'Rabatt per rad inklusive moms: '}
                                />
                                {equipmentListDiscountPercentage > 0 ? (
                                    <Form.Text className="text-muted">
                                        Rabatt från listan: {equipmentListDiscountPercentage}%.
                                    </Form.Text>
                                ) : null}
                            </Form.Group>
                        </Col>
                        <Col lg={8} xs={6}>
                            <Form.Group>
                                <Form.Label>Konto</Form.Label>
                                <Typeahead<Account>
                                    id="account-typeahead"
                                    options={invoiceAccounts}
                                    defaultInputValue={equipmentListEntryToEditViewModel.account ?? ''}
                                    labelKey="accountNumber"
                                    disabled={readonly}
                                    renderMenuItemChildren={(option) => {
                                        return (
                                            <>
                                                {option.accountNumber}{' '}
                                                <span className="text-muted">- {option.description}</span>
                                            </>
                                        );
                                    }}
                                    onChange={(s) =>
                                        setEquipmentListEntryToEditViewModel({
                                            ...equipmentListEntryToEditViewModel,
                                            account: s.length > 0 ? s[0].accountNumber : '',
                                        })
                                    }
                                    onInputChange={(s) =>
                                        setEquipmentListEntryToEditViewModel({
                                            ...equipmentListEntryToEditViewModel,
                                            account: s,
                                        })
                                    }
                                    placeholder="Följer bokningen"
                                />
                                <Form.Text className="text-muted">
                                    Lämna fältet tomt för att låta kontot styras av bokningens kontotyp.
                                </Form.Text>
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
                                    readOnly={readonly}
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
                            {!readonly ? (
                                <a
                                    href="#"
                                    className="text-danger"
                                    onClick={() =>
                                        setEquipmentListEntryToEditViewModel({
                                            ...equipmentListEntryToEditViewModel,
                                            equipment: null,
                                            equipmentId: null,
                                            equipmentPrice: null,
                                        })
                                    }
                                >
                                    Ta bort koppling
                                </a>
                            ) : null}
                        </p>
                    ) : null}
                </Modal.Body>
            ) : null}
            <Modal.Footer>
                {readonly ? (
                    <Button variant="primary" onClick={() => setEquipmentListEntryToEditViewModel(null)}>
                        Stäng
                    </Button>
                ) : (
                    <>
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
                                    numberOfUnits: equipmentListEntryToEditViewModel.numberOfUnits ?? 1,
                                    numberOfHours: equipmentListEntryToEditViewModel.numberOfHours ?? 0,
                                    pricePerUnit: equipmentListEntryToEditViewModel.pricePerUnit ?? currency(0),
                                    pricePerHour: equipmentListEntryToEditViewModel.pricePerHour ?? currency(0),
                                    discount: equipmentListEntryToEditViewModel.discount ?? currency(0),
                                    equipmentPrice: equipmentListEntryToEditViewModel.equipmentPrice ?? null,
                                    isHidden: equipmentListEntryToEditViewModel.isHidden ?? false,
                                    account: replaceEmptyStringWithNull(equipmentListEntryToEditViewModel.account),
                                    isPacked: equipmentListEntryToEditViewModel.isPacked ?? false,
                                };

                                onSave(entryToSave, !equipmentListEntryToEditViewModel.id);
                            }}
                        >
                            Spara
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default EditEquipmentListEntryModal;
