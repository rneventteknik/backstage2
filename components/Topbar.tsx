import Link from 'next/link';
import Router from 'next/router';
import React from 'react';
import { Navbar, InputGroup, Button, Form, FormControl, Dropdown } from 'react-bootstrap';
import { CurrentUserInfo } from '../interfaces/auth/CurrentUserInfo';
import UserDisplay from './UserDisplay';
import UserIcon from './UserIcon';
import styles from './Topbar.module.scss';

type Props = {
    currentUser: CurrentUserInfo;
};

const Topbar: React.FC<Props> = ({ currentUser }: Props) => {
    const logOut = async () => {
        const res = await fetch('api/users/logout');
        if (res.status === 200) {
            Router.push('/login');
        }
    };

    return (
        <header>
            <Navbar variant="dark" fixed="top" className={styles.container}>
                <Link href="/">
                    <Navbar.Brand as="a" href="/">
                        Backstage2
                    </Navbar.Brand>
                </Link>
                <Form inline className="ml-auto">
                    <InputGroup>
                        <FormControl type="text" placeholder="Search" />
                        <InputGroup.Append>
                            <Button variant="outline-primary">Search</Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Form>
                <Dropdown>
                    <Dropdown.Toggle variant="default" id="dropdown-basic" className="py-0">
                        <UserIcon user={currentUser} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu align="right">
                        <Dropdown.Item disabled={true}>
                            <UserDisplay user={currentUser} />
                        </Dropdown.Item>
                        <Dropdown.Item onClick={logOut}>Logga ut</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar>
        </header>
    );
};

export default Topbar;
