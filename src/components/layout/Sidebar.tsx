import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { Alert, Nav } from 'react-bootstrap';
import styles from './Sidebar.module.scss';

import {
    faArchive,
    faCalendarDay,
    faChartPie,
    faCube,
    faExternalLinkAlt,
    faFileInvoiceDollar,
    faHome,
    faInfoCircle,
    faListCheck,
    faMoneyBillWave,
    faPaintBrush,
    faUsers,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { IfAdmin } from '../utils/IfAdmin';

// Component for a single link
//
type SidebarLinkProps = {
    displayName: string;
    link: string;
    icon: IconDefinition;
    exactMatch?: boolean;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ displayName, link, icon, exactMatch = false }: SidebarLinkProps) => {
    const { asPath: path } = useRouter();
    const isActive = exactMatch ? link === path : path.indexOf(link) === 0;

    return (
        <Nav.Item className={[isActive ? styles.activeNavItem : undefined, styles.link].join(' ')}>
            <Link href={link} passHref>
                <Nav.Link as="a" href={link}>
                    <FontAwesomeIcon className="fa-fw" icon={icon} />
                    <span className="ml-3">{displayName}</span>
                </Nav.Link>
            </Link>
        </Nav.Item>
    );
};

// Component for a link group
//
type SidebarLinkGroupProps = {
    children?: ReactNode;
    title?: string;
};

const SidebarLinkGroup: React.FC<SidebarLinkGroupProps> = ({ children, title }: SidebarLinkGroupProps) => (
    <>
        {title ? <h1 className="ml-4 mt-4">{title}</h1> : null}
        <Nav className={'flex-column ' + styles.main}>{children}</Nav>
    </>
);

// External links
//
const getExternalLinksFromEnv = () => {
    try {
        type LinkObject = { title: string; url: string };
        const links = (
            process.env.NEXT_PUBLIC_BACKSTAGE2_EXTERNAL_LINKS
                ? JSON.parse(process.env.NEXT_PUBLIC_BACKSTAGE2_EXTERNAL_LINKS)
                : []
        ) as LinkObject[];

        if (links.length === 0) {
            return null;
        }

        return links.map((link, index) => (
            <SidebarLink key={index} displayName={link.title} link={link.url} icon={faExternalLinkAlt} />
        ));
    } catch {
        return (
            <Alert className="mx-4 p-3" variant="danger">
                <strong>Error</strong> Invalid JSON
            </Alert>
        );
    }
};

// The sidebar itself
//
type Props = {
    currentUser: CurrentUserInfo;
};
const sidebar: React.FC<Props> = ({ currentUser }: Props) => (
    <div className={styles.container + ' pt-2'}>
        <SidebarLinkGroup>
            <SidebarLink displayName="Hem" link="/" icon={faHome} exactMatch={true} />
            <SidebarLink displayName="Aktiva bokningar" link="/bookings" icon={faCalendarDay} />
            <SidebarLink displayName="Alla bokningar" link="/archive" icon={faArchive} />
            <SidebarLink displayName="Utrustning" link="/equipment" icon={faCube} />
            <SidebarLink displayName="Användare" link="/users" icon={faUsers} />
            <SidebarLink displayName="Statistik" link="/statistics" icon={faChartPie} />
            <SidebarLink displayName="Hjälp" link="/about" icon={faInfoCircle} />
        </SidebarLinkGroup>

        <IfAdmin currentUser={currentUser}>
            <SidebarLinkGroup title="Administration">
                <SidebarLink displayName="Översikt" link="/admin-overview" icon={faListCheck} />
                <SidebarLink displayName="Löneunderlag" link="/salary" icon={faMoneyBillWave} />
                <SidebarLink displayName="Fakturaunderlag" link="/invoices" icon={faFileInvoiceDollar} />
                <SidebarLink displayName="Inställningar" link="/settings" icon={faPaintBrush} />
            </SidebarLinkGroup>
        </IfAdmin>

        {getExternalLinksFromEnv() ? (
            <SidebarLinkGroup title="Externa länkar">{getExternalLinksFromEnv()}</SidebarLinkGroup>
        ) : null}

        <div className={styles.debugInfo}>
            <small className="text-muted">
                <p>{process.env.NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION}</p>
            </small>
        </div>
    </div>
);

export default sidebar;
