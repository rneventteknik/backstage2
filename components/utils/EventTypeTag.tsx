import React from 'react';
import { Badge } from 'react-bootstrap';

import { Event } from '../../interfaces';
import { EventType } from '../../interfaces/enums/EventType';

type Props = {
    event: Event;
};

const EventTypeTag: React.FC<Props> = ({ event }: Props) => {
    if (!event) {
        return null;
    }

    switch (event.eventType) {
        case EventType.GIG:
            return <Badge variant="success">Gigg</Badge>;
        case EventType.RENTAL:
            return <Badge variant="primary">Hyra</Badge>;
    }
};

export default EventTypeTag;
