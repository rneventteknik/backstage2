import React, { ChangeEvent, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Equipment } from '../../models/interfaces';
import useSwr from 'swr';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { formatPrice, formatTHSPrice, getResponseContentOrError } from '../../lib/utils';
import Link from 'next/link';
import { Alert, Badge, Button, Col, Collapse, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ActivityIndicator from '../../components/utils/ActivityIndicator';
import { EquipmentObjectionModel, IEquipmentCategoryObjectionModel } from '../../models/objection-models';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { toEquipment, toEquipmentCategory } from '../../lib/mappers/equipment';
import { faEyeSlash, faFilter, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Typeahead } from 'react-bootstrap-typeahead';
import { EquipmentCategory } from '../../models/interfaces';

const EquipmentNameDisplayFn = (equipment: Equipment) => (
    <>
        <Link href={'equipment/' + equipment.id}>{equipment.name}</Link>
        {equipment.publiclyHidden ? (
            <span className="small text-muted ml-1">
                <FontAwesomeIcon icon={faEyeSlash} title="Gömd i den publika prislistan"></FontAwesomeIcon>
            </span>
        ) : null}
        <p className="text-muted mb-0">{equipment.description}</p>
    </>
);
const EquipmentCategoryDisplayFn = (equipment: Equipment) => (
    <>
        {equipment.categories.map((x) => (
            <Badge variant="dark" key={x.id} className="mr-1">
                {x.name}
            </Badge>
        ))}
    </>
);
const EquipmentPriceDisplayFn = (equipment: Equipment) => {
    switch (equipment.prices.length) {
        case 0:
            return '-';
        case 1:
            return (
                <>
                    {formatPrice(equipment.prices[0])}
                    <br />
                    {formatTHSPrice(equipment.prices[0])}
                </>
            );
        default:
            return (
                <OverlayTrigger
                    placement="right"
                    overlay={
                        <Tooltip id="1">
                            <small>
                                {equipment.prices.map((p) => (
                                    <p key={p.id}>
                                        <h2 style={{ fontSize: '1em' }}>{p.name}</h2>
                                        {formatPrice(p)}
                                        <br />
                                        {formatTHSPrice(p)}
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
const EquipmentActionsDisplayFn = (equipment: Equipment) => <Link href={'equipment/' + equipment.id}>Redigera</Link>;

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
            key: 'categories',
            displayName: 'Kategorier',
            getValue: (equipment: Equipment) => equipment.categories.map((x) => x.name).join(', '),
            getContentOverride: EquipmentCategoryDisplayFn,
            disableSort: true,
            columnWidth: 280,
        },
        {
            key: 'count',
            displayName: 'Antal',
            getValue: (equipment: Equipment) => equipment.inventoryCount,
            getContentOverride: (equipment: Equipment) => equipment.inventoryCount + ' st',
            textAlignment: 'center',
            columnWidth: 180,
        },
        {
            key: 'price',
            displayName: 'Pris',
            getValue: () => '',
            disableSort: true,
            getContentOverride: EquipmentPriceDisplayFn,
            textAlignment: 'center',
            columnWidth: 180,
        },
        {
            key: 'actions',
            displayName: '',
            getValue: () => '',
            getContentOverride: EquipmentActionsDisplayFn,
            disableSort: true,
            columnWidth: 100,
            textAlignment: 'center',
        },
    ],
};

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Utrustning';
const breadcrumbs = [{ link: 'equipment', displayName: pageTitle }];

const EquipmentListPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: equipment, error, isValidating } = useSwr('/api/equipment', fetcher);
    const { data: equipmentCategories } = useSwr('/api/equipmentCategories/', equipmentCategoriesFetcher);

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterCategories, setFilterCategories] = useState<EquipmentCategory[]>([]);
    const [filterPubliclyHidden, setFilterPubliclyHidden] = useState('all');

    if (!equipment && !error && isValidating) {
        return (
            <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {pageTitle} </h1>
                <hr />
                <div className="text-center py-5">
                    <ActivityIndicator />
                </div>
            </Layout>
        );
    }

    if (error || !equipment) {
        return (
            <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {pageTitle} </h1>
                <hr />
                <Alert variant="danger">
                    <strong> Fel </strong> Utrustningslistan kunde inte hämtas
                </Alert>
            </Layout>
        );
    }

    // Handlers for changed events
    //
    const handleChangeFilterString = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    // Filter list. Note that the free text filter are handled by the table and not here.
    //
    const equipmentToShow = equipment
        .filter(
            (equipment: Equipment) =>
                filterCategories.length === 0 ||
                filterCategories.every((category) => equipment.categories.some((x) => x.id === category.id)),
        )
        .filter(
            (equipment: Equipment) =>
                filterPubliclyHidden === 'all' ||
                (filterPubliclyHidden === 'true' && equipment.publiclyHidden) ||
                (filterPubliclyHidden === 'false' && !equipment.publiclyHidden),
        );

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} currentUser={currentUser}>
            <div className="float-right">
                <Link href="/equipment/new">
                    <Button variant="primary" as="span">
                        Lägg till utrustning
                    </Button>
                </Link>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

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
                            <Form.Label>Kategorier</Form.Label>
                            <Typeahead<EquipmentCategory>
                                id="categories-typeahead"
                                multiple
                                labelKey={(x) => x.name}
                                options={equipmentCategories ?? []}
                                onChange={(e) => setFilterCategories(e)}
                                placeholder="Filtrera på kategori"
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

const fetcher = (url: string) =>
    fetch(url)
        .then((response) => getResponseContentOrError<EquipmentObjectionModel[]>(response))
        .then((objectionModel) => objectionModel.map((x) => toEquipment(x)));

const equipmentCategoriesFetcher = (url: string) =>
    fetch(url)
        .then((apiResponse) => getResponseContentOrError<IEquipmentCategoryObjectionModel[]>(apiResponse))
        .then((equipmentList) => equipmentList.map((x) => toEquipmentCategory(x)));

export default EquipmentListPage;
