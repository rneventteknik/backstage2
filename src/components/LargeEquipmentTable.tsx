import React, { ChangeEvent } from 'react';
import { Equipment, EquipmentTag } from '../models/interfaces';
import { TableDisplay, TableConfiguration } from './TableDisplay';
import { notEmpty } from '../lib/utils';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Button, Col, Collapse, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faFilter, faTags } from '@fortawesome/free-solid-svg-icons';
import TableStyleLink from './utils/TableStyleLink';
import { useLocalStorageState } from '../lib/useLocalStorageState';
import useSwr from 'swr';
import { equipmentTagsFetcher } from '../lib/fetchers';
import { formatPrice, addVATToPriceWithTHS, formatTHSPrice, addVAT } from '../lib/pricingUtils';
import EquipmentTagDisplay from './utils/EquipmentTagDisplay';

const EquipmentNameDisplayFn = (equipment: Equipment) => (
    <>
        <TableStyleLink href={'equipment/' + equipment.id}>{equipment.name}</TableStyleLink>
        {equipment.publiclyHidden ? (
            <span className="small text-muted ml-1">
                <FontAwesomeIcon icon={faEyeSlash} title="Gömd i den publika prislistan"></FontAwesomeIcon>
            </span>
        ) : null}
        {equipment.tags.map((x) => (
            <EquipmentTagDisplay tag={x} key={x.id} className="ml-1" />
        ))}
        <div className="text-muted mb-0">{equipment.description}</div>
        <div className="text-muted mb-0 d-md-none">{equipment.inventoryCount + ' st'}</div>
    </>
);

const EquipmentPriceDisplayFn = (equipment: Equipment) => {
    switch (equipment.prices.length) {
        case 0:
            return '-';
        case 1:
            return (
                <>
                    {formatPrice(addVATToPriceWithTHS(equipment.prices[0]))}
                    <br />
                    {formatTHSPrice(addVATToPriceWithTHS(equipment.prices[0]))}
                </>
            );
        default:
            return (
                <OverlayTrigger
                    placement="left"
                    overlay={
                        <Tooltip id="1">
                            <small>
                                {equipment.prices.map((p) => (
                                    <p key={p.id}>
                                        <h2 style={{ fontSize: '1em' }}>{p.name}</h2>
                                        {formatPrice(addVATToPriceWithTHS(p))}
                                        <br />
                                        {formatTHSPrice(addVATToPriceWithTHS(p))}
                                    </p>
                                ))}
                            </small>
                        </Tooltip>
                    }
                >
                    <span className="font-italic">
                        <FontAwesomeIcon icon={faTags}></FontAwesomeIcon>
                    </span>
                </OverlayTrigger>
            );
    }
};

const tableSettings: TableConfiguration<Equipment> = {
    entityTypeDisplayName: '',
    defaultSortPropertyName: 'name',
    defaultSortAscending: true,
    hideTableFilter: true,
    columns: [
        {
            key: 'name',
            displayName: 'Utrustning',
            getValue: (equipment: Equipment) => equipment.name + ' ' + equipment.description,
            getContentOverride: EquipmentNameDisplayFn,
        },
        {
            key: 'location',
            displayName: 'Plats',
            getValue: (equipment: Equipment) => equipment.equipmentLocation?.name ?? '-',
            cellHideSize: 'xl',
            columnWidth: 200,
        },
        {
            key: 'count',
            displayName: 'Antal',
            getValue: (equipment: Equipment) => equipment.inventoryCount ?? '-',
            getContentOverride: (equipment: Equipment) =>
                equipment.inventoryCount === null ? '-' : equipment.inventoryCount + ' st',
            textAlignment: 'center',
            cellHideSize: 'md',
            columnWidth: 120,
        },
        {
            key: 'price',
            displayName: 'Pris',
            getValue: (equipment: Equipment) =>
                equipment.prices && equipment.prices.length === 1
                    ? addVAT(
                          equipment.prices[0].pricePerHour +
                              equipment.prices[0].pricePerUnit +
                              equipment.prices[0].pricePerHourTHS +
                              equipment.prices[0].pricePerUnitTHS,
                      ) / 4
                    : -Infinity,
            getContentOverride: EquipmentPriceDisplayFn,
            columnWidth: 120,
            textAlignment: 'center',
        },
    ],
};

type Props = {
    equipment: Equipment[];
    tableSettingsOverride?: Partial<TableConfiguration<Equipment>>;
};

const LargeEquipmentTable: React.FC<Props> = ({ equipment, tableSettingsOverride }: Props) => {
    const { data: equipmentTags } = useSwr('/api/equipmentTags', equipmentTagsFetcher);

    const [showAdvancedFilters, setShowAdvancedFilters] = useLocalStorageState(
        'large-equipment-table-show-advanced-filters',
        false,
    );
    const [searchText, setSearchText] = useLocalStorageState('equipment-page-search-text', '');
    const [filterTags, setFilterTags] = useLocalStorageState<EquipmentTag[]>('equipment-page-filter-tags', []);
    const [filterPubliclyHidden, setFilterPubliclyHidden] = useLocalStorageState(
        'equipment-page-publicly-hidden',
        'all',
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
    const equipmentToShow = equipment
        .filter(
            (equipment: Equipment) =>
                filterTags.length === 0 || filterTags.every((tag) => equipment.tags.some((x) => x.id === tag.id)),
        )
        .filter(
            (equipment: Equipment) =>
                filterPubliclyHidden === 'all' ||
                (filterPubliclyHidden === 'true' && equipment.publiclyHidden) ||
                (filterPubliclyHidden === 'false' && !equipment.publiclyHidden),
        );

    return (
        <>
            <Form.Row>
                <Col>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Fritextfilter"
                            onChange={handleChangeFilterString}
                            defaultValue={searchText}
                        />
                    </Form.Group>
                </Col>
                <Col md="auto">
                    <Form.Group>
                        <Button variant="dark" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                            <FontAwesomeIcon icon={faFilter} /> {showAdvancedFilters ? 'Göm' : 'Visa'} filter
                        </Button>
                    </Form.Group>
                </Col>
            </Form.Row>

            <Collapse in={showAdvancedFilters}>
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
                    <Col md="4">
                        <Form.Group>
                            <Form.Label>Publika prislistan</Form.Label>
                            <Form.Control
                                as="select"
                                name="publiclyHidden"
                                onChange={(e) => setFilterPubliclyHidden(e.target.value)}
                                defaultValue={filterPubliclyHidden}
                            >
                                <option value="all">Visa alla</option>
                                <option value="false">Synlig i publika prislistan</option>
                                <option value="true">Gömd</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Form.Row>
            </Collapse>

            <TableDisplay
                entities={equipmentToShow}
                configuration={{ ...tableSettings, ...tableSettingsOverride }}
                filterString={searchText}
            />
        </>
    );
};

export default LargeEquipmentTable;
