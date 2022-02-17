import React from 'react';
import { Badge } from 'react-bootstrap';

import { Event } from '../../models/interfaces';
import { EventType } from '../../models/enums/EventType';

type Props = {
    event: Event;
    className?: string;
};

const EventTypeTag: React.FC<Props> = ({ event, className }: Props) => {
    switch (event && event.eventType) {
        case EventType.GIG:
            return (
                <Badge variant="success" className={className}>
                    Gigg
                </Badge>
            );
        case EventType.RENTAL:
            return (
                <Badge variant="primary" className={className}>
                    Hyra
                </Badge>
            );
        default:
            return null;
    }
};

export default EventTypeTag;
