import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { Nav } from 'react-bootstrap';
import styles from './Sidebar.module.scss';

import {
    faArchive,
    faCalendarDay,
    faCube,
    faExternalLinkAlt,
    faFileInvoiceDollar,
    faHome,
    faInfoCircle,
    faMoneyBillWave,
    faUsers,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { CurrentUserInfo } from '../interfaces/auth/CurrentUserInfo';
import { Role } from '../interfaces/enums/Role';

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
        <Nav.Item className={isActive ? styles.activeNavItem : undefined}>
            <Link href={link}>
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

// The sidebar itself
//
type Props = {
    currentUser: CurrentUserInfo;
};
const sidebar: React.FC<Props> = ({ currentUser }: Props) => (
    <div className={styles.container + ' pt-2'}>
        <SidebarLinkGroup>
            <SidebarLink displayName="Home" link="/" icon={faHome} exactMatch={true} />
            <SidebarLink displayName="Bokningar" link="/events" icon={faCalendarDay} />
            <SidebarLink displayName="Bokningsarkiv" link="/archive" icon={faArchive} />
            <SidebarLink displayName="Utrustning" link="/equipment" icon={faCube} />
            <SidebarLink displayName="Användare" link="/users" icon={faUsers} />
            <SidebarLink displayName="Hjälp" link="/about" icon={faInfoCircle} />
        </SidebarLinkGroup>

        {currentUser?.role === Role.ADMIN ? (
            <SidebarLinkGroup title="Administration">
                <SidebarLink displayName="Löner" link="/salary" icon={faMoneyBillWave} />
                <SidebarLink displayName="Fakturor" link="/invoices" icon={faFileInvoiceDollar} />
            </SidebarLinkGroup>
        ) : null}

        <SidebarLinkGroup title="Externa länkar">
            <SidebarLink displayName="OneDrive" link="https://onedrive.live.com" icon={faExternalLinkAlt} />
            <SidebarLink displayName="Ljuslistan" link="." icon={faExternalLinkAlt} />
            <SidebarLink displayName="Inköpslistan" link="." icon={faExternalLinkAlt} />
        </SidebarLinkGroup>
    </div>
);

export default sidebar;
