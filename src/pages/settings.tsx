import React from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { Nav, Tab } from 'react-bootstrap';
import {
    customersFetcher,
    equipmentLocationsFetcher,
    equipmentPublicCategoriesFetcher,
    equipmentTagsFetcher,
} from '../lib/fetchers';
import BaseEntityWithNamesEditor from '../components/settings/BaseEntityWithNamesEditor';
import EquipmentTagEditor from '../components/settings/EquipmentTagEditor';
import EquipmentLocationEditor from '../components/settings/EquipmentLocationEditor';
import EquipmentPublicCategoryEditor from '../components/settings/EquipmentPublicCategoryEditor';
import CustomerEditor from '../components/settings/CustomerEditor';
import GeneralSettingsEditor from '../components/settings/GeneralSettingsEditor';
import { KeyValue } from '../models/interfaces/KeyValue';
import { Role } from '../models/enums/Role';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Inställningar';
const breadcrumbs = [{ link: 'settings', displayName: pageTitle }];

// Page
//
const SettingsPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const readonly = currentUser.role !== Role.ADMIN;

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

            <Tab.Container id="settings-tabs" defaultActiveKey="customers" transition={false}>
                <Nav variant="pills" className="flex-row mb-2">
                    <Nav.Item>
                        <Nav.Link eventKey="customers">Kunder</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="equipmentTags">Taggar</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="equipmentLocations">Platser</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="equipmentPublicCategories">Publika Kategorier</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="generalSettings">Systeminställningar</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey="customers">
                        <BaseEntityWithNamesEditor
                            fetcher={customersFetcher}
                            apiUrl={'/api/customers'}
                            entityName={'customer'}
                            entityDisplayName={'Kund'}
                            getEditComponent={(entity, save, readOnly) => (
                                <CustomerEditor entity={entity} save={save} readOnly={readOnly} />
                            )}
                            readonly={readonly}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="equipmentTags">
                        <BaseEntityWithNamesEditor
                            fetcher={equipmentTagsFetcher}
                            apiUrl={'/api/equipmentTags'}
                            entityName={'equipmentTag'}
                            entityDisplayName={'Tagg'}
                            getEditComponent={(entity, save, readOnly) => (
                                <EquipmentTagEditor entity={entity} save={save} readOnly={readOnly} />
                            )}
                            readonly={readonly}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="equipmentLocations">
                        <BaseEntityWithNamesEditor
                            fetcher={equipmentLocationsFetcher}
                            apiUrl={'/api/equipmentLocations'}
                            entityName={'equipmentLocation'}
                            entityDisplayName={'Plats'}
                            getEditComponent={(entity, save, readOnly) => (
                                <EquipmentLocationEditor entity={entity} save={save} readOnly={readOnly} />
                            )}
                            sortBySortIndex={true}
                            readonly={readonly}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="equipmentPublicCategories">
                        <BaseEntityWithNamesEditor
                            fetcher={equipmentPublicCategoriesFetcher}
                            apiUrl={'/api/equipmentPublicCategories'}
                            entityName={'equipmentPublicCategory'}
                            entityDisplayName={'Publik Kategori'}
                            getEditComponent={(entity, save, readOnly) => (
                                <EquipmentPublicCategoryEditor entity={entity} save={save} readOnly={readOnly} />
                            )}
                            readonly={readonly}
                            sortBySortIndex={true}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="generalSettings">
                        <GeneralSettingsEditor readonly={readonly} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Layout>
    );
};

export default SettingsPage;
