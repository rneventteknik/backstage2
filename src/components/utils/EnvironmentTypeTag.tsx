import React from 'react';
import { Badge } from '../ui/Badge';
import { getGlobalSetting } from '../../lib/utils';
import { KeyValue } from '../../models/interfaces/KeyValue';

type Props = {
    globalSettings: KeyValue[];
};

const EnvironmentTypeTag: React.FC<Props> = ({ globalSettings }: Props) => {
    const name = getGlobalSetting('content.environment.name', globalSettings, '').trim();
    const variant = getGlobalSetting('content.environment.variant', globalSettings, 'warning').trim();

    if (name == '') {
        return null;
    }

    return <Badge variant={variant}>{name}</Badge>;
};

export default EnvironmentTypeTag;
