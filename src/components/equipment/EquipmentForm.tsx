import React, { FormEvent, useState } from 'react';
import { Col, Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Equipment, EquipmentTag } from '../../models/interfaces';
import { IEquipmentObjectionModel, IEquipmentPriceObjectionModel } from '../../models/objection-models';
import useSwr from 'swr';
import { equipmentTagsFetcher, equipmentPublicCategoriesFetcher, equipmentLocationsFetcher } from '../../lib/fetchers';
import { PartialDeep } from 'type-fest';
import PricesEditor from './PricesEditor';
import { toEquipmentPriceObjectionModel } from '../../lib/mappers/equipment';
import { toIntOrUndefined } from '../../lib/utils';
import { FormNumberFieldWithoutScroll } from '../utils/FormNumberFieldWithoutScroll';
import { getSortedList } from '../../lib/sortIndexUtils';

type Props = {
    handleSubmitEquipment: (equipment: PartialDeep<IEquipmentObjectionModel>) => void;
    equipment?: Equipment;
    formId: string;
};

const EquipmentForm: React.FC<Props> = ({ handleSubmitEquipment, equipment: equipment, formId }: Props) => {
    const [validated, setValidated] = useState(false);
    const [selectedTags, setSelectedTags] = useState(equipment?.tags ?? []);
    const [prices, setPrices] = useState(equipment?.prices ?? []);

    const { data: equipmentTags } = useSwr('/api/equipmentTags', equipmentTagsFetcher);

    const { data: equipmentPublicCategories } = useSwr(
        '/api/equipmentPublicCategories',
        equipmentPublicCategoriesFetcher,
    );

    const { data: equipmentLocations } = useSwr('/api/equipmentLocations', equipmentLocationsFetcher);

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

        const getValueFromForm = (key: string): string | undefined => form[key]?.value;

        const modifiedEquipment: PartialDeep<IEquipmentObjectionModel, { recurseIntoArrays: true }> = {
            id: equipment?.id,

            image: equipment?.image,

            name: getValueFromForm('equipmentName'),
            description: getValueFromForm('description'),
            nameEN: getValueFromForm('equipmentNameEN'),
            descriptionEN: getValueFromForm('descriptionEN'),
            searchKeywords: getValueFromForm('searchKeywords'),

            tags: selectedTags.map((x) => ({
                ...x,
                created: x.created?.toString(),
                updated: x.updated?.toString(),
                equipment: undefined,
            })),
            prices: prices.map((x) => toEquipmentPriceObjectionModel(x)),
            equipmentPublicCategoryId: toIntOrUndefined(getValueFromForm('publicCategory')) ?? null,
            equipmentLocationId: toIntOrUndefined(getValueFromForm('equipmentLocation')) ?? null,

            inventoryCount: toIntOrUndefined(getValueFromForm('inventoryCount')) ?? null,
            publiclyHidden: getValueFromForm('publiclyHidden') === 'true',
            note: getValueFromForm('note'),
        };

        handleSubmitEquipment(modifiedEquipment);
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Form.Row>
                <Col lg="6">
                    <Form.Group controlId="formName">
                        <Form.Label>Namn</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Projektor Optoma EH460 (Short Throw, 1080p)"
                            name="equipmentName"
                            defaultValue={equipment?.name}
                        />
                        <Form.Text className="text-muted">
                            Nomenklatur: &lt;utrustningstyp&gt; &lt;modell&gt; (&lt;internt namn&gt;, &lt;teknisk
                            specifikation&gt;). Komponenter av namnet som ej är tillämpbart kan utelämnas.
                        </Form.Text>
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
            </Form.Row>

            <h2 className="h5 mt-4">Översättningar</h2>
            <hr />
            <Form.Row>
                <Col lg="6">
                    <Form.Group controlId="formNameEN">
                        <Form.Label>Namn (engelska)</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Projector Optoma EH460 (Short Throw, 1080p)"
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
            </Form.Row>

            {!equipment ? null : (
                <>
                    <h2 className="h5 mt-4">Prissättning</h2>
                    <hr />
                    <Form.Row>
                        <Col lg="12">
                            <Form.Group controlId="formPrices">
                                <PricesEditor prices={prices} onChange={setPrices} />
                            </Form.Group>
                        </Col>
                    </Form.Row>

                    <h2 className="h5 mt-4">Övriga inställningar</h2>
                    <hr />
                    <Form.Row>
                        <Col lg="6">
                            <Form.Group>
                                <Form.Label>Söktermer</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="MDHX, MD-HX"
                                    name="searchKeywords"
                                    defaultValue={equipment?.searchKeywords}
                                />
                                <Form.Text className="text-muted">
                                    Dessa termer visas inte, men används vid sökning (utöver namnen).
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg="6">
                            <Form.Group>
                                <Form.Label>Taggar</Form.Label>
                                <Typeahead<EquipmentTag>
                                    id="tags-typeahead"
                                    multiple
                                    labelKey={(x) => x.name}
                                    options={equipmentTags ?? []}
                                    onChange={(e) => setSelectedTags(e)}
                                    placeholder="Taggar"
                                    defaultSelected={equipment.tags ?? []}
                                />
                            </Form.Group>
                        </Col>
                        <Col lg="3">
                            <Form.Group controlId="formInventoryCount">
                                <Form.Label>Antal i inventarie</Form.Label>
                                <FormNumberFieldWithoutScroll
                                    type="number"
                                    placeholder=""
                                    name="inventoryCount"
                                    defaultValue={equipment?.inventoryCount ?? undefined}
                                />
                                <Form.Text className="text-muted">
                                    Lämna detta fält tomt för att stänga av inventariestatus.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg="3">
                            <Form.Group controlId="formPubliclyHidden">
                                <Form.Label>Publika prislistan</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="publiclyHidden"
                                    defaultValue={equipment?.publiclyHidden ? 'true' : 'false'}
                                >
                                    <option value={'false'}>Synlig i publika prislistan</option>
                                    <option value={'true'}>Gömd (visas endast internt)</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col lg="3">
                            <Form.Group>
                                <Form.Label>Publik kategori</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="publicCategory"
                                    defaultValue={equipment?.equipmentPublicCategory?.id}
                                >
                                    <option value={undefined}>Ingen kategori</option>
                                    {getSortedList(equipmentPublicCategories ?? []).map((x) => (
                                        <option
                                            key={x.id}
                                            value={x.id}
                                            selected={x.id === equipment.equipmentPublicCategory?.id}
                                        >
                                            {x.name}
                                        </option>
                                    ))}
                                </Form.Control>
                                <Form.Text className="text-muted">
                                    I den publika prislistan grupperas utrustningen baserat på denna kategori.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg="3">
                            <Form.Group>
                                <Form.Label>Plats</Form.Label>
                                <Form.Control as="select" name="equipmentLocation">
                                    <option value={undefined}>Okänd plats</option>
                                    {getSortedList(equipmentLocations ?? []).map((x) => (
                                        <option
                                            key={x.id}
                                            value={x.id}
                                            selected={x.id === equipment.equipmentLocation?.id}
                                        >
                                            {x.name}
                                        </option>
                                    ))}
                                </Form.Control>
                                <Form.Text className="text-muted">
                                    I packlistan grupperas utrustningen baserat på denna kategori.
                                </Form.Text>
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
                    </Form.Row>
                </>
            )}
        </Form>
    );
};

export default EquipmentForm;
