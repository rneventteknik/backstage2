import React from 'react';

type Props = {
    className?: string;
    children: React.ReactNode;
};

export const Row: React.FC<Props> = ({ children, className }: Props) => {
    return (
        <div className={'flex flex-row gap-4 w-full ' + className}>
            {children}
        </div>
    );
};

type ColProps = {
    children: React.ReactNode;
    className?: string;
    span?: number;
    xl?: number | string;
    lg?: number | string;
    md?: number | string;
    sm?: number | string;
    xs?: number | string;
};

export const Col: React.FC<ColProps> = ({ children, className, span, xl, lg, md, sm, xs }: ColProps) => {
    const colSpan = span ? `span-${span}` : '';
    const colXl = xl ? `xl:span-${xl}` : '';
    const colLg = lg ? `lg:span-${lg}` : '';
    const colMd = md ? `md:span-${md}` : '';
    const colSm = sm ? `sm:span-${sm}` : '';
    const colXs = xs ? `xs:span-${xs}` : '';

    return (
        <div className={`flex flex-grow-1 flex-col ${colSpan} ${colXl} ${colLg} ${colMd} ${colSm} ${colXs} ${className}`}>
            {children}
        </div>
    );

};