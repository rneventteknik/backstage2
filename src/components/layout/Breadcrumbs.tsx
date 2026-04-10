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
        <nav aria-label="breadcrumb" className="hidden sm:block">
            <ol className="flex items-center gap-1 text-sm text-muted">
                <BreadcrumbsList maxSize={10} loading={loading} breadcrumbs={breadcrumbs} />
            </ol>
        </nav>
        <nav aria-label="breadcrumb" className="sm:hidden">
            <ol className="flex items-center gap-1 text-sm text-muted">
                <BreadcrumbsList maxSize={2} loading={loading} breadcrumbs={breadcrumbs} />
            </ol>
        </nav>
    </section>
);

type BreadcrumbsListProps = {
    maxSize: number;
    loading?: boolean;
    breadcrumbs?: { link: string; displayName: string }[];
};

const BreadcrumbItem: React.FC<{ href: string; active?: boolean; className?: string; children: React.ReactNode }> = ({
    href,
    active,
    className = '',
    children,
}) => (
    <li className={`flex items-center gap-1 ${className}`}>
        {active ? (
            <span className="text-body">{children}</span>
        ) : (
            <Link href={href} className="text-muted hover:text-body transition-colors">
                {children}
            </Link>
        )}
        {!active && <span className="text-muted">/</span>}
    </li>
);

const BreadcrumbsList: React.FC<BreadcrumbsListProps> = ({
    maxSize,
    loading,
    breadcrumbs = [],
}: BreadcrumbsListProps) => {
    const breadcrumbsTail = [...breadcrumbs].splice(-maxSize);

    return (
        <>
            {breadcrumbs?.length > maxSize - 1 ? (
                <BreadcrumbItem
                    href={breadcrumbs?.length > maxSize ? breadcrumbs?.splice(-(maxSize + 1))[0].link : '/'}
                    className={styles.breadcrumb}
                >
                    ...
                </BreadcrumbItem>
            ) : (
                <BreadcrumbItem
                    href="/"
                    className={styles.breadcrumb}
                    active={breadcrumbs?.length === 0 && !loading}
                >
                    Backstage2
                </BreadcrumbItem>
            )}

            {loading ? (
                <li className={styles.breadcrumb}>
                    <Skeleton width={125} />
                </li>
            ) : (
                breadcrumbsTail?.map((b, index) => (
                    <BreadcrumbItem
                        key={index}
                        href={b.link}
                        active={index === breadcrumbsTail.length - 1}
                        className={styles.breadcrumb}
                    >
                        {b.displayName}
                    </BreadcrumbItem>
                ))
            )}
        </>
    );
};

export default Breadcrumbs;
