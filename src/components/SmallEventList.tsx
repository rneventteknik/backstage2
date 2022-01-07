import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { getStatusName } from '../lib/utils';
import EventTypeTag from './utils/EventTypeTag';
import { Event } from '../models/interfaces';
import Link from 'next/link';

type Props = {
    title: string;
    events: Event[] | undefined;
};

const SmallEventList: React.FC<Props> = ({ title, events }: Props) => (
    <Card className="mb-3">
        <Card.Header>{title}</Card.Header>
        <ListGroup variant="flush">
            {events?.map((event) => (
                <ListGroup.Item key={event.id} className="d-flex">
                    <span className="flex-grow-1">
                        {event.name} <EventTypeTag event={event} />
                        <br />
                        <span className="text-muted">{getStatusName(event.status)}</span>
                    </span>
                    <Link href={'/events/' + event.id}>Visa bokning</Link>
                </ListGroup.Item>
            ))}

            {events?.length === 0 ? (
                <ListGroup.Item className="text-center font-italic text-muted">Inga bokningar</ListGroup.Item>
            ) : null}
        </ListGroup>
    </Card>
);

export default SmallEventList;
