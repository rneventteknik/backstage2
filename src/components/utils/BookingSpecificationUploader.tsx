import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { Alert, Button, Card, Col, Form, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import {
    BookingSpecificationEquipmentImportModel,
    BookingSpecificationEquipmentModel,
    BookingSpecificationImportModel,
    BookingSpecificationModel,
} from '../../models/misc/BookingSpecificationImportModel';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import useSwr from 'swr';
import { equipmentsFetcher } from '../../lib/fetchers';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Equipment } from '../../models/interfaces';
import { getPricePlanName, updateItemsInArrayById } from '../../lib/utils';
import { PricePlan } from '../../models/enums/PricePlan';
import { getEquipmentListEntryPrices } from '../../lib/equipmentListUtils';

type Props = {
    onSave: (bookingSpecificationModel: BookingSpecificationModel) => void;
};

const BookingSpecificationUploader = ({ onSave }: Props): React.ReactElement => {
    const [fileContent, setFileContent] = React.useState<BookingSpecificationImportModel | null>(null);
    const [rows, setRows] = React.useState<BookingSpecificationEquipmentModel[] | null>(null);
    const { data: equipment, error } = useSwr('/api/equipment', equipmentsFetcher);
    const [missingEquipment, setMissingEquipment] = useState<boolean>(false);
    const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

    if (error) {
        return (
            <div className="p-3">
                <p className="text-danger text-center">
                    <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda utrustningen.
                </p>
                <p className="text-monospace text-muted mb-0">{error.message}</p>
            </div>
        );
    }

    const getRowsWithEquipment = (
        equipmentList: Equipment[],
        equipmentImportModels: BookingSpecificationEquipmentImportModel[],
    ): BookingSpecificationEquipmentModel[] =>
        equipmentImportModels.flatMap((equipmentImportModel) => {
            const equipment = equipmentList.find((e) => e.id === equipmentImportModel.itemId);

            if (!equipment) {
                setMissingEquipment(true);
                return [];
            }

            return [
                {
                    id: equipmentImportModel.itemId,
                    amount: equipmentImportModel.amount,
                    equipment: equipment,
                    selectedPrice: equipment?.prices.length === 1 ? equipment.prices[0] : null,
                    hours: null,
                },
            ];
        });

    const rowRequiresHours = (row: BookingSpecificationEquipmentModel) =>
        row.selectedPrice !== null &&
        getEquipmentListEntryPrices(row.selectedPrice, pricePlan).pricePerHour.value !== 0;

    const rowIsValid = (row: BookingSpecificationEquipmentModel) =>
        row.selectedPrice !== null && (!rowRequiresHours(row) || row.hours !== null);

    const onUpload = (fileContent: BookingSpecificationImportModel) => {
        if (!equipment) {
            throw new Error('Invalid equipment');
        }

        const rowsWithEquipment = getRowsWithEquipment(equipment, fileContent.equipment);

        setRows(rowsWithEquipment);
        setFileContent(fileContent);
        setSelectedRowIds(rowsWithEquipment.map((e) => e.id) ?? []);
    };

    const save = () => {
        if (!rows) {
            throw new Error('Invalid rows');
        }
        if (!fileContent) {
            throw new Error('Invalid file content');
        }

        const rowsToSave = rows.filter((row) => selectedRowIds.includes(row.id) && rowIsValid(row));

        const model: BookingSpecificationModel = { ...fileContent, equipment: rowsToSave };
        onSave(model);
    };

    const pricePlan = fileContent?.isThsMember ? PricePlan.THS : PricePlan.EXTERNAL;

    return fileContent && rows ? (
        <>
            <Row className="mb-3">
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>{fileContent.projectName ?? 'Bokningsinformation'}</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Prisplan</span>
                                <span>{getPricePlanName(pricePlan)}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Kontaktperson</span>
                                <span>
                                    {fileContent.firstName} {fileContent.lastName}
                                </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Telefonnummer</span>
                                <span>{fileContent.phoneNumber}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Email</span>
                                <span>{fileContent.email}</span>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="mb-1">Beskrivning</div>
                                <div className="text-muted">{fileContent.description}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                <Col xl={8}>
                    {missingEquipment ? (
                        <Alert variant="danger">All utrustning kunde inte matchas mot utrustningdatabasen.</Alert>
                    ) : null}
                    <BookingSpecificationTable
                        rows={rows}
                        setRows={setRows}
                        selectedRowIds={selectedRowIds}
                        setSelectedRowIds={setSelectedRowIds}
                        rowIsValid={rowIsValid}
                        pricePlan={pricePlan}
                    />
                </Col>
            </Row>
            <Button className="mb-3" onClick={() => save()}>
                Spara bokningsdetaljer och utrustning
            </Button>
        </>
    ) : (
        <FileUploader<BookingSpecificationImportModel>
            onFileUpload={onUpload}
            label={'Ladda upp fil med bokningsspecifikation här'}
        />
    );
};

