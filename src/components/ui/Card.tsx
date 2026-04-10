import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const CardRoot: React.FC<CardProps> = ({ className = '', children, ...rest }) => (
    <div className={`bg-bs-1 border border-bs-2 ${className}`} {...rest}>{children}</div>
);

const CardHeader: React.FC<CardProps> = ({ className = '', children, ...rest }) => (
    <div className={`bg-bs-2 border-b border-bs-2 px-5 py-3 ${className}`} {...rest}>{children}</div>
);

const CardBody: React.FC<CardProps> = ({ className = '', children, ...rest }) => (
    <div className={`px-5 py-5 ${className}`} {...rest}>{children}</div>
);

const CardFooter: React.FC<CardProps> = ({ className = '', children, ...rest }) => (
    <div className={`bg-bs-2 border-t border-bs-2 px-5 py-3 ${className}`} {...rest}>{children}</div>
);

export const Card = Object.assign(CardRoot, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
});
