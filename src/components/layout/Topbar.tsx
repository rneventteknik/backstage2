import Link from 'next/link';
import Router from 'next/router';
import React, { useState } from 'react';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import UserDisplay from '../utils/UserDisplay';
import UserIcon from '../utils/UserIcon';
import styles from './Topbar.module.scss';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { getGlobalSetting } from '../../lib/utils';
import { formatDatetimeForForm } from '../../lib/datetimeUtils';
import EnvironmentTypeTag from '../utils/EnvironmentTypeTag';
import { Button } from '../ui/Button';
import { Modal, ModalBody, ModalHeader, ModalTitle } from '../ui/Modal';
import { Card } from '../ui/Card';

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
            <Navbar variant="dark" fixed="top" className={styles.container} data-search-active-status={searchActive}>
                <Button variant="none" className="mr-2" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </Button>
                <div className={styles.branding}>
                    <Link href="/" passHref legacyBehavior>
                        <Navbar.Brand as="a" href="/">
                            Backstage2 <EnvironmentTypeTag globalSettings={globalSettings} />
                        </Navbar.Brand>
                    </Link>
                </div>
                <div className={styles.search}>
                    {/* <Search onFocus={() => setSearchActive(true)} onBlur={() => setSearchActive(false)} /> */}
                </div>
                <Dropdown>
                    <Dropdown.Toggle variant="default" id="dropdown-basic" className="py-0" aria-label="User Menu">
                        <UserIcon user={currentUser} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu align="right">
                        <Dropdown.Item disabled={true}>
                            <UserDisplay user={currentUser} />
                        </Dropdown.Item>
                        <Link href={'/users/' + currentUser.userId} passHref legacyBehavior>
                            <Dropdown.Item href={'/users/' + currentUser.userId}>Profil</Dropdown.Item>
                        </Link>
                        <Link href={'/users/' + currentUser.userId + '/time-reports'} passHref>
                            <Dropdown.Item href={'/users/' + currentUser.userId + '/time-reports'}>
                                Tidrapporter
                            </Dropdown.Item>
                        </Link>
                        <Dropdown.Item onClick={() => setShowHelpModal(true)}>Hjälp</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logOut}>Logga ut</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar>

            <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)} size="xl" backdrop="static">
                <ModalHeader closeButton>
                    <ModalTitle>Hjälp</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md={8} className="mb-3">
                            {getGlobalSetting('content.helpPageText', globalSettings, '')}
                        </Col>
                        <Col md={4}>
                            <Card>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="d-flex">
                                        <strong>
                                            Backstage2 <EnvironmentTypeTag globalSettings={globalSettings} />
                                        </strong>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Session startad</span>
                                        <span>
                                            {currentUser.loginDate
                                                ? formatDatetimeForForm(new Date(currentUser.loginDate))
                                                : '-'}
                                        </span>
                                    </ListGroup.Item>

                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Versionsnummer</span>
                                        <span>
                                            {getGlobalSetting('metadata.build.currentVersion', globalSettings, '-')}
                                        </span>
                                    </ListGroup.Item>

                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Heroku byggnummer</span>
                                        <span>
                                            {getGlobalSetting('metadata.heroku.releaseVersion', globalSettings, '-')}
                                        </span>
                                    </ListGroup.Item>

                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Commit id</span>
                                        <span>
                                            {getGlobalSetting(
                                                'metadata.heroku.slugCommit',
                                                globalSettings,
                                                '-',
                                            ).substring(0, 7)}
                                        </span>
                                    </ListGroup.Item>

                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Kompileringsdatum</span>
                                        <span>{getGlobalSetting('metadata.build.buildDate', globalSettings, '-')}</span>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </header>
    );
};

export default Topbar;
