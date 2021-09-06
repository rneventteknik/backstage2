import Head from 'next/head';
import Topbar from './Topbar';
import { CurrentUserInfo } from '../interfaces/auth/CurrentUserInfo';
import Link from 'next/link';
import React, { ReactNode, useState } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import Sidebar from './Sidebar';
import styles from './Layout.module.scss';
import NotificationArea from './NotificationArea';

type Props = {
    children?: ReactNode;
    title?: string;
    currentUser: CurrentUserInfo;
    breadcrumbs: { link: string; displayName: string }[];
    fixedWidth?: boolean;
};

const Layout: React.FC<Props> = ({
    children,
    breadcrumbs = [],
    title = 'This is the default title',
    fixedWidth = false,
    currentUser,
}: Props) => {
    const [sidebarIsToggled, setSidebarIsToggled] = useState(false);
    const toggleSidebar = () => setSidebarIsToggled(!sidebarIsToggled);

    return (
        <div className={styles.container} data-sidebar-toggle-status={sidebarIsToggled}>
            <Head>
                <title>{title} | Backstage2</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <Topbar currentUser={currentUser} toggleSidebar={toggleSidebar} />

            <aside className={styles.sidebar}>
                <Sidebar currentUser={currentUser} />
            </aside>

            <div className={styles.notificationsContainer}>
                <div className={styles.notifications}>
                    <NotificationArea />
                </div>
            </div>

            <section className={styles.mainContentContainer + ' p-4'}>
                <div
                    className={fixedWidth ? styles.mainContentFixedWidth : styles.mainContent}
                    data-testid="main-content"
                >
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
};

export default Layout;
