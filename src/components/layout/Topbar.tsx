import Link from 'next/link';
import Router from 'next/router';
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { ListGroup } from '../ui/ListGroup';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import UserDisplay from '../utils/UserDisplay';
import UserIcon from '../utils/UserIcon';
import styles from './Topbar.module.scss';
import Search from './Search';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { getGlobalSetting } from '../../lib/utils';
import { formatDatetimeForForm } from '../../lib/datetimeUtils';
import EnvironmentTypeTag from '../utils/EnvironmentTypeTag';

type Props = {
    currentUser: CurrentUserInfo;
    globalSettings: KeyValue[];
    toggleSidebar: () => unknown;
};

const Topbar: React.FC<Props> = ({ currentUser, globalSettings, toggleSidebar }: Props) => {
    const [searchActive, setSearchActive] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const logOut = async () => {
        const res = await fetch('/api/users/logout');
        if (res.status === 200) {
            Router.push('/login');
        }
    };

    return (
        <header>
            <nav className={`fixed top-0 inset-x-0 z-40 flex items-center h-12 ${styles.container}`} data-search-active-status={searchActive}>
                <Button variant="outline-secondary" className="mr-2 border-0 text-body" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </Button>
                <div className={styles.branding}>
                    <Link href="/" className="text-body font-medium no-underline hover:no-underline">
                        Backstage2 <EnvironmentTypeTag globalSettings={globalSettings} />
                    </Link>
                </div>
                <div className={styles.search}>
                    <Search onFocus={() => setSearchActive(true)} onBlur={() => setSearchActive(false)} />
                </div>
                <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" className="border-0 py-0" aria-label="User Menu">
                        <UserIcon user={currentUser} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                        <Dropdown.Item disabled={true}>
                            <UserDisplay user={currentUser} />
                        </Dropdown.Item>
                        <Dropdown.Item href={'/users/' + currentUser.userId}>Profil</Dropdown.Item>
                        <Dropdown.Item href={'/users/' + currentUser.userId + '/time-reports'}>Tidrapporter</Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowHelpModal(true)}>Hjälp</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logOut}>Logga ut</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </nav>

            <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)} size="xl" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Hjälp</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-grow min-w-0 basis-2/3">
                            {getGlobalSetting('content.helpPageText', globalSettings, '')}
                        </div>
                        <div className="basis-1/3">
                            <Card>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="flex">
                                        <strong>
                                            Backstage2 <EnvironmentTypeTag globalSettings={globalSettings} />
                                        </strong>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Session startad</span>
                                        <span>
                                            {currentUser.loginDate
                                                ? formatDatetimeForForm(new Date(currentUser.loginDate))
                                                : '-'}
                                        </span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Versionsnummer</span>
                                        <span>
                                            {getGlobalSetting('metadata.build.currentVersion', globalSettings, '-')}
                                        </span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Heroku byggnummer</span>
                                        <span>
                                            {getGlobalSetting('metadata.heroku.releaseVersion', globalSettings, '-')}
                                        </span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Commit id</span>
                                        <span>
                                            {getGlobalSetting(
                                                'metadata.heroku.slugCommit',
                                                globalSettings,
                                                '-',
                                            ).substring(0, 7)}
                                        </span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Kompileringsdatum</span>
                                        <span>{getGlobalSetting('metadata.build.buildDate', globalSettings, '-')}</span>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </header>
    );
};

export default Topbar;
