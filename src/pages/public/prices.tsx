import React from 'react';
import { Alert, Table } from 'react-bootstrap';
import useSwr from 'swr';
import ActivityIndicator from '../../components/utils/ActivityIndicator';
import { toEquipment, toEquipmentPublicCategory } from '../../lib/mappers/equipment';
import { formatPrice, formatTHSPrice, getResponseContentOrError, groupBy } from '../../lib/utils';
import { EquipmentPrice } from '../../models/interfaces';
import { EquipmentObjectionModel, IEquipmentTagObjectionModel } from '../../models/objection-models';

const containerStyle = {
    margin: 'auto',
    marginTop: '8rem',
    width: 1200,
    maxWidth: '100%',
    padding: '2rem',
};

const pageTitle = 'Prislista';

type PriceCellsProps = {
    price: EquipmentPrice;
    hidePriceType?: boolean;
};

const PriceCells: React.FC<PriceCellsProps> = ({ price, hidePriceType }: PriceCellsProps) =>
    price ? (
        <>
            <td>{hidePriceType ? null : price.name}</td>
            <td>
                <div>{formatPrice(price)}</div>
                <div className="text-muted">{formatTHSPrice(price)}</div>
            </td>
        </>
    ) : (
        <>
            <td></td>
            <td className="text-muted">Kontakta oss för pris</td>
        </>
    );

const PublicPricePage: React.FC = () => {
    const { data: equipment, error, isValidating } = useSwr('/api/public/equipment', fetcher);
    const { data: equipmentCategories } = useSwr(
        '/api/public/equipmentPublicCategories',
        equipmentPublicCategoriesFetcher,
    );

    if (!equipment && !error && isValidating) {
        return (
            <div style={containerStyle}>
                <h1> {pageTitle} </h1>
                <hr />
                <div className="text-center py-5">
                    <ActivityIndicator />
                </div>
            </div>
        );
    }

    if (error || !equipment) {
        return (
            <div style={containerStyle}>
                <h1> {pageTitle} </h1>
                <hr />
                <div className="text-center py-5">
                    <ActivityIndicator />
                </div>
                <Alert variant="danger">
                    <strong> Fel </strong> Prislistan kunde inte hämtas. Försök igen senare.
                </Alert>
            </div>
        );
    }

    const getCategoryById = (id: string) => {
        if (equipmentCategories?.some((x) => x.id == parseInt(id))) {
            return equipmentCategories.filter((x) => x.id == parseInt(id))[0];
        }

        return {
            name: undefined,
            description: undefined,
            id: 0,
            sortIndex: -999,
        };
    };

    const noCategory = 'no-category';
    const equipmentGroups = [];
    for (const categoryId in groupBy(equipment, (x) => x.equipmentPublicCategory?.id ?? noCategory)) {
        const equipmentInGroup = groupBy(equipment, (x) => x.equipmentPublicCategory?.id ?? noCategory)[categoryId];
        equipmentGroups.push({ category: getCategoryById(categoryId), equipment: equipmentInGroup });
    }

    equipmentGroups.sort((a, b) => (a.category.sortIndex ?? 0) - (b.category.sortIndex ?? 0));

    return (
        <div style={containerStyle}>
            <h1>{pageTitle}</h1>
            {equipmentGroups.map((x) => (
                <div key={x.category.id} className="mb-5">
                    {x.category.name ? <h5>{x.category.name}</h5> : null}
                    {x.category.description ? <div className="text-muted mb-3">{x.category.description}</div> : null}
                    <Table style={{ width: '100%' }}>
                        <colgroup>
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: '160px' }} />
                            <col style={{ width: '160px' }} />
                        </colgroup>
                        <tbody>
                            {x.equipment.map((equipment) => (
                                <>
                                    <tr key={equipment.id}>
                                        <td rowSpan={equipment.prices.length > 0 ? equipment.prices.length : 1}>
                                            <div>{equipment.name}</div>
                                            <div className="text-muted">{equipment.description}</div>
                                        </td>
                                        <PriceCells
                                            price={equipment.prices[0]}
                                            hidePriceType={equipment.prices.length === 1}
                                        ></PriceCells>
                                    </tr>
                                    {equipment.prices.slice(1).map((price) => (
                                        <tr key={equipment.id + '-price-' + price.id}>
                                            <PriceCells price={price}></PriceCells>
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ))}
        </div>
    );
};

const fetcher = (url: string) =>
    fetch(url)
        .then((response) => getResponseContentOrError<EquipmentObjectionModel[]>(response))
        .then((objectionModel) => objectionModel.map((x) => toEquipment(x)));

const equipmentPublicCategoriesFetcher = (url: string) =>
    fetch(url)
        .then((apiResponse) => getResponseContentOrError<IEquipmentTagObjectionModel[]>(apiResponse))
        .then((equipmentList) => equipmentList.map((x) => toEquipmentPublicCategory(x)));

export default PublicPricePage;
