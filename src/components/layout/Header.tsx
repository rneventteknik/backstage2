import React, { ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';
import Breadcrumbs from './Breadcrumbs';
import styles from './Header.module.scss';

type Props = {
    children?: ReactNode;
    title?: string;
    loading?: boolean;
    breadcrumbs?: { link: string; displayName: string }[];
};

const Header: React.FC<Props> = ({ title, children, loading, breadcrumbs = [] }: Props) => (
    <div>
        <Breadcrumbs breadcrumbs={breadcrumbs} loading={loading} />

        <h1 className={styles.pageTitle}> {loading ? <Skeleton width={280} /> : title} </h1>
        {loading ? <Skeleton width={140} height={30} /> : <div className={styles.buttonContainer}>{children}</div>}
        <hr />
    </div>
);

export default Header;
