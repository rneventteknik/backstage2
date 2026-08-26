import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button, Card, Form } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { faCheckCircle, faExclamationCircle, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/layout/Header';
import { Role } from '../../models/enums/Role';

import { KeyValue } from '../../models/interfaces/KeyValue';
import {
    Stage1Booking,
    Stage1EqipmentInventory,
    Stage1EqipmentListEntry,
    Stage1JsonModel,
    Stage1Salary,
} from '../../models/misc/EquipmentImportExportModel';
import { Status } from '../../models/enums/Status';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import { AccountKind } from '../../models/enums/AccountKind';
import { BookingType } from '../../models/enums/BookingType';
import { Language } from '../../models/enums/Language';
import { PricePlan } from '../../models/enums/PricePlan';
import { PartialDeep } from 'type-fest';
import { getResponseContentOrError } from '../../lib/utils';
import {
    BookingObjectionModel,
    EquipmentListObjectionModel,
    IBookingObjectionModel,
    IEquipmentListEntryObjectionModel,
    IEquipmentListObjectionModel,
} from '../../models/objection-models/BookingObjectionModel';
import { TimeReport } from '../../models/interfaces';
import { ITimeReportObjectionModel } from '../../models/objection-models';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.ADMIN);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Importera Stage 1 bokningar';
const breadcrumbs = [
    { link: '/equipment', displayName: 'Utrustning' },
    { link: '/equipment/import-bookings', displayName: pageTitle },
];

const BookingJsonImportPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const [json, setJson] = useState('');
    const [importHasStarted, setImportHasStarted] = useState(false);
    const [done, setDone] = useState(false);

    // Parse JSON
    //
    let tablesInJson: Stage1JsonModel[] | [];
    let bookingsInJson: Stage1Booking[] = [];
    let bookingsToImport: Stage1Booking[] = [];
    let equipmentInJson: Stage1EqipmentListEntry[] = [];
    let equipmentInventoryInJson: Stage1EqipmentInventory[] = [];
    let salariesInJson: Stage1Salary[] = [];
    let salariesToImport: Stage1Salary[] = [];

    let jsonError: string | null = null;

    try {
        tablesInJson = JSON.parse(json);

        bookingsInJson = tablesInJson?.find((booking) => booking.type == 'table' && booking.name == 'rn_eventwork')
            ?.data as Stage1Booking[];

        // Ignore all hidden aka removed bookings
        bookingsToImport = bookingsInJson.filter((x) => x.hidden !== '1');

        equipmentInJson = tablesInJson?.find(
            (equipment) => equipment.type == 'table' && equipment.name == 'rn_rent_items',
        )?.data as Stage1EqipmentListEntry[];

        equipmentInventoryInJson = tablesInJson?.find(
            (equipment) => equipment.type == 'table' && equipment.name == 'rn_equipment_list',
        )?.data as Stage1EqipmentInventory[];

        salariesInJson = tablesInJson?.find(
            (equipment) => equipment.type == 'table' && equipment.name == 'rn_timereport',
        )?.data as Stage1Salary[];

        salariesToImport = salariesInJson.filter((x) => x.hidden !== '1');
    } catch (error) {
        jsonError = 'Error: ' + error + '.';
    }

    // Import logic
    //
    const importAll = async () => {
        setImportHasStarted(true);
        for (const booking of bookingsToImport) {
            const newBookingId = await addBooking(booking);
            const newEquipmentlistId = await addEquipmentList(booking, newBookingId);

            const equipmentInBooking = equipmentInJson.filter((equipment) => equipment.event_id === booking.id);
            for (const equipment of equipmentInBooking) {
                const inventoryEquipment = equipmentInventoryInJson.find((x) => x.id === equipment.asset_id);
                const eq = {
                    ...equipment,
                    rent_title: equipment.rent_title ?? inventoryEquipment?.title,
                    price_ex:
                        equipment.price_ex ??
                        (booking.price_plan === '0' ? inventoryEquipment?.thsprice : inventoryEquipment?.price),
                };
                await addEquipment(eq, newBookingId, newEquipmentlistId);
            }

            addSalaries(booking, newBookingId);
        }
        setDone(true);
    };

    const addSalaries = async (booking: Stage1Booking, newBookingId: number) => {
        const salariesForBooking = salariesToImport.filter((x) => x.event_id == booking.id);

        for (const salary of salariesForBooking) {
            const salaryToImport: Partial<TimeReport> = {
                name: `${salary.time_note} (${salary.time_start} - ${salary.time_end})`,
                actualWorkingHours: Number(salary.time_hours),
                billableWorkingHours: Number(salary.time_hours),
                pricePerHour: Number(salary.hour_price),
                userId: 10, // TODO: Map users?
                bookingId: newBookingId,
            };

            const addRequest = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timeReport: salaryToImport }),
            };

            fetch('/api/bookings/' + newBookingId + '/timeReport', addRequest).then((apiResponse) =>
                getResponseContentOrError<ITimeReportObjectionModel>(apiResponse),
            );
        }
    };

    const addBooking = async (booking: PartialDeep<Stage1Booking>) => {
        // The product adding is done in two steps. First, use a POST request to add the equipment.
        const bookingToImport: Partial<BookingObjectionModel> = {
            // All imported bookings are considered done
            status: Status.DONE,
            paymentStatus: PaymentStatus.PAID,
            salaryStatus: SalaryStatus.SENT,
            // TODO set flag for imported bookings

            name: booking.title ?? 'Okänt bokningsnamn',
            note: booking.description ?? '',
            bookingType: booking.rent_type == '0' ? BookingType.RENTAL : BookingType.GIG,
            location: booking.location ?? '',
            invoiceNumber: booking.invoice_num ?? '',
            accountKind: booking.intern == '1' ? AccountKind.INTERNAL : AccountKind.EXTERNAL,
            pricePlan: booking.price_plan == '0' ? PricePlan.THS : PricePlan.EXTERNAL,
            customerName: booking.org_name ?? '',
            invoiceAddress: booking.org_address ?? '',
            invoiceTag: booking.org_ref ?? '',
            calendarBookingId: booking.cal_sync_id ?? '',

            // Imported without contact information due to gdpr?
            invoiceHogiaId: NaN,
            contactPersonEmail: '',
            contactPersonName: '',
            contactPersonPhone: '',
            returnalNote: '',
            fixedPrice: NaN,

            language: Language.SV,
        };
        const addRequest = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking: bookingToImport }),
        };

        return fetch('/api/bookings', addRequest)
            .then((apiResponse) => getResponseContentOrError<IBookingObjectionModel>(apiResponse))
            .then((response) => {
                return response.id;
            });
    };

    const addEquipmentList = async (booking: Partial<Stage1Booking>, newBookingId: number) => {
        const newEquipmentList: Partial<EquipmentListObjectionModel> = {
            name: 'Utrustning',
            usageStartDatetime: booking.start,
            usageEndDatetime: booking.end,
            numberOfDays: undefined, // TODO
        };
        const body = { equipmentList: newEquipmentList };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        return fetch('/api/bookings/' + newBookingId + '/equipmentLists', request).then((apiResponse) =>
            getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse).then((response) => {
                return response.id;
            }),
        );
    };

    const addEquipment = async (
        equipment: Partial<Stage1EqipmentListEntry>,
        newBookingId: number,
        newEquipmentListId: number,
    ) => {
        let priceEx = Number(equipment.price_ex);
        let DiscountFromPriceEx = 0;
        if (priceEx < 0)
        {
            priceEx = 0;
            DiscountFromPriceEx = Math.abs(priceEx);
        }
        const newEquipmentListEntry: Partial<IEquipmentListEntryObjectionModel> = {
        
            name: equipment.rent_title,
            pricePerUnit: priceEx,
            discount: Number(equipment.discount) + DiscountFromPriceEx,
            description: equipment.rent_comment,
            sortIndex: Number(equipment.sort),
            numberOfUnits: Number(equipment.rent_count),
            numberOfHours: 0,
            account: null,
        };

        const body = { equipmentListEntry: newEquipmentListEntry };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        return fetch(
            '/api/bookings/' + newBookingId + '/equipmentListEntry?equipmentListId=' + newEquipmentListId,
            request,
        ).then((apiResponse) => getResponseContentOrError<IEquipmentListEntryObjectionModel>(apiResponse));
    };

    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" disabled={importHasStarted} onClick={() => importAll()}>
                    <FontAwesomeIcon icon={faFileImport} className="mr-1" /> Importera
                </Button>
            </Header>

            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex">
                        <div className="flex-grow-1 mr-4">Status</div>
                    </div>
                </Card.Header>
                <Card.Body>
                    {jsonError && json.length === 0 ? <p>Fyll i JSON nedan för att börja.</p> : null}

                    {jsonError && json.length > 0 ? (
                        <p className="text-danger">
                            <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att tolka JSON. {jsonError}
                        </p>
                    ) : null}

                    {!jsonError && !importHasStarted ? (
                        <>
                            <p>Bokningar att importera: {bookingsToImport?.length} st</p>
                            <p>Utrustningsposter att importera: {equipmentInJson?.length} st</p>
                            <p>Lön att importera: {salariesToImport?.length} st</p>
                        </>
                    ) : null}

                    {done ? (
                        <p className="text-success">
                            <FontAwesomeIcon icon={faCheckCircle} /> Import klar!
                        </p>
                    ) : null}
                </Card.Body>
            </Card>

            <Form.Group controlId="formDescriptionEN">
                <Form.Label>JSON</Form.Label>
                <Form.Control
                    as="textarea"
                    placeholder="[{...}]"
                    rows={10}
                    name="json"
                    onChange={(e) => setJson(e.target.value)}
                    defaultValue={json}
                    disabled={importHasStarted}
                />
            </Form.Group>
        </Layout>
    );
};

export default BookingJsonImportPage;
