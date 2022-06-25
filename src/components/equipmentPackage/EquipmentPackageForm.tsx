import React, { FormEvent, useState, useEffect } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { IEquipmentObjectionModel, IEquipmentPackageObjectionModel } from '../../models/objection-models';
import { EquipmentTag } from '../../models/interfaces';
import { toEquipment } from '../../lib/mappers/equipment';
import useSwr from 'swr';
import { EquipmentPackage, EquipmentPackageEntry } from '../../models/interfaces/EquipmentPackage';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import EquipmentSearch from '../EquipmentSearch';
import { equipmentTagsFetcher } from '../../lib/fetchers';
import { PartialDeep } from 'type-fest';
import { FormNumberFieldWithoutScroll } from '../utils/FormNumberFieldWithoutScroll';

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

    const addEquipment = (equipment: IEquipmentObjectionModel) => {
        if (!equipment.id) {
            throw 'Invalid equipment';
        }

        const nextId = Math.max(1, ...selectedEquipmentPackageEntries.map((x) => x.id)) + 1;

        const equipmentPackageEntry: EquipmentPackageEntry = {
            id: nextId, // This id is only used in the client, it is striped before sending to the server
            numberOfUnits: 1,
            equipment: toEquipment(equipment),
            equipmentId: equipment.id,
        };
        setSelectedEquipmentPackageEntries([...selectedEquipmentPackageEntries, equipmentPackageEntry]);
    };

    const deleteEquipment = (equipmentPackageEntry: EquipmentPackageEntry) => {
        setSelectedEquipmentPackageEntries(
            selectedEquipmentPackageEntries.filter((x) => x.id !== equipmentPackageEntry.id),
        );
    };

    const EquipmentPackageNumberOfUnitsDisplayFn = (equipmentPackageEntry: EquipmentPackageEntry) => (
        <Form.Control
            required
            type="text"
            size="sm"
            name={'equipmentPackageNumberOfUnits-' + equipmentPackageEntry.id}
            defaultValue={equipmentPackageEntry.numberOfUnits}
            onChange={(e) => {
                equipmentPackageEntry.numberOfUnits = parseInt(e.target.value);
            }}
        />
    );

    const EquipmentPackageActionsDisplayFn = (equipmentPackageEntry: EquipmentPackageEntry) => (
        <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
                deleteEquipment(equipmentPackageEntry);
            }}
        >
            Ta bort
        </Button>
    );

    const equipmentTableSettings: TableConfiguration<EquipmentPackageEntry> = {
        entityTypeDisplayName: '',
        noResultsLabel: 'Ingen utrustning konfigurerad',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        hideTableCountControls: true,
        hideTableFilter: true,
        columns: [
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (equipmentPackageEntry: EquipmentPackageEntry) => equipmentPackageEntry.equipment?.name ?? '',
            },
            {
                key: 'number',
                displayName: 'Antal',
                getValue: (equipmentPackageEntry: EquipmentPackageEntry) => equipmentPackageEntry.numberOfUnits,
                getContentOverride: EquipmentPackageNumberOfUnitsDisplayFn,
                columnWidth: 140,
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                getContentOverride: EquipmentPackageActionsDisplayFn,
                disableSort: true,
                columnWidth: 100,
                textAlignment: 'center',
            },
        ],
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const modifiedEquipmentPackage: PartialDeep<IEquipmentPackageObjectionModel> = {
            id: equipmentPackage?.id,
            created: equipmentPackage?.created?.toString(),
            updated: equipmentPackage?.updated?.toString(),

            image: equipmentPackage?.image,

            name: form.equipmentPackageName.value,

            tags: selectedTags.map((x) => ({
                ...x,
                created: x.created?.toString(),
                updated: x.updated?.toString(),
            })),

            equipmentEntries: selectedEquipmentPackageEntries.map((x) => ({
                ...x,
                id: undefined,
                equipment: undefined,
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
            </Row>

            {!equipmentPackage ? null : (
                <>
                    <h6>Inkluderad utrustning</h6>
                    <div className="mb-3 mt-3">
                        <TableDisplay
                            entities={selectedEquipmentPackageEntries}
                            configuration={equipmentTableSettings}
                        />
                    </div>
                    <div className="mb-3">
                        <EquipmentSearch
                            placeholder="Lägg till utrustning"
                            includePackages={false}
                            id="equipment-search"
                            onSelect={(x) => addEquipment(x as unknown as IEquipmentObjectionModel)}
                        />
                    </div>

                    <h6>Övriga inställningar</h6>
                    <hr />
                    <Row>
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
