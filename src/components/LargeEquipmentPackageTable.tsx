import React, { ChangeEvent } from 'react';
import { EquipmentPackage, EquipmentTag } from '../models/interfaces';
import { TableDisplay, TableConfiguration } from './TableDisplay';
import { countNullorEmpty, notEmpty } from '../lib/utils';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Col, Form } from 'react-bootstrap';
import TableStyleLink from './utils/TableStyleLink';
import { useLocalStorageState } from '../lib/useLocalStorageState';
import useSwr from 'swr';
import { equipmentTagsFetcher } from '../lib/fetchers';
import EquipmentTagDisplay from './utils/EquipmentTagDisplay';
import AdvancedFilters from './AdvancedFilters';

const EquipmentPackageNameDisplayFn = (equipmentPackage: EquipmentPackage) => (
    <>
        <TableStyleLink href={'equipmentPackage/' + equipmentPackage.id}>{equipmentPackage.name}</TableStyleLink>
        {equipmentPackage.tags.map((x) => (
            <EquipmentTagDisplay tag={x} key={x.id} className="ml-1" />
        ))}
        <div className="text-muted mb-0 d-md-none">
            {equipmentPackage.equipmentEntries.length} delar, {equipmentPackage.estimatedHours} timmar
        </div>
    </>
);

const tableSettings: TableConfiguration<EquipmentPackage> = {
    entityTypeDisplayName: '',
    defaultSortPropertyName: 'name',
    defaultSortAscending: true,
    hideTableFilter: true,
    columns: [
        {
            key: 'name',
            displayName: 'Utrustningspaket',
            getValue: (equipmentPackage: EquipmentPackage) => equipmentPackage.name,
            getContentOverride: EquipmentPackageNameDisplayFn,
        },
        {
            key: 'parts',
            displayName: 'Delar',
            getValue: (equipmentPackage: EquipmentPackage) => equipmentPackage.equipmentEntries.length,
            getContentOverride: (equipmentPackage: EquipmentPackage) =>
                equipmentPackage.equipmentEntries.length + ' st',
            textAlignment: 'center',
            cellHideSize: 'md',
            columnWidth: 120,
        },
        {
            key: 'hours',
            displayName: 'Timmar',
            getValue: (equipmentPackage: EquipmentPackage) => equipmentPackage.estimatedHours,
            getContentOverride: (equipmentPackage: EquipmentPackage) => equipmentPackage.estimatedHours + ' timmar',
            textAlignment: 'center',
            cellHideSize: 'md',
            columnWidth: 120,
        },
    ],
};

type Props = {
    equipmentPackages: EquipmentPackage[];
    tableSettingsOverride?: Partial<TableConfiguration<EquipmentPackage>>;
};

const LargeEquipmentPackageTable: React.FC<Props> = ({ equipmentPackages, tableSettingsOverride }: Props) => {
    const { data: equipmentTags } = useSwr('/api/equipmentTags', equipmentTagsFetcher);

    const [searchText, setSearchText] = useLocalStorageState('large-equipment-package-table-search-text', '');
    const [filterTags, setFilterTags] = useLocalStorageState<EquipmentTag[]>(
        'large-equipment-package-table-filter-tags',
        [],
    );

    // Check stored values against available values and reset stored values if they do not match available ones
    //
    if (equipmentTags && filterTags.some((tag) => !equipmentTags.some((x) => x.id === tag.id))) {
        setFilterTags([]);
    }

    // Handlers for changed bookings
    //
    const handleChangeFilterString = (booking: ChangeEvent<HTMLInputElement>) => {
        setSearchText(booking.target.value);
    };

    // Filter list. Note that the free text filter are handled by the table and not here.
    //
    const equipmentPackageToShow = equipmentPackages.filter(
        (equipmentPackage: EquipmentPackage) =>
            filterTags.length === 0 || filterTags.every((tag) => equipmentPackage.tags.some((x) => x.id === tag.id)),
    );

    return (
        <>
            <AdvancedFilters
                handleChangeFilterString={handleChangeFilterString}
                searchText={searchText}
                resetAdvancedFilters={() => {
                    setSearchText('');
                    setFilterTags([]);
                }}
                activeFilterCount={countNullorEmpty(searchText, filterTags)}
            >
                <Form.Row className="mb-2">
                    <Col md="4">
                        <Form.Group>
                            <Form.Label>Taggar</Form.Label>
                            <Typeahead<EquipmentTag>
                                id="tags-typeahead"
                                multiple
                                labelKey={(x) => x.name}
                                options={equipmentTags ?? []}
                                onChange={(e) => setFilterTags(e)}
                                placeholder="Filtrera på taggar"
                                selected={
                                    filterTags
                                        .map((tag) => equipmentTags?.find((x) => x.id === tag.id))
                                        ?.filter(notEmpty) ?? []
                                }
                            />
                        </Form.Group>
                    </Col>
                </Form.Row>
            </AdvancedFilters>

            <TableDisplay
                entities={equipmentPackageToShow}
                configuration={{ ...tableSettings, ...tableSettingsOverride }}
                filterString={searchText}
            />
        </>
    );
};

export default LargeEquipmentPackageTable;
