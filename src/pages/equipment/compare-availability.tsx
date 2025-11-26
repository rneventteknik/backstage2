import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Card, Form } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import Header from '../../components/layout/Header';
import EquipmentSearch, { ResultType, SearchResultViewModel } from '../../components/EquipmentSearch';
import { Equipment } from '../../models/interfaces';
import { EquipmentCalendarRow } from '../../components/equipment/EquipmentCalendar';
import { toEquipment, toEquipmentTag } from '../../lib/mappers/equipment';
import { toEquipmentPackage } from '../../lib/mappers/equipmentPackage';
import { getResponseContentOrError, onlyUniqueById } from '../../lib/utils';
import {
    IEquipmentObjectionModel,
    IEquipmentPackageObjectionModel,
    IEquipmentTagObjectionModel,
} from '../../models/objection-models';
import { useNotifications } from '../../lib/useNotifications';
import { addDays, formatDateForForm, toDatetimeOrUndefined } from '../../lib/datetimeUtils';
import TableStyleLink from '../../components/utils/TableStyleLink';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { useRouter } from 'next/router';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Jämför tillgänglighet';

const CompareAvailabilityPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const defaultDate = new Date();
    defaultDate.setHours(0, 0, 0, 0);

    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [primaryEquipment, setPrimaryEquipment] = useState<Equipment | null>(null);
    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const { showErrorMessage } = useNotifications();
    const router = useRouter();

    // If there is an equipment id in the query, use it as the primary equipment
    useEffect(() => {
        if (router.query.equipmentId) {
            fetch('/api/equipment/' + router.query.equipmentId)
                .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
                .then(toEquipment)
                .then((equipment) => {
                    setPrimaryEquipment(equipment);
                })
                .catch((error: Error) => {
                    console.error(error);
                });
        }
    }, [router.query.equipmentId]);

    // Breadcrumbs differ depending on if there is a primary equipment or not
    const breadcrumbs = primaryEquipment
        ? [
              { link: '/equipment', displayName: 'Utrustning' },
              { link: '/equipment/' + router.query.equipmentId, displayName: primaryEquipment?.name },
              { link: '/equipment/compare-availability', displayName: pageTitle },
          ]
        : [
              { link: '/equipment', displayName: 'Utrustning' },
              { link: '/equipment/compare-availability', displayName: pageTitle },
          ];

    const addFromSearch = (res: SearchResultViewModel) => {
        switch (res.type) {
            case ResultType.EQUIPMENT:
                fetch('/api/equipment/' + res.id)
                    .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
                    .then(toEquipment)
                    .then((equipment) => {
                        setEquipment((array) =>
                            [equipment, ...array].filter(onlyUniqueById).filter((x) => x.id !== primaryEquipment?.id),
                        );
                    })
                    .catch((error: Error) => {
                        console.error(error);
                        showErrorMessage('Kunde inte ladda hem utrustningen');
                    });
                break;

            case ResultType.EQUIPMENTPACKAGE:
                fetch('/api/equipmentPackage/' + res.id)
                    .then((apiResponse) => getResponseContentOrError<IEquipmentPackageObjectionModel>(apiResponse))
                    .then(toEquipmentPackage)
                    .then((equipmentPackage) => {
                        setEquipment((array) =>
                            [
                                ...(equipmentPackage.equipmentEntries
                                    .map((e) => e.equipment)
                                    .filter((e) => e) as Equipment[]),
                                ...array,
                            ]
                                .filter(onlyUniqueById)
                                .filter((x) => !x.isArchived)
                                .filter((x) => x.id !== primaryEquipment?.id),
                        );
                    })
                    .catch((error: Error) => {
                        console.error(error);
                        showErrorMessage('Kunde inte ladda hem utrustningspaketet');
                    });
                break;

            case ResultType.EQUIPMENTTAG:
                fetch('/api/equipmentTags/' + res.id)
                    .then((apiResponse) => getResponseContentOrError<IEquipmentTagObjectionModel>(apiResponse))
                    .then(toEquipmentTag)
                    .then((equipmentTag) => {
                        setEquipment((array) =>
                            [...equipmentTag.equipment, ...array]
                                .filter(onlyUniqueById)
                                .filter((x) => !x.isArchived)
                                .filter((x) => x.id !== primaryEquipment?.id),
                        );
                    })
                    .catch((error: Error) => {
                        console.error(error);
                        showErrorMessage('Kunde inte ladda hem utrustningspaketet');
                    });
                break;
        }
    };
    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header
                title={primaryEquipment ? `${pageTitle} (${primaryEquipment.name})` : pageTitle}
                breadcrumbs={breadcrumbs}
            />

            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <div className="flex-grow-1">
                        <EquipmentSearch
                            id={'equipment-search'}
                            includeTags={true}
                            defaultResults={[]}
                            placeholder="Välj utrustning"
                            onSelect={(e) => addFromSearch(e)}
                        />
                    </div>
                    <div className="ml-3">
                        <Form.Control
                            type="date"
                            defaultValue={formatDateForForm(defaultDate)}
                            onChange={(e) => {
                                const newDate = toDatetimeOrUndefined(e.target.value);
                                if (newDate) {
                                    setSelectedDate(newDate);
                                }
                            }}
                        />
                    </div>
                </Card.Header>
                <div className="table-responsive">
                    {primaryEquipment ? (
                        <EquipmentCalendarRow
                            equipment={primaryEquipment}
                            startDate={addDays(selectedDate, -4)}
                            numberOfDays={9}
                            highlightCriteria={(date) => date.getTime() === selectedDate.getTime()}
                        >
                            <div>
                                <TableStyleLink href={'/equipment/' + primaryEquipment.id} target="_blank">
                                    {primaryEquipment.name}
                                </TableStyleLink>
                            </div>
                        </EquipmentCalendarRow>
                    ) : null}
                    {equipment.map((e) => (
                        <EquipmentCalendarRow
                            equipment={e}
                            startDate={addDays(selectedDate, -4)}
                            numberOfDays={9}
                            key={e.id}
                            highlightCriteria={(date) => date.getTime() === selectedDate.getTime()}
                        >
                            <div>
                                <TableStyleLink href={'/equipment/' + e.id} target="_blank">
                                    {e.name}
                                </TableStyleLink>
                                <p
                                    className="mb-0 text-muted"
                                    role="button"
                                    onClick={() => setEquipment((list) => list.filter((x) => x.id !== e.id))}
                                >
                                    Ta bort från jämförelse
                                </p>
                            </div>
                        </EquipmentCalendarRow>
                    ))}
                </div>
                {equipment.length === 0 ? (
                    <div className="mt-4 mb-4 text-muted text-center">
                        Lägg till utrustning, paket, eller taggar ovan för att jämföra tillgänglighet kring det valda
                        datumet.
                    </div>
                ) : null}
            </Card>
        </Layout>
    );
};

export default CompareAvailabilityPage;
