import React from 'react';
import { Badge } from 'react-bootstrap';
import { EquipmentTag } from '../../models/interfaces';
import { IEquipmentTagObjectionModel } from '../../models/objection-models';

type Props = {
    tag: EquipmentTag | IEquipmentTagObjectionModel;
    className?: string;
};

const EquipmentTagDisplay: React.FC<Props> = ({ tag, className }: Props) => {
    return (
        <Badge variant="dark" className={className} style={tag.color ? { backgroundColor: tag.color } : undefined}>
            {tag.name}
        </Badge>
    );
};

export default EquipmentTagDisplay;
