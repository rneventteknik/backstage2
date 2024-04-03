import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Badge, Button, Dropdown, DropdownButton, Form, InputGroup } from 'react-bootstrap';
import { addVATToPriceWithTHS, formatPrice, formatTHSPrice } from '../../lib/pricingUtils';
import { idSortFn } from '../../lib/sortIndexUtils';
import { getPricePlanName, toIntOrUndefined, updateItemsInArrayById } from '../../lib/utils';
import { PricePlan } from '../../models/enums/PricePlan';
import { EquipmentPrice } from '../../models/interfaces';
import { HasId } from '../../models/interfaces/BaseEntity';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import { FormNumberFieldWithoutScroll } from '../utils/FormNumberFieldWithoutScroll';

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
                {price.id === Math.min(...prices.map((x) => x.id)) && prices.length > 1 ? (
                    <Badge variant="dark" className="mb-2">
                        Standardvärde
                    </Badge>
                ) : null}
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
                <FormNumberFieldWithoutScroll
                    type="number"
                    min="0"
                    defaultValue={price?.pricePerUnit ? price?.pricePerUnit?.toString() : ''}
                    onChange={(e) => updatePrice({ ...price, pricePerUnit: toIntOrUndefined(e.target.value) ?? 0 })}
                />
                <InputGroup.Text>kr/st</InputGroup.Text>
            </InputGroup>
            <InputGroup>
                <FormNumberFieldWithoutScroll
                    type="number"
                    min="0"
                    defaultValue={price?.pricePerHour ? price?.pricePerHour?.toString() : ''}
                    onChange={(e) => updatePrice({ ...price, pricePerHour: toIntOrUndefined(e.target.value) ?? 0 })}
                />
                <InputGroup.Text>kr/h</InputGroup.Text>
            </InputGroup>
            <p className="text-muted text-left mt-1 mb-0 small">
                Pris ink. moms: {formatPrice(addVATToPriceWithTHS(price))}
            </p>
        </>
    );

    const PriceEntryThsPriceDisplayFn = (price: EquipmentPrice) => (
        <>
            <InputGroup className="mb-1">
                <FormNumberFieldWithoutScroll
                    type="number"
                    min="0"
                    defaultValue={price?.pricePerUnitTHS ? price?.pricePerUnitTHS?.toString() : ''}
                    onChange={(e) => updatePrice({ ...price, pricePerUnitTHS: toIntOrUndefined(e.target.value) ?? 0 })}
                />
                <InputGroup.Text>kr/st</InputGroup.Text>
            </InputGroup>
            <InputGroup>
                <FormNumberFieldWithoutScroll
                    type="number"
                    min="0"
                    defaultValue={price?.pricePerHourTHS ? price?.pricePerHourTHS?.toString() : ''}
                    onChange={(e) => updatePrice({ ...price, pricePerHourTHS: toIntOrUndefined(e.target.value) ?? 0 })}
                />
                <InputGroup.Text>kr/h</InputGroup.Text>
            </InputGroup>
            <p className="text-muted text-left mt-1 mb-0 small">
                Pris ink. moms: {formatTHSPrice(addVATToPriceWithTHS(price))}
            </p>
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
        hideTableFilter: true,
        hideTableCountControls: true,
        customSortFn: idSortFn,
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
                displayName: `${getPricePlanName(PricePlan.EXTERNAL)} (ex. moms)`,
                disableSort: true,
                getValue: (entry: EquipmentPrice) => entry.pricePerUnit + ' ' + entry.pricePerHour,
                getContentOverride: PriceEntryPriceDisplayFn,
                textAlignment: 'center',
                columnWidth: 210,
            },
            {
                key: 'ThsPrice',
                displayName: `${getPricePlanName(PricePlan.THS)} (ex. moms)`,
                disableSort: true,
                getValue: (entry: EquipmentPrice) => entry.pricePerUnitTHS + ' ' + entry.pricePerHourTHS,
                getContentOverride: PriceEntryThsPriceDisplayFn,
                textAlignment: 'center',
                columnWidth: 210,
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
