import Head from 'next/head';
import Topbar from './Topbar';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.scss';
import { SkeletonTheme } from 'react-loading-skeleton';
import { KeyValue } from '../../models/interfaces/KeyValue';

type Props = {
    children?: ReactNode;
    title?: string;
    currentUser: CurrentUserInfo;
    globalSettings: KeyValue[];
    fixedWidth?: boolean;
};

const Layout: React.FC<Props> = ({
    children,
    title = 'This is the default title',
    fixedWidth = false,
    currentUser,
    globalSettings,
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
                <Sidebar currentUser={currentUser} globalSettings={globalSettings} />
            </aside>

            <SkeletonTheme
                baseColor={styles.skeletonColorBase}
                highlightColor={styles.skeletonColorHighlight}
                borderRadius={0}
            >
                <section className={styles.mainContentContainer + ' p-4'}>
                    <div
                        className={fixedWidth ? styles.mainContentFixedWidth : styles.mainContent}
                        data-testid="main-content"
                    >
                        {children}

                        <footer className={styles.footer + ' text-center font-italic text-muted'}>
                            <small>Backstage2 - 2021</small>
                        </footer>
                    </div>
                </section>
            </SkeletonTheme>
        </div>
    );
};

export default Layout;
