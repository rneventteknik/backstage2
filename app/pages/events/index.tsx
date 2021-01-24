import { Event, User } from '../../interfaces'
import Layout from '../../components/Layout'
import EventList from '../../components/EventList'
import { GetStaticProps } from 'next'
import { AccountKind } from '../../interfaces/enums/AccountKind'
import { PricePlan } from '../../interfaces/enums/PricePlan'
import { EventType } from '../../interfaces/enums/EventType'
import { Status } from '../../interfaces/enums/Status'
import { MemberStatus } from '../../interfaces/enums/MemberStatus'
import { Role } from '../../interfaces/enums/Role'
// import * as Mssql from 'mssql'
import * as Tedious from 'tedious'

type Props = {
    items: Event[]
}


const EventListPage = ({ items }: Props) => (
    <Layout title='Event list'>
        <h1>
            Event List
        </h1>
        <EventList items={items} />
    </Layout>
)

export const getStaticProps: GetStaticProps = async () => {
    // const albert: User = {
    //     id: 0,
    //     name: 'Albert',
    //     created: new Date().toString(),
    //     updated: new Date().toString(),
    //     memberStatus: MemberStatus.AKTIV,
    //     nameTag: 'AJ',
    //     phoneNumber: '070 000 000 1',
    //     role: Role.ADMIN,
    //     slackId: ''
    // }

    // const event1: Event = {
    //     name: 'Lunchföreläsning',
    //     id: 123,
    //     created: new Date().toString(),
    //     updated: new Date().toString(),
    //     ownerUser: albert,
    //     coOwnerUsers: [],
    //     equipmenttLists: [],
    //     timeEstimates: [],
    //     timeReports: [],
    //     changelog: [],
    //     eventType: EventType.RENTAL,
    //     status: Status.CANCELED,
    //     invoiceHoogiaId: 0,
    //     invoiceAddress: 'THS, Drottning Kristinas väg 19, 114 28 Stockholm',
    //     invoiceTag: 'GK1732',
    //     pricePlan: PricePlan.EXTERNAL,
    //     accountKind: AccountKind.EXTERNAL,
    //     note: 'Varje dag testar vi...',
    //     returnalNote: 'En anmärkning',
    //     location: 'Borta',
    //     contactPersonName: 'Shady mc Person',
    //     contactPersonPhone: '07012345678',
    //     contactPersonEmail: 'shmpr78@shadybuisness.com',
    // };
    // return {props: {items: [event1]}}

    const config: Tedious.ConnectionConfig = {
        server: "backstage2-test.database.windows.net",
        authentication: {
            type: "default",
            options: {
                userName: "rn",
                password: ""
            }
        },
        options: {
            database: "backstage2",
            encrypt: true
        }
    };

    const connection = new Tedious.Connection(config);

    connection.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("connecting...");
        }
        const request: Tedious.Request = new Tedious.Request("SELECT * FROM Event", function(err, rowCount) {
            if (err) {
              console.log(err);
            } else {
              console.log(rowCount + ' rows');
            }
            connection.close();
          });

          request.on('row', function(columns) {
            columns.forEach(function(column) {
              if (column.value === null) {
                console.log('NULL');
              } else {
                console.log(column.value);
              }
            });
          });

          request.on('done', function(rowCount, more) {
            console.log(rowCount + ' rows returned');
          });

          connection.execSql(request);
    });

    return { props: { items: [] } };
}

export default EventListPage
