import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Dropdown, DropdownButton, Form, InputGroup } from 'react-bootstrap';
import { toIntOrUndefined, updateItemsInArrayById } from '../../lib/utils';
import { EquipmentPrice } from '../../models/interfaces';
import { HasId } from '../../models/interfaces/BaseEntity';
import { TableConfiguration, TableDisplay } from '../TableDisplay';

type Props = {
    prices: EquipmentPrice[];
    onChange: (list: EquipmentPrice[]) => unknown;
};

const PricesEditor: React.FC<Props> = ({ prices, onChange }: Props) => {
    const savePrices = (prices: EquipmentPrice[]) => onChange(prices);

    const getDefaultPrice = (): EquipmentPrice => {
        const nextId = Math.max(0, ...prices.map((x) => x.id)) + 1;

        return {
            id: nextId,
            name: prices.length > 0 ? 'Pris ' + (prices.length + 1) : 'Standardpris',
            pricePerUnit: 0,
            pricePerHour: 0,
            pricePerUnitTHS: 0,
            pricePerHourTHS: 0,
        };
    };

    // List entry modification functions. Note: these will trigger a save of the whole list.
    //
    const updatePrice = (price: EquipmentPrice) => {
        savePrices(updateItemsInArrayById(prices, price));
    };

    const deletePrice = (price: HasId) => {
        savePrices(prices.filter((x) => x.id != price.id));
    };

    // Table display functions
    //
    const PriceEntryNameDisplayFn = (price: EquipmentPrice) => (
        <>
            <p className="mb-0">
                <Form.Control
                    type="text"
                    defaultValue={price.name}
                    onChange={(e) =>
                        updatePrice({
                            ...price,
                            name: e.target.value && e.target.value.length > 0 ? e.target.value : price.name,
                        })
                    }
                />
            </p>
        </>
    );

    const PriceEntryPriceDisplayFn = (price: EquipmentPrice) => (
        <>
            <InputGroup className="mb-1">
                <Form.Control
                    type="number"
                    min="0"
                    defaultValue={price?.pricePerUnit ? price?.pricePerUnit?.toString() : ''}
                    onChange={(e) => updatePrice({ ...price, pricePerUnit: toIntOrUndefined(e.target.value) ?? 0 })}
                />
                <InputGroup.Append>
                    <InputGroup.Text>kr/st</InputGroup.Text>
                </InputGroup.Append>
            </InputGroup>
            <InputGroup>
                <Form.Control
                    type="number"
                    min="0"
                    defaultValue={price?.pricePerHour ? price?.pricePerHour?.toString() : ''}
                    onChange={(e) => updatePrice({ ...price, pricePerHour: toIntOrUndefined(e.target.value) ?? 0 })}
                />
                <InputGroup.Append>
                    <InputGroup.Text>kr/h</InputGroup.Text>
                </InputGroup.Append>
            </InputGroup>
        </>
    );

    const PriceEntryThsPriceDisplayFn = (price: EquipmentPrice) => (
        <>
            <InputGroup className="mb-1">
                <Form.Control
                    type="number"
                    min="0"
                    defaultValue={price?.pricePerUnitTHS ? price?.pricePerUnitTHS?.toString() : ''}
                    onChange={(e) => updatePrice({ ...price, pricePerUnitTHS: toIntOrUndefined(e.target.value) ?? 0 })}
                />
                <InputGroup.Append>
                    <InputGroup.Text>kr/st</InputGroup.Text>
                </InputGroup.Append>
            </InputGroup>
            <InputGroup>
                <Form.Control
                    type="number"
                    min="0"
                    defaultValue={price?.pricePerHourTHS ? price?.pricePerHourTHS?.toString() : ''}
                    onChange={(e) => updatePrice({ ...price, pricePerHourTHS: toIntOrUndefined(e.target.value) ?? 0 })}
                />
                <InputGroup.Append>
                    <InputGroup.Text>kr/h</InputGroup.Text>
                </InputGroup.Append>
            </InputGroup>
        </>
    );

    const PriceEntryActionsDisplayFn = (price: EquipmentPrice) => {
        return (
            <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                <Dropdown.Item onClick={() => deletePrice(price)} className="text-danger">
                    <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort pris
                </Dropdown.Item>
            </DropdownButton>
        );
    };

    // Table settings
    //
    const tableSettings: TableConfiguration<EquipmentPrice> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        noResultsLabel: 'Inga priser konfigurerade',
        columns: [
            {
                key: 'name',
                displayName: 'Namn',
                getValue: (entry: EquipmentPrice) => entry.name ?? '',
                getContentOverride: PriceEntryNameDisplayFn,
            },
            {
                key: 'price',
                displayName: 'Pris',
                disableSort: true,
                getValue: (entry: EquipmentPrice) => entry.pricePerUnit + ' ' + entry.pricePerHour,
                getContentOverride: PriceEntryPriceDisplayFn,
                textAlignment: 'center',
                columnWidth: 170,
            },
            {
                key: 'ThsPrice',
                displayName: 'Pris (THS)',
                disableSort: true,
                getValue: (entry: EquipmentPrice) => entry.pricePerUnitTHS + ' ' + entry.pricePerHourTHS,
                getContentOverride: PriceEntryThsPriceDisplayFn,
                textAlignment: 'center',
                columnWidth: 170,
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                disableSort: true,
                getContentOverride: PriceEntryActionsDisplayFn,
                columnWidth: 75,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <>
            <TableDisplay entities={prices} configuration={tableSettings} />

            <div className="mb-4">
                <Button size="sm" variant="secondary" onClick={() => savePrices([...prices, getDefaultPrice()])}>
                    <FontAwesomeIcon icon={faPlus} className="mr-1" /> Lägg till pris
                </Button>
            </div>
        </>
    );
};

export default PricesEditor;
