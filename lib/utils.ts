import { Status } from '../interfaces/enums/Status';

// Date formatter
//
const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

export const formatDate = (date: Date): string => date.toLocaleString('se-SE', dateFormatOptions);

// Get string from status code
//
export const getStatusName = (status: Status): string => {
    switch (status) {
        case Status.DRAFT:
            return 'Utkast';

        case Status.BOOKED:
            return 'Bokad';

        case Status.OUT:
            return 'Ute';

        case Status.ONGOING:
            return 'Pågående';

        case Status.RETURNED:
            return 'Återlämnad';

        case Status.DONE:
            return 'Klar';

        case Status.INVOICED:
            return 'Fakturerad';

        case Status.PAID:
            return 'Betalad';

        case Status.CANCELED:
            return 'Inställd';
    }
};
