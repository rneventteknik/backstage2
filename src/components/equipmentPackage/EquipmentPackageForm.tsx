import React, { FormEvent, useState, useEffect } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { IEquipmentPackageObjectionModel } from '../../models/objection-models';
import { EquipmentTag } from '../../models/interfaces';
import useSwr from 'swr';
import { EquipmentPackage } from '../../models/interfaces/EquipmentPackage';
import { equipmentTagsFetcher } from '../../lib/fetchers';
import { PartialDeep } from 'type-fest';
import { FormNumberFieldWithoutScroll } from '../utils/FormNumberFieldWithoutScroll';
import {
    EquipmentEntryFromEquipmentPackageEntry,
    EquipmentPackageEntryFromEquipmentEntry,
    IncludedOrRelatedEquipmentEditor,
} from './IncludedOrRelatedEquipmentEditor';

type Props = {
    handleSubmitEquipmentPackage: (equipmentPackage: PartialDeep<IEquipmentPackageObjectionModel>) => void;
    equipmentPackage?: EquipmentPackage;
    formId: string;
};

const EquipmentForm: React.FC<Props> = ({ handleSubmitEquipmentPackage, equipmentPackage, formId }: Props) => {
    const [validated, setValidated] = useState(false);
    const [selectedTags, setSelectedTags] = useState(equipmentPackage?.tags ?? []);
    const [selectedEquipmentPackageEntries, setSelectedEquipmentPackageEntries] = useState(
        equipmentPackage?.equipmentEntries ?? [],
    );

    useEffect(() => {
        if (selectedEquipmentPackageEntries.length === 0) {
            setSelectedEquipmentPackageEntries(equipmentPackage?.equipmentEntries ?? []);
        }
    }, [equipmentPackage, selectedEquipmentPackageEntries.length]);

    const { data: equipmentTags } = useSwr('/api/equipmentTags', equipmentTagsFetcher);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const modifiedEquipmentPackage: PartialDeep<IEquipmentPackageObjectionModel, { recurseIntoArrays: true }> = {
            id: equipmentPackage?.id,
            created: equipmentPackage?.created?.toString(),
            updated: equipmentPackage?.updated?.toString(),

            image: equipmentPackage?.image,

            name: form.equipmentPackageName.value,
            nameEN: form.equipmentPackageNameEN.value,
            description: form.description.value,
            descriptionEN: form.descriptionEN.value,
            addAsHeading: form.addAsHeading?.value === 'true',

            tags: selectedTags.map((x) => ({
                ...x,
                created: x.created?.toString(),
                updated: x.updated?.toString(),
                equipment: undefined,
            })),

            equipmentEntries: selectedEquipmentPackageEntries.map((x) => ({
                ...x,
                id: undefined,
                equipment: undefined,
                equipmentPrice: undefined,
                equipmentPriceId: x.equipmentPriceId ?? null,
                created: x.created?.toString(),
                updated: x.updated?.toString(),
            })),

            estimatedHours: form.estimatedHours?.value ?? 0,
            note: form.note?.value,
        };

        handleSubmitEquipmentPackage(modifiedEquipmentPackage);
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
                            placeholder="Stora Ljudpaketet"
                            name="equipmentPackageName"
                            defaultValue={equipmentPackage?.name}
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
                            defaultValue={equipmentPackage?.description}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <h2 className="h5 mt-4">Översättningar</h2>
            <hr />
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formNameEN">
                        <Form.Label>Namn (engelska)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Large Audio package"
                            name="equipmentPackageNameEN"
                            defaultValue={equipmentPackage?.nameEN}
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
                            defaultValue={equipmentPackage?.descriptionEN}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {!equipmentPackage ? null : (
                <>
                    <Row>
                        <Col>
                            <Form.Group controlId="includedEquipment">
                                <h2 className="h5 mt-4">Inkluderad utrustning</h2>
                                <hr />
                                <IncludedOrRelatedEquipmentEditor
                                    selectedEquipmentEntries={selectedEquipmentPackageEntries.map(
                                        EquipmentEntryFromEquipmentPackageEntry,
                                    )}
                                    setSelectedEquipmentEntries={(x) =>
                                        setSelectedEquipmentPackageEntries(
                                            x.map(EquipmentPackageEntryFromEquipmentEntry),
                                        )
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h2 className="h5 mt-4">Övriga inställningar</h2>
                    <hr />
                    <Row>
                        <Col lg="3">
                            <Form.Group controlId="formAddAsHeading">
                                <Form.Label>Pakettyp</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="addAsHeading"
                                    defaultValue={equipmentPackage?.addAsHeading ? 'true' : 'false'}
                                >
                                    <option value={'false'}>Lägg till rader individuellt</option>
                                    <option value={'true'}>Lägg till rader med paketet som rubrik</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col lg="3">
                            <Form.Group controlId="formInventoryCount">
                                <Form.Label>Estimerade arbetstimmar</Form.Label>
                                <FormNumberFieldWithoutScroll
                                    required
                                    type="number"
                                    placeholder="0"
                                    name="estimatedHours"
                                    defaultValue={equipmentPackage?.estimatedHours ?? 0}
                                />
                            </Form.Group>
                        </Col>
                        <Col md="6">
                            <Form.Group>
                                <Form.Label>Taggar</Form.Label>
                                <Typeahead<EquipmentTag>
                                    id="tags-typeahead"
                                    multiple
                                    labelKey={(x) => x.name}
                                    options={equipmentTags ?? []}
                                    onChange={(e) => setSelectedTags(e)}
                                    placeholder="Taggar"
                                    defaultSelected={equipmentPackage.tags ?? []}
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
                                    defaultValue={equipmentPackage?.note}
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
