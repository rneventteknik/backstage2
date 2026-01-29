import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { IEquipmentObjectionModel } from '../../models/objection-models';
import { Equipment } from '../../models/interfaces';
import { toEquipment } from '../../lib/mappers/equipment';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import EquipmentSearch from '../EquipmentSearch';
import { fixSortIndexUniqueness, getNextSortIndex, moveItemToItem, sortIndexSortFn } from '../../lib/sortIndexUtils';
import { getPricePlanName, getResponseContentOrError, toIntOrUndefined, updateItemsInArrayById } from '../../lib/utils';
import { formatPrice, formatTHSPrice } from '../../lib/pricingUtils';
import { PricePlan } from '../../models/enums/PricePlan';
import { getDefaultSelectedPrice } from '../../lib/equipmentListUtils';
import { BaseEntity } from '../../models/interfaces/BaseEntity';
import { EquipmentPackageEntry } from '../../models/interfaces/EquipmentPackage';
import { ConnectedEquipmentEntry } from '../../models/interfaces/Equipment';

export interface EquipmentEntry extends BaseEntity {
    equipmentId: number;
    equipment?: Equipment;
    equipmentPriceId: number | null;
    numberOfUnits?: number;
    numberOfHours?: number;
    sortIndex: number;
    isHidden: boolean;
    isFree: boolean;
}

export const EquipmentEntryFromEquipmentPackageEntry = (entry: EquipmentPackageEntry): EquipmentEntry => ({
    ...entry,
});
export const EquipmentEntryFromConnectedEquipmentEntry = (entry: ConnectedEquipmentEntry): EquipmentEntry => ({
    ...entry,
    equipmentId: entry.connectedEquipmentId,
    equipment: entry.connectedEquipment,
});
export const EquipmentPackageEntryFromEquipmentEntry = (entry: EquipmentEntry): EquipmentPackageEntry => ({
    id: entry.id,
    equipmentId: entry.equipmentId,
    equipment: entry.equipment,
    equipmentPriceId: entry.equipmentPriceId,
    numberOfUnits: entry.numberOfUnits!,
    numberOfHours: entry.numberOfHours!,
    sortIndex: entry.sortIndex,
    isHidden: entry.isHidden,
    isFree: entry.isFree,
});
export const ConnectedEquipmentEntryFromEquipmentEntry = (entry: EquipmentEntry): ConnectedEquipmentEntry => ({
    id: entry.id,
    connectedEquipmentId: entry.equipmentId,
    connectedEquipment: entry.equipment,
    equipmentPriceId: entry.equipmentPriceId,
    sortIndex: entry.sortIndex,
    isHidden: entry.isHidden,
    isFree: entry.isFree,
});

type Props = {
    selectedEquipmentEntries: EquipmentEntry[];
    setSelectedEquipmentEntries: (EquipmentEntryEntries: EquipmentEntry[]) => void;
    showCounts?: boolean;
};

