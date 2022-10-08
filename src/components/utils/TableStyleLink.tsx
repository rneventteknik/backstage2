import Link from 'next/link';
import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import styles from './TableStyleLink.module.scss';

type Props = {
    href: string;
    children?: ReactNode;
    className?: string;
};

const TableStyleLink: React.FC<Props & AnchorHTMLAttributes<HTMLAnchorElement>> = ({
    href,
    children,
    className,
    ...props
}: Props & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link href={href}>
        <a className={className + ' ' + styles.link} {...props}>
            {children}
        </a>
    </Link>
);

export default TableStyleLink;
