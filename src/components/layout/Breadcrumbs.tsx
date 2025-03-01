import Link from 'next/link';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import styles from './Breadcrumbs.module.scss';

type Props = {
    loading?: boolean;
    breadcrumbs?: { link: string; displayName: string }[];
};

const Breadcrumbs: React.FC<Props> = ({ loading, breadcrumbs = [] }: Props) => (
    <section className={styles.breadcrumbs}>
        <div className="d-none d-sm-block">
            <BreadcrumbsList maxSize={10} loading={loading} breadcrumbs={breadcrumbs} />
        </div>
        <div className="d-sm-none">
            <BreadcrumbsList maxSize={2} loading={loading} breadcrumbs={breadcrumbs} />
        </div>
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
                <Link
                    href={breadcrumbs?.length > maxSize ? breadcrumbs?.splice(-(maxSize + 1))[0].link : '/'}
                    className={styles.breadcrumb}
                >
                    ...
                </Link>
            ) : (
                <Link
                    href="/"
                    className={styles.breadcrumb}
                    //active={breadcrumbs?.length === 0 && !loading} // TODO
                >
                    Backstage2
                </Link>
            )}

            {loading ? (
                <div className={styles.breadcrumb}>
                    <Skeleton width={125} />
                </div>
            ) : (
                breadcrumbsTail?.map((b, index) => (
                    <Link
                        key={index}
                        href={b.link}
                        //active={index === breadcrumbsTail.length - 1} // TODO
                        className={styles.breadcrumb}
                    >
                        {b.displayName}
                    </Link>
                ))
            )}
        </>
    );
};

export default Breadcrumbs;
