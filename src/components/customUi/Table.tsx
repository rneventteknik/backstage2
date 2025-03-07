import React from 'react';

type Props = {
    className?: string;
    children: React.ReactNode;
};

export const Table: React.FC<Props> = ({ children, className }: Props) => {
    return (
        <table className={'w-full ' + className}>
            {children}
        </table>
    );
};