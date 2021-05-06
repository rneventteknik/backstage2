import Head from 'next/head';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Navbar from 'react-bootstrap/Navbar';
import styles from './Layout.module.scss';
import Sidebar from './Sidebar';

type Props = {
    children?: ReactNode;
    title?: string;
    breadcrumbs: { link: string; displayName: string }[];
    fixedWidth?: boolean;
};

const Layout: React.FC<Props> = ({
    children,
    breadcrumbs = [],
    title = 'This is the default title',
    fixedWidth = false,
}: Props) => (
    <div className={styles.container}>
        <Head>
            <title>{title} | Backstage2</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <header>
            <Navbar variant="dark" fixed="top" className={styles.navbar}>
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
            <Sidebar />
        </aside>

        <section className={styles.mainContentContainer + ' p-4'}>
            <div className={fixedWidth ? styles.mainContentFixedWidth : styles.mainContent}>
                <section className={styles.breadcrumbs}>
                    <Breadcrumb>
                        <Breadcrumb.Item href="/" linkAs={Link} className={styles.breadcrumb}>
                            Backstage2
                        </Breadcrumb.Item>
                        {breadcrumbs.map((b, index) => (
                            <Breadcrumb.Item
                                linkAs={Link}
                                key={index}
                                href={b.link}
                                active={index === breadcrumbs.length - 1}
                                className={styles.breadcrumb}
                            >
                                {b.displayName}
                            </Breadcrumb.Item>
                        ))}
                    </Breadcrumb>
                </section>

                {children}

                <footer className={styles.footer + ' text-center font-italic text-muted'}>
                    <small>Backstage2 - 2021</small>
                </footer>
            </div>
        </section>
    </div>
);

export default Layout;