type TableProps = {
    rows: BookingSpecificationEquipmentModel[];
    setRows: React.Dispatch<React.SetStateAction<BookingSpecificationEquipmentModel[] | null>>;
    selectedRowIds: number[];
    setSelectedRowIds: React.Dispatch<React.SetStateAction<number[]>>;
    rowIsValid: (row: BookingSpecificationEquipmentModel) => boolean;
    pricePlan: PricePlan;
};

const BookingSpecificationTable = ({
    rows,
    setRows,
    selectedRowIds,
    setSelectedRowIds,
    rowIsValid,
    pricePlan,
}: TableProps): React.ReactElement => {
    const toggleSelection = (row: BookingSpecificationEquipmentModel) => {
        if (selectedRowIds.includes(row.id)) {
            setSelectedRowIds((ids) => ids.filter((x) => x !== row.id));
            return;
        }

        setSelectedRowIds((ids) => [...ids, row.id]);
    };

    const selectionDisplayFn = (row: BookingSpecificationEquipmentModel) => {
        if (!rowIsValid(row)) {
            return (
                <OverlayTrigger
                    placement="right"
                    overlay={
                        <Tooltip id="1">
                            <p className="mb-0">
                                Denna utrustning kan inte läggas till eftersom den saknar information.
                            </p>
                        </Tooltip>
                    }
                >
                    <div className="text-center text-danger">
                        <FontAwesomeIcon icon={faExclamationCircle} />
                    </div>
                </OverlayTrigger>
            );
        }
        return (
            <div className="text-center">
                <input
                    type="checkbox"
                    disabled={false}
                    checked={selectedRowIds.some((x) => x === row.id)}
                    onChange={() => toggleSelection(row)}
                />
            </div>
        );
    };

    const priceDisplayFn = (row: BookingSpecificationEquipmentModel) => {
        if (row.equipment?.prices.length === 1) {
            return <span>{row.selectedPrice?.name}</span>;
        }

        const prices = row.equipment?.prices ?? [];

        return (
            <Form.Control
                as="select"
                onChange={(e) => {
                    const newPriceId = parseInt(e.target.value);
                    setRows((rows) => {
                        if (!rows) {
                            throw new Error('Invalid rows');
                        }
                        return updateItemsInArrayById(rows, {
                            ...row,
                            selectedPrice: prices.find((x) => x.id === newPriceId) ?? null,
                        });
                    });
                }}
            >
                <option value="">Välj pris</option>
                {prices.map((x) => (
                    <option key={x.id} value={x.id}>
                        {x.name}
                    </option>
                ))}
            </Form.Control>
        );
    };

    const hoursDisplayFn = (row: BookingSpecificationEquipmentModel) => {
        if (
            row.selectedPrice === null ||
            getEquipmentListEntryPrices(row.selectedPrice, pricePlan).pricePerHour.value === 0
        ) {
            return <span className="text-muted">-</span>;
        }

        return (
            <Form.Control
                type="number"
                value={row.hours ?? 'trets'}
                onChange={(e) =>
                    setRows((rows) => {
                        if (!rows) {
                            throw new Error('Invalid rows');
                        }
                        return updateItemsInArrayById(rows, {
                            ...row,
                            hours: parseInt(e.target.value),
                        });
                    })
                }
            />
        );
    };

    const tableSettings: TableConfiguration<BookingSpecificationEquipmentModel> = {
        entityTypeDisplayName: 'utrustning',
        defaultSortPropertyName: 'name',
        defaultSortAscending: false,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'selection',
                displayName: '',
                getValue: () => '',
                getContentOverride: selectionDisplayFn,
                columnWidth: 60,
                disableSort: true,
            },
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (row: BookingSpecificationEquipmentModel) => row.equipment?.name ?? 'Okänd utrustning',
            },
            {
                key: 'amount',
                displayName: 'Antal',
                getValue: (row: BookingSpecificationEquipmentModel) => row.amount,
                columnWidth: 140,
            },
            {
                key: 'price',
                displayName: 'Pris',
                getValue: (row: BookingSpecificationEquipmentModel) => row.selectedPrice?.name ?? 'VARNING',
                getContentOverride: priceDisplayFn,
                columnWidth: 140,
            },
            {
                key: 'hours',
                displayName: 'Timmar',
                getValue: (row: BookingSpecificationEquipmentModel) => row.hours ?? 'N/A',
                getContentOverride: hoursDisplayFn,
                columnWidth: 140,
            },
        ],
    };

    return <TableDisplay entities={rows} configuration={tableSettings} />;
};

export default BookingSpecificationUploader;
