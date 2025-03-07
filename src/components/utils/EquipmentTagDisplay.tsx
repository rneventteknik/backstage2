import React from 'react';
import { Badge } from '../ui/badge';
import { EquipmentTag } from '../../models/interfaces';
import { IEquipmentTagObjectionModel } from '../../models/objection-models';

type Props = {
    tag: EquipmentTag | IEquipmentTagObjectionModel;
    className?: string;
};

const EquipmentTagDisplay: React.FC<Props> = ({ tag, className }: Props) => {
    return (
        <Badge className={className} style={tag.color ? { backgroundColor: tag.color } : undefined}>
            {tag.name}
        </Badge>
    );
};

export default EquipmentTagDisplay;
