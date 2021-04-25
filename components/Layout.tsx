import React, { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap/dist/css/bootstrap.min.css';

type Props = {
    children?: ReactNode;
    title?: string;
};

const navbarStyle: CSSProperties = {
    zIndex: 100,
};

const sidebarStyle: CSSProperties = {
    width: '260px',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    paddingTop: '60px',
    backgroundColor: '#f6f6f6',
    zIndex: 99,
};

const contentStyle: CSSProperties = {
    marginLeft: '260px',
    padding: '15px',
};

const Layout: React.FC<Props> = ({ children, title = 'This is the default title' }: Props) => (
    <div>
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <header>
            <Navbar bg="light" style={navbarStyle}>
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

        <aside style={sidebarStyle}>
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
                    <Link href="/users">
                        <Nav.Link as="a" href="/users">
                            Users List
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

        <section style={contentStyle}>
            {children}
            <footer>
                <hr />
                <span>I&apos;m here to stay (Footer)</span>
            </footer>
        </section>
    </div>
);

export default Layout;