export const IncludedOrRelatedEquipmentEditor: React.FC<Props> = ({
    selectedEquipmentEntries,
    setSelectedEquipmentEntries,
    showCounts = true,
}: Props) => {
    const addEquipment = (equipment: Equipment) => {
        if (!equipment.id) {
            throw 'Invalid equipment';
        }

        const nextId = Math.max(1, ...selectedEquipmentEntries.map((x) => x.id)) + 1;
        const defaultPrice = equipment.prices && equipment.prices[0] ? getDefaultSelectedPrice(equipment.prices) : null;

        const equipmentEntry: EquipmentEntry = {
            id: nextId, // This id is only used in the client, it is striped before sending to the server
            numberOfUnits: 1,
            numberOfHours: 0,
            isFree: false,
            isHidden: false,
            equipment: equipment,
            equipmentId: equipment.id,
            equipmentPriceId: defaultPrice?.id ?? null,
            sortIndex: getNextSortIndex(selectedEquipmentEntries),
        };
        setSelectedEquipmentEntries(fixSortIndexUniqueness([...selectedEquipmentEntries, equipmentEntry]));
    };

    const deleteEquipment = (equipmentEntry: EquipmentEntry) => {
        setSelectedEquipmentEntries(selectedEquipmentEntries.filter((x) => x.id !== equipmentEntry.id));
    };

    const EquipmentEntryPriceDisplayFn = (equipmentEntry: EquipmentEntry) => (
        <InputGroup className="mb-1">
            <Form.Control
                as="select"
                defaultValue={equipmentEntry.equipmentPriceId ?? undefined}
                onChange={(e) => {
                    const newEquipmentPrice = equipmentEntry.equipment?.prices.filter(
                        (x) => x.id == toIntOrUndefined(e.target.value),
                    )[0];

                    equipmentEntry.equipmentPriceId = newEquipmentPrice?.id ?? null;
                }}
            >
                <option value={undefined} className="font-italic">
                    Odefinerat
                </option>
                {equipmentEntry.equipment?.prices?.map((x) => (
                    <option key={x.id.toString()} value={x.id.toString()}>
                        {x.name} ({getPricePlanName(PricePlan.EXTERNAL)} {formatPrice(x)},{' '}
                        {getPricePlanName(PricePlan.THS)} {formatTHSPrice(x)})
                    </option>
                ))}
            </Form.Control>
        </InputGroup>
    );

    const EquipmentEntryNumberOfUnitsDisplayFn = (equipmentEntry: EquipmentEntry) => (
        <InputGroup className="mb-1">
            <Form.Control
                required
                type="text"
                name={'EquipmentEntryNumberOfUnits-' + equipmentEntry.id}
                defaultValue={equipmentEntry.numberOfUnits}
                onChange={(e) => {
                    equipmentEntry.numberOfUnits = parseInt(e.target.value);
                }}
            />
            <InputGroup.Text>st</InputGroup.Text>
        </InputGroup>
    );

    const EquipmentEntryNumberOfHoursDisplayFn = (equipmentEntry: EquipmentEntry) => (
        <InputGroup className="mb-1">
            <Form.Control
                required
                type="text"
                name={'EquipmentEntryNumberOfHours-' + equipmentEntry.id}
                defaultValue={equipmentEntry.numberOfHours}
                onChange={(e) => {
                    equipmentEntry.numberOfHours = parseInt(e.target.value);
                }}
            />
            <InputGroup.Text>h</InputGroup.Text>
        </InputGroup>
    );

    const EquipmentEntryIsFreeDisplayFn = (equipmentEntry: EquipmentEntry) => (
        <Form.Check
            type="checkbox"
            defaultChecked={equipmentEntry.isFree}
            onChange={(e) => (equipmentEntry.isFree = e.target.checked)}
        />
    );

    const EquipmentEntryIsHiddenDisplayFn = (equipmentEntry: EquipmentEntry) => (
        <Form.Check
            type="checkbox"
            defaultChecked={equipmentEntry.isHidden}
            onChange={(e) => (equipmentEntry.isHidden = e.target.checked)}
        />
    );

    const EquipmentEntryActionsDisplayFn = (equipmentEntry: EquipmentEntry) => (
        <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
                deleteEquipment(equipmentEntry);
            }}
        >
            Ta bort
        </Button>
    );

    const moveFn = (a: EquipmentEntry, b: EquipmentEntry) =>
        setSelectedEquipmentEntries(
            updateItemsInArrayById(selectedEquipmentEntries, ...moveItemToItem(selectedEquipmentEntries, a, b)),
        );

    const equipmentTableSettings: TableConfiguration<EquipmentEntry> = {
        entityTypeDisplayName: '',
        noResultsLabel: 'Ingen utrustning konfigurerad',
        customSortFn: sortIndexSortFn,
        moveFn: moveFn,
        defaultSortAscending: true,
        hideTableCountControls: true,
        hideTableFilter: true,
        columns: [
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (equipmentEntry: EquipmentEntry) => equipmentEntry.equipment?.name ?? '',
            },
            {
                key: 'isFree',
                displayName: 'Utan pris',
                getValue: (equipmentEntry: EquipmentEntry) => (equipmentEntry.isFree ? 'true' : 'false'),
                getContentOverride: EquipmentEntryIsFreeDisplayFn,
                columnWidth: 100,
                textAlignment: 'center',
            },
            {
                key: 'isHidden',
                displayName: 'Göm för kund',
                getValue: (equipmentEntry: EquipmentEntry) => (equipmentEntry.isHidden ? 'true' : 'false'),
                getContentOverride: EquipmentEntryIsHiddenDisplayFn,
                columnWidth: 140,
                textAlignment: 'center',
            },
            {
                key: 'price',
                displayName: 'Pris',
                getValue: (equipmentEntry: EquipmentEntry) => equipmentEntry.equipmentPriceId ?? '',
                getContentOverride: EquipmentEntryPriceDisplayFn,
                columnWidth: 180,
            },
            ...(showCounts
                ? [
                      {
                          key: 'number',
                          displayName: 'Antal',
                          getValue: (equipmentEntry: EquipmentEntry) => equipmentEntry.numberOfUnits!,
                          getContentOverride: EquipmentEntryNumberOfUnitsDisplayFn,
                          columnWidth: 140,
                      },
                      {
                          key: 'hours',
                          displayName: 'Antal timmar',
                          getValue: (equipmentEntry: EquipmentEntry) => equipmentEntry.numberOfUnits!,
                          getContentOverride: EquipmentEntryNumberOfHoursDisplayFn,
                          columnWidth: 140,
                      },
                  ]
                : []),
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                getContentOverride: EquipmentEntryActionsDisplayFn,
                disableSort: true,
                columnWidth: 100,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <div>
            <div className="mb-3 mt-3">
                <TableDisplay entities={selectedEquipmentEntries} configuration={equipmentTableSettings} />
            </div>
            <div className="mb-3">
                <EquipmentSearch
                    placeholder="Lägg till utrustning"
                    includePackages={false}
                    defaultResults={[]}
                    id="equipment-search"
                    onSelect={(x) =>
                        fetch('/api/equipment/' + x.id)
                            .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
                            .then(toEquipment)
                            .then((equipment) => {
                                addEquipment(equipment);
                            })
                    }
                />
            </div>
        </div>
    );
};
