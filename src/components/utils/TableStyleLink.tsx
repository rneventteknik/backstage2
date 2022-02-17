import Link from 'next/link';
import React, { ReactNode } from 'react';
import styles from './TableStyleLink.module.scss';

type Props = {
    href: string;
    children?: ReactNode;
    className?: string;
};

const TableStyleLink: React.FC<Props> = ({ href, children, className }: Props) => (
    <Link href={href}>
        <a className={className + ' ' + styles.link}>{children}</a>
    </Link>
);

export default TableStyleLink;
