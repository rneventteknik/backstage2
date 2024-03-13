import React, { ReactNode } from 'react';
import styles from './LineWithContent.module.scss';

type Props = {
    children?: ReactNode;
};

export const LineWithContent: React.FC<Props> = ({ children }: Props) => (
    <div className={styles.container}>
        <div className={styles.border}></div>
        <div className={styles.text}>{children}</div>
        <div className={styles.border}></div>
    </div>
);

export default LineWithContent;
