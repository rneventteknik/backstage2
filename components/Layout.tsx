import React, { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Layout.module.css';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout: React.FC<Props> = ({ children, title = 'This is the default title' }: Props) => (
    <div>
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <header>
            <Navbar bg="light" className={styles.navbar}>
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
            </Navbar>
        </header>

        <aside className={styles.sidebar}>
            <Nav className="flex-column">
                <Nav.Item>
                    <Link href="/">
                        <Nav.Link as="a" href="/">
                            Home
                        </Nav.Link>
                    </Link>
                </Nav.Item>
                <Nav.Item>
                    <Link href="/about">
                        <Nav.Link as="a" href="/about">
                            About
                        </Nav.Link>
                    </Link>
                </Nav.Item>
                <Nav.Item>
                    <Link href="/events">
                        <Nav.Link as="a" href="/events">
                            Event List
                        </Nav.Link>
                    </Link>
                </Nav.Item>
            </Nav>
        </aside>

        <section className={styles.mainContent}>
            {children}
            <footer>
                <hr />
                <span>I&apos;m here to stay (Footer)</span>
            </footer>
        </section>
    </div>
);

export default Layout;
