import React, { ChangeEvent, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { EquipmentPackage, EquipmentTag } from '../../models/interfaces';
import useSwr from 'swr';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { getResponseContentOrError } from '../../lib/utils';
import Link from 'next/link';
import { Button, Col, Collapse, Form } from 'react-bootstrap';
import { EquipmentPackageObjectionModel, IEquipmentTagObjectionModel } from '../../models/objection-models';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { faAdd, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Typeahead } from 'react-bootstrap-typeahead';
import { toEquipmentPackage } from '../../lib/mappers/equipmentPackage';
import { toEquipmentTag } from '../../lib/mappers/equipment';
import { IfNotReadonly } from '../../components/utils/IfAdmin';
import Header from '../../components/layout/Header';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import TableStyleLink from '../../components/utils/TableStyleLink';
import EquipmentTagDisplay from '../../components/utils/EquipmentTagDisplay';

const EquipmentPackageNameDisplayFn = (equipmentPackage: EquipmentPackage) => (
    <>
        <TableStyleLink href={'equipmentPackage/' + equipmentPackage.id}>{equipmentPackage.name}</TableStyleLink>
        {equipmentPackage.tags.map((x) => (
            <EquipmentTagDisplay tag={x} key={x.id} className="mr-1" />
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

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Utrustningspaket';
const breadcrumbs = [
    { link: '/equipment', displayName: 'Utrustning' },
    { link: 'equipmentPackage', displayName: pageTitle },
];

const EquipmentPackageListPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: equipmentPackages, error, isValidating } = useSwr('/api/equipmentPackage', fetcher);
    const { data: equipmentPackageTags } = useSwr('/api/equipmentTags', equipmentTagsFetcher);

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterTags, setFilterTags] = useState<EquipmentTag[]>([]);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !equipmentPackages) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} />;
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
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href="/equipmentPackage/new" passHref>
                        <Button variant="primary" as="span">
                            <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till utrustningspaket
                        </Button>
                    </Link>
                </IfNotReadonly>
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
                                options={equipmentPackageTags ?? []}
                                onChange={(e) => setFilterTags(e)}
                                placeholder="Filtrera på taggar"
                            />
                        </Form.Group>
                    </Col>
                </Form.Row>
            </Collapse>

            <TableDisplay entities={equipmentPackageToShow} configuration={tableSettings} filterString={searchText} />
        </Layout>
    );
};

const fetcher = (url: string) =>
    fetch(url)
        .then((response) => getResponseContentOrError<EquipmentPackageObjectionModel[]>(response))
        .then((objectionModel) => objectionModel.map((x) => toEquipmentPackage(x)));

const equipmentTagsFetcher = (url: string) =>
    fetch(url)
        .then((apiResponse) => getResponseContentOrError<IEquipmentTagObjectionModel[]>(apiResponse))
        .then((equipmentTagList) => equipmentTagList.map((x) => toEquipmentTag(x)));

export default EquipmentPackageListPage;
