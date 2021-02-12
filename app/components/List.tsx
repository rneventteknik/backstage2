import * as React from 'react';
import ListItem from './ListItem';
import { User, Event } from '../interfaces';

type Props = {
    items: (User | Event)[];
};

const List = ({ items }: Props) => (
    <ul>
        {items.map((item) => (
            <li key={item.id}>
                <ListItem data={item} />
            </li>
        ))}
    </ul>
);

export default List;
