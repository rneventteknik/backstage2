import React from 'react';

import { Event } from '../interfaces';

type Props = {
    event: Event;
};

const EventListItem: React.FC<Props> = ({ event }: Props) => (
    <tr>
        <td>{event.name}</td>
        <td>{event.ownerUser.name}</td>
        <td>{event.created}</td>
    </tr>
);

export default EventListItem;
