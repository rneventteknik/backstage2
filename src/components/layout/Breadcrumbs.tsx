import Link from 'next/link';
import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import styles from './Breadcrumbs.module.scss';

type Props = {
    loading?: boolean;
    breadcrumbs?: { link: string; displayName: string }[];
};

const Breadcrumbs: React.FC<Props> = ({ loading, breadcrumbs = [] }: Props) => (
    <section className={styles.breadcrumbs}>
        <Breadcrumb className="d-none d-sm-block">
            <BreadcrumbsList maxSize={10} loading={loading} breadcrumbs={breadcrumbs} />
        </Breadcrumb>
        <Breadcrumb className="d-sm-none">
            <BreadcrumbsList maxSize={2} loading={loading} breadcrumbs={breadcrumbs} />
        </Breadcrumb>
    </section>
);

type BreadcrumbsListProps = {
    maxSize: number;
    loading?: boolean;
    breadcrumbs?: { link: string; displayName: string }[];
};

const BreadcrumbsList: React.FC<BreadcrumbsListProps> = ({
    maxSize,
    loading,
    breadcrumbs = [],
}: BreadcrumbsListProps) => {
    const breadcrumbsTail = [...breadcrumbs].splice(-maxSize);

    return (
        <>
            {breadcrumbs?.length > maxSize - 1 ? (
                <Breadcrumb.Item
                    href={breadcrumbs?.length > maxSize ? breadcrumbs?.splice(-(maxSize + 1))[0].link : '/'}
                    linkAs={Link}
                    className={styles.breadcrumb}
                >
                    ...
                </Breadcrumb.Item>
            ) : (
                <Breadcrumb.Item
                    href="/"
                    linkAs={Link}
                    className={styles.breadcrumb}
                    active={breadcrumbs?.length === 0 && !loading}
                >
                    Backstage2
                </Breadcrumb.Item>
            )}

            {loading ? (
                <Breadcrumb.Item className={styles.breadcrumb}>
                    <Skeleton width={125} />
                </Breadcrumb.Item>
            ) : (
                breadcrumbsTail?.map((b, index) => (
                    <Breadcrumb.Item
                        linkAs={Link}
                        key={index}
                        href={b.link}
                        active={index === breadcrumbsTail.length - 1}
                        className={styles.breadcrumb}
                    >
                        {b.displayName}
                    </Breadcrumb.Item>
                ))
            )}
        </>
    );
};

export default Breadcrumbs;
