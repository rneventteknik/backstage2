import Link from 'next/link';
import Router from 'next/router';
import React from 'react';
import { Navbar, Dropdown, Button } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import UserDisplay from '../utils/UserDisplay';
import UserIcon from '../utils/UserIcon';
import styles from './Topbar.module.scss';
import Search from './Search';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    currentUser: CurrentUserInfo;
    toggleSidebar: () => unknown;
};

const Topbar: React.FC<Props> = ({ currentUser, toggleSidebar }: Props) => {
    const logOut = async () => {
        const res = await fetch('/api/users/logout');
        if (res.status === 200) {
            Router.push('/login');
        }
    };

    return (
        <header>
            <Navbar variant="dark" fixed="top" className={styles.container}>
                <Button variant="none" className="mr-2" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </Button>
                <Link href="/">
                    <Navbar.Brand as="a" href="/">
                        Backstage2
                    </Navbar.Brand>
                </Link>
                <div className="ml-auto mr-auto" style={{ maxWidth: 800, width: '100%' }}>
                    <Search />
                </div>
                <Dropdown>
                    <Dropdown.Toggle variant="default" id="dropdown-basic" className="py-0" aria-label="User Menu">
                        <UserIcon user={currentUser} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu align="right">
                        <Dropdown.Item disabled={true}>
                            <UserDisplay user={currentUser} />
                        </Dropdown.Item>
                        <Link href={'/users/' + currentUser.userId}>
                            <Dropdown.Item href={'/users/' + currentUser.userId}>Profil</Dropdown.Item>
                        </Link>
                        <Dropdown.Item onClick={logOut}>Logga ut</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar>
        </header>
    );
};

export default Topbar;
