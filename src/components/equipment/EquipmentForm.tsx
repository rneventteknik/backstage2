import React, { FormEvent, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Equipment } from '../../models/interfaces';
import {
    IEquipmentObjectionModel,
    IEquipmentCategoryObjectionModel,
    IEquipmentPriceObjectionModel,
} from '../../models/objection-models';
import { EquipmentCategory } from '../../models/interfaces';
import { toEquipmentCategory } from '../../lib/mappers/equipment';
import { getResponseContentOrError } from '../../lib/utils';
import useSwr from 'swr';

type Props = {
    handleSubmitEquipment: (equipment: IEquipmentObjectionModel) => void;
    equipment?: Equipment;
    formId: string;
};

const EquipmentForm: React.FC<Props> = ({ handleSubmitEquipment, equipment: equipment, formId }: Props) => {
    const [validated, setValidated] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState(equipment?.categories ?? []);

    const equipmentCategoriesFetcher = (url: string) =>
        fetch(url)
            .then((apiResponse) => getResponseContentOrError<IEquipmentCategoryObjectionModel[]>(apiResponse))
            .then((equipmentList) => equipmentList.map((x) => toEquipmentCategory(x)));

    const { data: equipmentCategories } = useSwr('/api/equipmentCategories/', equipmentCategoriesFetcher);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;

        if (form.prices?.value) {
            // Check that the prices are valid prices
            try {
                const prices = JSON.parse(form.prices.value) as IEquipmentPriceObjectionModel[];
                if (
                    prices.some(
                        (price) =>
                            isNaN(price.pricePerUnit) ||
                            isNaN(price.pricePerHour) ||
                            isNaN(price.pricePerUnitTHS) ||
                            isNaN(price.pricePerHourTHS) ||
                            !price.name,
                    )
                ) {
                    form.prices.setCustomValidity('Inkorrekta priser');
                } else {
                    form.prices.setCustomValidity('');
                }
            } catch {
                form.prices.setCustomValidity('Inkorrekt JSON');
            }
        }

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const modifiedEquipment: IEquipmentObjectionModel = {
            id: equipment?.id,
            created: equipment?.created?.toString(),
            updated: equipment?.updated?.toString(),

            image: equipment?.image,

            name: form.equipmentName.value,
            description: form.description.value,
            nameEN: form.equipmentNameEN.value,
            descriptionEN: form.descriptionEN.value,

            categories: selectedCategories.map((x) => ({
                ...x,
                created: x.created?.toString(),
                updated: x.updated?.toString(),
            })),
            prices: form.prices?.value ? JSON.parse(form.prices.value) : undefined,

            inventoryCount: form.inventoryCount?.value ?? 1,
            publiclyHidden: form.publiclyHidden?.value === 'true',
            note: form.note?.value,
        };

        handleSubmitEquipment(modifiedEquipment);
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formName">
                        <Form.Label>Namn</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Behringer X32 Mixerbord"
                            name="equipmentName"
                            defaultValue={equipment?.name}
                        />
                    </Form.Group>
                </Col>
                <Col lg="6">
                    <Form.Group controlId="formDescription">
                        <Form.Label>Beskrivning</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder=""
                            name="description"
                            defaultValue={equipment?.description}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <h6>Översättningar</h6>
            <hr />
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formNameEN">
                        <Form.Label>Namn (engelska)</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Behringer X32 Mixer"
                            name="equipmentNameEN"
                            defaultValue={equipment?.nameEN}
                        />
                    </Form.Group>
                </Col>
                <Col lg="6">
                    <Form.Group controlId="formDescriptionEN">
                        <Form.Label>Beskrivning (engelska)</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder=""
                            name="descriptionEN"
                            defaultValue={equipment?.descriptionEN}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {!equipment ? null : (
                <>
                    <h6>Prissättning</h6>
                    <hr />
                    <Row>
                        <Col lg="12">
                            <Form.Group controlId="formPrices">
                                <Form.Label>Priser som JSON</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    placeholder=""
                                    name="prices"
                                    rows={6}
                                    style={{ fontFamily: 'Consolas', fontSize: '1em' }}
                                    defaultValue={JSON.stringify(
                                        equipment?.prices.map((x) => ({
                                            name: x.name,
                                            pricePerUnit: x.pricePerUnit,
                                            pricePerHour: x.pricePerHour,
                                            pricePerUnitTHS: x.pricePerUnitTHS,
                                            pricePerHourTHS: x.pricePerHourTHS,
                                        })),
                                    )}
                                />
                                <Form.Text className="text-muted">
                                    Fyll i prissättningen i JSON-format. Exempel: [&#123;&quot;name&quot;:
                                    &quot;Standardpris&quot;, &quot;pricePerUnit&quot;: 10, &quot;pricePerHour&quot;: 0,
                                    &quot;pricePerUnitTHS&quot;: 5, &quot;pricePerHourTHS&quot;: 0 &#125;]
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6>Övriga inställningar</h6>
                    <hr />
                    <Row>
                        <Col lg="3">
                            <Form.Group controlId="formInventoryCount">
                                <Form.Label>Antal i inventarie</Form.Label>
                                <Form.Control
                                    required
                                    type="number"
                                    placeholder="15"
                                    name="inventoryCount"
                                    defaultValue={equipment?.inventoryCount}
                                />
                            </Form.Group>
                        </Col>
                        <Col lg="3">
                            <Form.Group controlId="formPubliclyHidden">
                                <Form.Label>Publika prislistan</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="publiclyHidden"
                                    defaultValue={equipment?.publiclyHidden.toString()}
                                >
                                    <option value={'false'}>Synlig i publika prislistan</option>
                                    <option value={'true'}>Gömd (visas endast internt)</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md="6">
                            <Form.Group>
                                <Form.Label>Kategorier</Form.Label>
                                <Typeahead<EquipmentCategory>
                                    id="categories-typeahead"
                                    multiple
                                    labelKey={(x) => x.name}
                                    options={equipmentCategories ?? []}
                                    onChange={(e) => setSelectedCategories(e)}
                                    placeholder="Kategorier"
                                    defaultSelected={equipment.categories ?? []}
                                />
                            </Form.Group>
                        </Col>
                        <Col lg="12">
                            <Form.Group controlId="formNote">
                                <Form.Label>Anteckningar</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    placeholder=""
                                    name="note"
                                    rows={10}
                                    defaultValue={equipment?.note}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </>
            )}
        </Form>
    );
};

export default EquipmentForm;
