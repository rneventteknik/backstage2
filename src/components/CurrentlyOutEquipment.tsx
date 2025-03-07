import React from 'react';
import Skeleton from 'react-loading-skeleton';
import useSwr from 'swr';
import { getResponseContentOrError } from '../lib/utils';
import { CurrentlyOutEquipmentInfo } from '../models/misc/CurrentlyOutEquipmentInfo';
import { TableConfiguration, TableDisplay } from './TableDisplay';
import TableStyleLink from './utils/TableStyleLink';
import { Card, CardHeader } from './ui/card';

const EquipmentNameDisplayFn = (x: CurrentlyOutEquipmentInfo) =>
    x.equipmentId ? <TableStyleLink href={'/equipment/' + x.equipmentId}>{x.name}</TableStyleLink> : <em>{x.name}</em>;

const CurrentlyOutEquipment: React.FC = () => {
    const { data: currentlyOutEquipmentInfos } = useSwr('/api/equipment/currentlyOut', (url) =>
        fetch(url).then((response) => getResponseContentOrError<CurrentlyOutEquipmentInfo[]>(response)),
    );

    if (!currentlyOutEquipmentInfos) {
        return <Skeleton height={120}></Skeleton>;
    }

    const tableSettings: TableConfiguration<CurrentlyOutEquipmentInfo> = {
        entityTypeDisplayName: 'utrustning',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (x: CurrentlyOutEquipmentInfo) => x.name,
                getContentOverride: EquipmentNameDisplayFn,
                textTruncation: true,
                columnWidth: 300,
            },
            {
                key: 'numberOfUnits',
                displayName: 'Antal',
                getValue: (x: CurrentlyOutEquipmentInfo) => x.numberOfUnits,
                columnWidth: 220,
            },
        ],
    };

    return (
        <Card className="mb-3">
            <CardHeader>Utlämnad utrustning</CardHeader>
            <TableDisplay entities={currentlyOutEquipmentInfos} configuration={tableSettings} />
        </Card>
    );
};

export default CurrentlyOutEquipment;
