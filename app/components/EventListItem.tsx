import React from 'react'
import Link from 'next/link'

import { Event } from '../interfaces'

type Props = {
  event: Event
}

const EventListItem = ({ event }: Props) => (
  <Link href="/event/[id]" as={`/event/${event.id}`}>
    <a>
      {event.id}: {event.name} ({event.ownerUser ? event.ownerUser.name : ''} [{event.ownerUser ? event.ownerUser.nameTag : ''}]) {event.status}
    </a>
  </Link>
)

export default EventListItem
