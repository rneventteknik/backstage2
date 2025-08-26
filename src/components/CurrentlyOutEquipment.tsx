import React from 'react';
import Skeleton from 'react-loading-skeleton';
import useSwr from 'swr';
import { getResponseContentOrError } from '../lib/utils';
import { CurrentlyOutEquipmentInfo } from '../models/misc/CurrentlyOutEquipmentInfo';
import { TableConfiguration, TableDisplay } from './TableDisplay';
import { Card } from 'react-bootstrap';
import TableStyleLink from './utils/TableStyleLink';
import CollapsibleCard from './utils/CollapsibleCard';

const EquipmentNameDisplayFn = (x: CurrentlyOutEquipmentInfo) =>
    x.equipmentId ? <TableStyleLink href={'/equipment/' + x.equipmentId}>{x.name}</TableStyleLink> : <em>{x.name}</em>;

type Props = {
    collapsible?: boolean;
    defaultOpen?: boolean;
};

const CurrentlyOutEquipment: React.FC<Props> = ({ collapsible = false, defaultOpen = true }: Props) => {
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

    const CardWrapper = ({ children }: { children: React.ReactNode }) =>
        collapsible ? (
            <CollapsibleCard title="Utlämnad utrustning" defaultOpen={defaultOpen} className="mb-3">
                {children}
            </CollapsibleCard>
        ) : (
            <Card className="mb-3">
                <Card.Header>Utlämnad utrustning</Card.Header>
                {children}
            </Card>
        );

    return (
        <CardWrapper>
            <TableDisplay entities={currentlyOutEquipmentInfos} configuration={tableSettings} />
        </CardWrapper>
    );
};

export default CurrentlyOutEquipment;
