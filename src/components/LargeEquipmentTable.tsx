import React, { ChangeEvent } from 'react';
import { Equipment, EquipmentTag } from '../models/interfaces';
import { TableDisplay, TableConfiguration } from './TableDisplay';
import { countNotNullorEmpty, notEmpty } from '../lib/utils';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faTags } from '@fortawesome/free-solid-svg-icons';
import TableStyleLink from './utils/TableStyleLink';
import useSwr from 'swr';
import { equipmentLocationsFetcher, equipmentTagsFetcher } from '../lib/fetchers';
import { formatPrice, addVATToPriceWithTHS, formatTHSPrice, addVAT } from '../lib/pricingUtils';
import EquipmentTagDisplay from './utils/EquipmentTagDisplay';
import { EquipmentLocation } from '../models/interfaces/EquipmentLocation';
import { getSortedList } from '../lib/sortIndexUtils';
import AdvancedFilters from './AdvancedFilters';
import { useSessionStorageState } from '../lib/useSessionStorageState';
import { ImageHideOnError } from './equipment/ImageHideOnError';

const EquipmentImageDisplayFn = (equipment: Equipment) => (
    <>
        {process.env.NEXT_PUBLIC_EQUIPMENT_IMAGE_BASEURL ? (
            <ImageHideOnError
                src={process.env.NEXT_PUBLIC_EQUIPMENT_IMAGE_BASEURL + equipment.id}
                altText={equipment.name}
            />
        ) : null}
    </>
);

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
        {equipment.inventoryCount === null ? null : (
            <div className="text-muted mb-0 d-md-none">{equipment.inventoryCount + ' st'}</div>
        )}
    </>
);

const EquipmentPriceDisplayFn = (equipment: Equipment) => {
    switch (equipment.prices.length) {
        case 0:
            return '-';
        case 1:
            if (
                !equipment.prices[0].pricePerUnit &&
                !equipment.prices[0].pricePerHour &&
                !equipment.prices[0].pricePerUnitTHS &&
                !equipment.prices[0].pricePerHourTHS
            ) {
                return '-';
            }
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
            key: 'image',
            displayName: 'Bild',
            getValue: (equipment: Equipment) => equipment.id,
            getContentOverride: EquipmentImageDisplayFn,
            columnWidth: 75,
        },
        {
            key: 'name',
            displayName: 'Utrustning',
            getValue: (equipment: Equipment) =>
                equipment.name + ' ' + equipment.description + ' ' + equipment.searchKeywords,
            getHeadingValue: (equipment: Equipment) => equipment.name.charAt(0),
            getContentOverride: EquipmentNameDisplayFn,
        },
        {
            key: 'location',
            displayName: 'Plats',
            getValue: (equipment: Equipment) => equipment.equipmentLocation?.name ?? '-',
            getHeadingValue: (equipment: Equipment) => equipment.equipmentLocation?.name ?? '-',
            cellHideSize: 'xl',
            columnWidth: 200,
        },
        {
            key: 'count',
            displayName: 'Antal',
            getValue: (equipment: Equipment) => equipment.inventoryCount ?? '-',
            getContentOverride: (equipment: Equipment) =>
                equipment.inventoryCount === null ? '-' : equipment.inventoryCount + ' st',
            getHeadingValue: (equipment: Equipment) =>
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
                          equipment.prices[0].pricePerHour
                              .add(equipment.prices[0].pricePerUnit)
                              .add(equipment.prices[0].pricePerHourTHS)
                              .add(equipment.prices[0].pricePerUnitTHS),
                      ).divide(4).value
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
    const { data: equipmentLocations } = useSwr('/api/equipmentLocations', equipmentLocationsFetcher);

    const [searchText, setSearchText] = useSessionStorageState('equipment-page-search-text', '');
    const [filterTags, setFilterTags] = useSessionStorageState<EquipmentTag[]>('equipment-page-filter-tags', []);
    const [filterLocations, setFilterLocations] = useSessionStorageState<EquipmentLocation[]>(
        'equipment-page-filter-location',
        [],
    );
    const [filterPubliclyHidden, setFilterPubliclyHidden] = useSessionStorageState(
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
                filterLocations.length === 0 ||
                filterLocations.some((location) => location.id === equipment.equipmentLocation?.id),
        )
        .filter(
            (equipment: Equipment) =>
                filterPubliclyHidden === 'all' ||
                (filterPubliclyHidden === 'true' && equipment.publiclyHidden) ||
                (filterPubliclyHidden === 'false' && !equipment.publiclyHidden),
        );

    return (
        <>
            <AdvancedFilters
                handleChangeFilterString={handleChangeFilterString}
                searchText={searchText}
                resetAdvancedFilters={() => {
                    setSearchText('');
                    setFilterTags([]);
                    setFilterLocations([]);
                    setFilterPubliclyHidden('all');
                }}
                activeFilterCount={countNotNullorEmpty(
                    searchText,
                    filterTags,
                    filterLocations,
                    filterPubliclyHidden !== 'all',
                )}
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
                    <Col md="4">
                        <Form.Group>
                            <Form.Label>Platser</Form.Label>
                            <Typeahead<EquipmentLocation>
                                id="tags-typeahead"
                                multiple
                                labelKey={(x) => x.name}
                                options={getSortedList(equipmentLocations ?? [])}
                                onChange={(e) => setFilterLocations(e)}
                                placeholder="Filtrera på plats"
                                selected={
                                    filterLocations
                                        .map((location) => equipmentLocations?.find((x) => x.id === location.id))
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
                                value={filterPubliclyHidden}
                            >
                                <option value="all">Visa alla</option>
                                <option value="false">Synlig i publika prislistan</option>
                                <option value="true">Gömd</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Form.Row>
            </AdvancedFilters>

            <TableDisplay
                entities={equipmentToShow}
                configuration={{ ...tableSettings, ...tableSettingsOverride }}
                filterString={searchText}
            />
        </>
    );
};

export default LargeEquipmentTable;
