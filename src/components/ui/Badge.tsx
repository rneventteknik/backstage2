import React from 'react';

type Props = {
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    variant?: 'warning' | 'dark';
};

export const Badge: React.FC<Props> = ({ children, className, style, variant }: Props) => {
    const backgroundColorClassName = variant === 'warning' ? 'bg-yellow-500 ' : 'bg-gray-500 ';

    return (
        <span className={'text-white bg-gray-500 rounded-xs px-2 py-1 ' + backgroundColorClassName + className} style={style}>
            {children}
        </span>
    );
};