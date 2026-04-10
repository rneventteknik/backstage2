import React from 'react';
import { EquipmentTag } from '../../models/interfaces';
import { IEquipmentTagObjectionModel } from '../../models/objection-models';

type Props = {
    tag: EquipmentTag | IEquipmentTagObjectionModel;
    className?: string;
};

const EquipmentTagDisplay: React.FC<Props> = ({ tag, className }: Props) => {
    return (
        <span
            className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-bs-2 text-body ${className ?? ''}`}
            style={tag.color ? { backgroundColor: tag.color } : undefined}
        >
            {tag.name}
        </span>
    );
};

export default EquipmentTagDisplay;
