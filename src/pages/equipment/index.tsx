import React, { ChangeEvent, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Equipment, EquipmentTag } from '../../models/interfaces';
import useSwr from 'swr';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import Link from 'next/link';
import { Button, Col, Collapse, Dropdown, DropdownButton, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import {
    faAdd,
    faArchive,
    faCalendarXmark,
    faCubes,
    faEyeSlash,
    faFileImport,
    faFilter,
    faTags,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Typeahead } from 'react-bootstrap-typeahead';
import Header from '../../components/layout/Header';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { equipmentTagsFetcher, equipmentsFetcher } from '../../lib/fetchers';
import TableStyleLink from '../../components/utils/TableStyleLink';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { addVAT, addVATToPriceWithTHS, formatPrice, formatTHSPrice } from '../../lib/pricingUtils';
import { IfAdmin, IfNotReadonly } from '../../components/utils/IfAdmin';
import EquipmentTagDisplay from '../../components/utils/EquipmentTagDisplay';
import { KeyValue } from '../../models/interfaces/KeyValue';

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

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Utrustning';
const breadcrumbs = [{ link: 'equipment', displayName: pageTitle }];

const EquipmentListPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { data: equipment, error } = useSwr('/api/equipment', equipmentsFetcher);
    const { data: equipmentTags } = useSwr('/api/equipmentTags', equipmentTagsFetcher);

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterTags, setFilterTags] = useState<EquipmentTag[]>([]);
    const [filterPubliclyHidden, setFilterPubliclyHidden] = useState('all');

    if (error) {
        return (
            <ErrorPage
                errorMessage={error.message}
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            />
        );
    }

    if (!equipment) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
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
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href="/equipment/new" passHref>
                        <Button variant="primary" as="span">
                            <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till utrustning
                        </Button>
                    </Link>
                </IfNotReadonly>
                <Link href="/equipmentPackage" passHref>
                    <Button variant="dark" as="span">
                        <FontAwesomeIcon icon={faCubes} className="mr-1" /> Visa utrustningspaket
                    </Button>
                </Link>
                <DropdownButton id="mer-dropdown-button" variant="dark" title="Mer" className="d-inline-block">
                    <Link href="/equipment/compare-availability" passHref>
                        <Dropdown.Item href={'/equipment/compare-availability'}>
                            <FontAwesomeIcon icon={faCalendarXmark} className="mr-1 fa-fw" /> Jämför tillgänglighet
                        </Dropdown.Item>
                    </Link>
                    <IfAdmin currentUser={currentUser}>
                        <Link href="/equipment/archived" passHref>
                            <Dropdown.Item href={'/equipment/archived'}>
                                <FontAwesomeIcon icon={faArchive} className="mr-1 fa-fw" /> Visa arkiverad utrustning
                            </Dropdown.Item>
                        </Link>
                        <Link href="/equipment/json-import" passHref>
                            <Dropdown.Item href={'/equipment/json-import'}>
                                <FontAwesomeIcon icon={faFileImport} className="mr-1 fa-fw" /> Importera utrustning från
                                JSON
                            </Dropdown.Item>
                        </Link>
                    </IfAdmin>
                </DropdownButton>
            </Header>

            <Form.Row>
                <Col>
                    <Form.Group>
                        <Form.Control type="text" placeholder="Fritextfilter" onChange={handleChangeFilterString} />
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
                            >
                                <option value="all">Visa alla</option>
                                <option value="false">Synlig i publika prislistan</option>
                                <option value="true">Gömd</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Form.Row>
            </Collapse>

            <TableDisplay entities={equipmentToShow} configuration={tableSettings} filterString={searchText} />
        </Layout>
    );
};

export default EquipmentListPage;
