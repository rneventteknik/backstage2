import React from 'react';
import Layout from '../../components/Layout';
import EventList from '../../components/EventList';
import useSwr from 'swr';

const EventListPage: React.FC = () => {
    const { data } = useSwr('/api/events', fetcher);

    return (
        <Layout title="Event list">
            <h1>Event List</h1>

            {data && data.length > 0 ? <EventList events={data} /> : <span>No events</span>}
        </Layout>
    );
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default EventListPage;
