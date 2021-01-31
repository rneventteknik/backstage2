import * as React from 'react'
import EventListItem from './EventListItem'
import { Event } from '../interfaces'

type Props = {
  items: Event[]
}

const EventList = ({ items }: Props) => (
  <ul>
    {((items && items.length > 0) ? items : []).map((item) => (
      <li key={item.id}>
        <EventListItem event={item} />
      </li>
    ))}
  </ul>
)

export default EventList
