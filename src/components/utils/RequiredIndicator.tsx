import React from 'react';

type Props = {
    required?: boolean;
};

const RequiredIndicator: React.FC<Props> = ({ required = true }: Props) => {
    if (!required) {
        return null;
    }
    return (
        <span className="text-danger" title="Obligatoriskt fält">
            &nbsp;*
        </span>
    );
};

export default RequiredIndicator;
