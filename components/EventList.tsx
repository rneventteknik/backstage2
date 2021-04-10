import React from 'react';
import EventListItem from './EventListItem';
import { Event } from '../interfaces';
import Table from 'react-bootstrap/Table';

type Props = {
    events: Event[];
};

const EventList: React.FC<Props> = ({ events }: Props) => (
    <Table hover>
        <thead>
            <tr>
                <th>Name</th>
                <th>Responsible</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            {(events && events.length > 0 ? events : []).map((event) => (
                <EventListItem key={event.id} event={event} />
            ))}
        </tbody>
    </Table>
);

export default EventList;
