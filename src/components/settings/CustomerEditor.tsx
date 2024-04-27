import React from 'react';
import { Form } from 'react-bootstrap';
import { getAccountKindName, getLanguageName, getPricePlanName, toIntOrUndefined } from '../../lib/utils';
import { AccountKind } from '../../models/enums/AccountKind';
import { Language } from '../../models/enums/Language';
import { PricePlan } from '../../models/enums/PricePlan';
import { Customer } from '../../models/interfaces/Customer';
import { FormNumberFieldWithoutScroll } from '../utils/FormNumberFieldWithoutScroll';

type Props = {
    entity: Customer;
    save: (x: Customer) => void;
    readOnly?: boolean;
};

const CustomerEditor: React.FC<Props> = ({ entity, save, readOnly = false }: Props) => {
    return (
        <>
            <Form.Group controlId="formName">
                <Form.Label>Namn</Form.Label>
                <Form.Control
                    required
                    type="text"
                    defaultValue={entity?.name}
                    readOnly={readOnly}
                    onChange={(e) => save({ ...entity, name: e.target.value })}
                />
            </Form.Group>
            <Form.Group controlId="formColor">
                <Form.Label>Hoogia-id</Form.Label>
                <FormNumberFieldWithoutScroll
                    type="number"
                    min="0"
                    value={entity.invoiceHogiaId ?? undefined}
                    readOnly={readOnly}
                    onChange={(e) =>
                        save({
                            ...entity,
                            invoiceHogiaId: toIntOrUndefined(e.target.value) ?? 0,
                        })
                    }
                />
            </Form.Group>
            <Form.Group controlId="formColor">
                <Form.Label>Fakturaadress</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    readOnly={readOnly}
                    onChange={(e) => save({ ...entity, invoiceAddress: e.target.value })}
                    defaultValue={entity.invoiceAddress ?? ''}
                />
            </Form.Group>

            <Form.Group controlId="formPricePlan">
                <Form.Label>Prisplan</Form.Label>
                <Form.Control
                    as="select"
                    name="pricePlan"
                    defaultValue={entity.pricePlan ?? ''}
                    readOnly={readOnly}
                    onChange={(e) =>
                        save({
                            ...entity,
                            pricePlan: toIntOrUndefined(e.target.value) ?? null,
                        })
                    }
                >
                    <option value="">Ingen prisplan</option>
                    <option value={PricePlan.THS}>{getPricePlanName(PricePlan.THS)}</option>
                    <option value={PricePlan.EXTERNAL}>{getPricePlanName(PricePlan.EXTERNAL)}</option>
                </Form.Control>
            </Form.Group>

            <Form.Group controlId="formAccountKind">
                <Form.Label>Kontotyp</Form.Label>
                <Form.Control
                    as="select"
                    name="accountKind"
                    defaultValue={entity.accountKind ?? ''}
                    readOnly={readOnly}
                    onChange={(e) =>
                        save({
                            ...entity,
                            accountKind: toIntOrUndefined(e.target.value) ?? null,
                        })
                    }
                >
                    <option value="">Ingen kontotyp</option>
                    <option value={AccountKind.EXTERNAL}>{getAccountKindName(AccountKind.EXTERNAL)}</option>
                    <option value={AccountKind.INTERNAL}>{getAccountKindName(AccountKind.INTERNAL)}</option>
                </Form.Control>
            </Form.Group>

            <Form.Group controlId="formLanguage">
                <Form.Label>Språk</Form.Label>
                <Form.Control
                    as="select"
                    name="language"
                    defaultValue={entity.language ?? Language.SV}
                    readOnly={readOnly}
                    onChange={(e) =>
                        save({
                            ...entity,
                            language: e.target.value as Language | null,
                        })
                    }
                >
                    <option value={Language.SV}>{getLanguageName(Language.SV)}</option>
                    <option value={Language.EN}>{getLanguageName(Language.EN)}</option>
                </Form.Control>
            </Form.Group>
        </>
    );
};

export default CustomerEditor;
