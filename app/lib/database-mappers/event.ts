import { ColumnValue } from 'tedious'
import { Event } from '../../interfaces'

const findValue = (colName: string, cols: ColumnValue[]) => cols.filter(col => col.metadata.colName === colName)[0].value;

const mapEvent = (eventRow: ColumnValue[]): Event => {
    return {
        name: findValue('Name', eventRow),
        id: findValue('Id', eventRow),
        created: findValue('Created', eventRow),
        updated: findValue('Updated', eventRow),
        ownerUser: undefined,
        coOwnerUsers: undefined,
        equipmenttLists: undefined,
        timeEstimates: undefined,
        timeReports: undefined,
        changelog: undefined,
        eventType: findValue('EventType', eventRow),
        status: findValue('Status', eventRow),
        invoiceHoogiaId: findValue('InvoiceHoogiaId', eventRow),
        invoiceAddress: findValue('InvoiceAddress', eventRow),
        invoiceTag: findValue('InvoiceTag', eventRow),
        pricePlan: findValue('PricePlan', eventRow),
        accountKind: findValue('AccountKind', eventRow),
        note: findValue('Note', eventRow),
        returnalNote: findValue('ReturnalNote', eventRow),
        location: findValue('Location', eventRow),
        contactPersonName: findValue('ContactPersonName', eventRow),
        contactPersonPhone: findValue('ContactPersonPhone', eventRow),
        contactPersonEmail: findValue('ContactPersonEmail', eventRow),
    }
}

export default mapEvent
