import React from 'react';

type Props = {
    className?: string;
    children: React.ReactNode;
    variant?: 'flush'; // TODO REMOVE
};

export const ListGroup: React.FC<Props> = ({ children, className }: Props) => {
    return (
        <div className={' ' + className}>
            {children}
        </div>
    );
};

type ListGroupItemProps = {
    className?: string;
    children: React.ReactNode;
};

export const ListGroupItem: React.FC<ListGroupItemProps> = ({ children, className }: ListGroupItemProps) => {
    return (
        <div className={'bg-gray-900 border border-gray-800 ' + className}>
            {children}
        </div>
    );
}