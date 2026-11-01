import { Equipment, EquipmentPrice } from '../../../models/interfaces';
import { getLinkToEquipment, toMcpPrice } from './primitives';

const toMcpEquipmentPrice = (price: EquipmentPrice) => ({
    name: price.name,
    pricePerUnit: toMcpPrice(price.pricePerUnit),
    pricePerHour: toMcpPrice(price.pricePerHour),
    pricePerUnitTHS: toMcpPrice(price.pricePerUnitTHS),
    pricePerHourTHS: toMcpPrice(price.pricePerHourTHS),
});

export const toMcpEquipmentSummary = (equipment: Equipment) => ({
    id: equipment.id,
    name: equipment.name,
    nameEN: equipment.nameEN,
    link: getLinkToEquipment(equipment.id),
    inventoryCount: equipment.inventoryCount,
    location: equipment.equipmentLocation?.name ?? null,
    equipmentPublicCategory: equipment.equipmentPublicCategory?.name ?? null,
    equipmentTags: equipment.tags.map((tag) => tag.name),
    publiclyVisible: !equipment.publiclyHidden,
    isArchived: Boolean(equipment.isArchived),
    prices: [...equipment.prices].sort((a, b) => a.id - b.id).map(toMcpEquipmentPrice),
});
