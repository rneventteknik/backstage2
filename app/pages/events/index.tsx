import { Event, User } from '../../interfaces'
import Layout from '../../components/Layout'
import EventList from '../../components/EventList'
import { GetStaticProps } from 'next'
import useSwr from 'swr'

type Props = {
    items: Event[]
}


const EventListPage = ({ items }: Props) => {
  const {data, error} = useSwr('/api/events', fetcher);

  return (
    <Layout title='Event list'>
        <h1>
            Event List
        </h1>

        {(data && data.length > 0) ? <EventList items={data} /> : <span>No events</span>}

    </Layout>
)}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default EventListPage
