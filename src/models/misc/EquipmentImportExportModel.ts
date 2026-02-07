import { IEquipmentObjectionModel } from '../objection-models';

export interface EquipmentImportExportModel extends IEquipmentObjectionModel {
    equipmentPublicCategoryName?: string;
    equipmentLocationName?: string;
    equipmentTagNames?: string[];
}

export interface Stage1JsonModel {
    type?: string;
    name: string;
    data: Stage1Booking[] | Stage1EqipmentListEntry[] | Stage1EqipmentInventory[] | Stage1Salary[];
}

export interface Stage1Booking {
    id: string;
    title: string;
    description: string;
    responsible: string;
    start: string;
    end: string;
    location: string;
    org_name: string;
    org_address: string;
    org_ref: string;
    days: string;
    invoice_num: string;
    intern: string;
    rent_type: string;
    status: string;
    hidden: string;
    price_plan: string;
    cal_sync_id: string;
    equipment: Stage1EqipmentListEntry[];
}

export interface Stage1EqipmentListEntry {
    sort: string;
    asset_id: string;
    rent_title: string;
    rent_comment: string;
    rent_count: string;
    price_ex: string;
    discount: string;
    event_id: string;
}

export interface Stage1EqipmentInventory {
    id: string;
    title: string;
    price: string;
    thsprice: string;
}
export interface Stage1Salary {
    time_id: string;
    event_id: string;
    who: string;
    time_note: string;
    hour_price: string;
    time_hours: string;
    time_start: string;
    time_end: string;
    time_account: string;
    hidden: string;
}
