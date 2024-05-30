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
    faCog,
    faCube,
    faExternalLinkAlt,
    faFileInvoiceDollar,
    faHome,
    faListCheck,
    faMoneyBillWave,
    faUsers,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { IfAdmin } from '../utils/IfAdmin';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { getGlobalSetting } from '../../lib/utils';

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
            <Link href={link} passHref legacyBehavior>
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
const getExternalLinksFromGlobalSettings = (globalSettings: KeyValue[]) => {
    try {
        type LinkObject = { title: string; url: string };
        const links = JSON.parse(
            getGlobalSetting('content.sidebarExternalLinks', globalSettings, '[]'),
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
                <strong>Error</strong> Invalid JSON in <code>content.sidebarExternalLinks</code> setting
            </Alert>
        );
    }
};

// The sidebar itself
//
type Props = {
    currentUser: CurrentUserInfo;
    globalSettings: KeyValue[];
};
const sidebar: React.FC<Props> = ({ currentUser, globalSettings }: Props) => (
    <div className={styles.container + ' pt-2 pb-4'}>
        <SidebarLinkGroup>
            <SidebarLink displayName="Hem" link="/" icon={faHome} exactMatch={true} />
            <SidebarLink displayName="Aktiva bokningar" link="/bookings" icon={faCalendarDay} />
            <SidebarLink displayName="Alla bokningar" link="/archive" icon={faArchive} />
            <SidebarLink displayName="Utrustning" link="/equipment" icon={faCube} />
            <SidebarLink displayName="Användare" link="/users" icon={faUsers} />
            <SidebarLink displayName="Statistik" link="/statistics" icon={faChartPie} />
            <SidebarLink displayName="Inställningar" link="/settings" icon={faCog} />
        </SidebarLinkGroup>

        <IfAdmin currentUser={currentUser}>
            <SidebarLinkGroup title="Administration">
                <SidebarLink displayName="Översikt" link="/admin-overview" icon={faListCheck} />
                <SidebarLink displayName="Timarvodesunderlag" link="/salary" icon={faMoneyBillWave} />
                <SidebarLink displayName="Fakturaunderlag" link="/invoices" icon={faFileInvoiceDollar} />
            </SidebarLinkGroup>
        </IfAdmin>

        {getExternalLinksFromGlobalSettings(globalSettings) ? (
            <SidebarLinkGroup title="Externa länkar">
                {getExternalLinksFromGlobalSettings(globalSettings)}
            </SidebarLinkGroup>
        ) : null}
    </div>
);

export default sidebar;
