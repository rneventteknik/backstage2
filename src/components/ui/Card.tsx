import React from 'react';

type Props = {
    className?: string;
    children: React.ReactNode;
};

export const Card: React.FC<Props> = ({ children, className }: Props) => {
    return (
        <div className={'bg-gray-900 border border-gray-800 ' + className}>
            {children}
        </div>
    );
};

type HeaderProps = {
    className?: string;
    children?: React.ReactNode;
};

export const CardHeader: React.FC<HeaderProps> = ({ children, className }: HeaderProps) => {
    return (
        <div className={'bg-gray-800 p-2 ' + className}>
            {children}
        </div>
    );
}