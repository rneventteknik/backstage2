import currency from 'currency.js';
import { BookingViewModel, User } from '../../../models/interfaces';
import { addVAT } from '../../pricingUtils';

// The lowest layer of the MCP mappers: values shared by every entity, and the rules for which personal data is
// exposed. The layers are:
// - primitives: imports no other mapper
// - <entity>Summary: imports only primitives
// - <entity>Detail: imports primitives and any summaries, never another detail
// so an entity's details can include summaries of any other entity without creating import cycles.

// Personal data (full names and customer contact details) is only exposed to API keys with this scope.
export const PII_SCOPE = 'pii';

export const getFirstName = (name: string): string => name.trim().split(/\s+/)[0];

export const getLinkToBooking = (bookingId: number): string =>
    process.env.APPLICATION_BASE_URL + '/bookings/' + bookingId;

export const getLinkToEquipment = (equipmentId: number): string =>
    process.env.APPLICATION_BASE_URL + '/equipment/' + equipmentId;

// Users carry personal data (contact details, personal identity number, bank details), so only identifying fields
// are exposed.
export const toMcpUser = (user: Pick<User, 'id' | 'name' | 'nameTag'> | undefined, canSeePii: boolean) =>
    user ? { id: user.id, name: canSeePii ? user.name : getFirstName(user.name), nameTag: user.nameTag } : null;

// Without the pii scope only the Hogia ID is exposed, plus the customer name when the customer is registered in Hogia.
export const toMcpCustomerSummary = (booking: BookingViewModel, canSeePii: boolean) =>
    canSeePii
        ? {
              customerName: booking.customerName,
              contactPersonName: booking.contactPersonName,
              invoiceHogiaId: booking.invoiceHogiaId,
          }
        : {
              ...(booking.invoiceHogiaId != null ? { customerName: booking.customerName } : {}),
              invoiceHogiaId: booking.invoiceHogiaId,
          };

export const toMcpCustomerContactDetails = (booking: BookingViewModel, canSeePii: boolean) =>
    canSeePii
        ? {
              contactPersonPhone: booking.contactPersonPhone,
              contactPersonEmail: booking.contactPersonEmail,
              invoiceAddress: booking.invoiceAddress,
              invoiceTag: booking.invoiceTag,
          }
        : {};

export const toMcpPrice = (price: currency) => ({
    excludingVAT: price.value,
    includingVAT: addVAT(price).value,
});

export const toMcpPriceOrNull = (price: currency | null) => (price ? toMcpPrice(price) : null);
