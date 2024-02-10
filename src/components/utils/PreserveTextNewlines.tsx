import React, { ReactNode } from 'react';
import styles from './PreserveTextNewlines.module.scss';

type Props = {
    children?: ReactNode;
};

const PreserveTextNewlines: React.FC<Props> = ({ children }: Props) => (
    <span className={styles.preserveWrapping}>{children}</span>
);

export default PreserveTextNewlines;
