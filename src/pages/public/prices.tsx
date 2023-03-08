import React, { useState } from 'react';
import { Alert, Button, ButtonGroup, Table } from 'react-bootstrap';
import useSwr from 'swr';
import ActivityIndicator from '../../components/utils/ActivityIndicator';
import { equipmentsFetcher, equipmentPublicCategoriesFetcher } from '../../lib/fetchers';
import { formatPrice, formatTHSPrice } from '../../lib/pricingUtils';
import { groupBy } from '../../lib/utils';
import { EquipmentPrice } from '../../models/interfaces';

const containerStyle = {
    margin: 'auto',
    marginTop: '8rem',
    width: 1200,
    maxWidth: '100%',
    padding: '2rem',
};

const pageTitle = 'Prislista';

const addVatToPrice = (price: EquipmentPrice): EquipmentPrice => ({
    ...price,
    pricePerUnit: price.pricePerUnit * 1.25,
    pricePerHour: price.pricePerHour * 1.25,
    pricePerUnitTHS: price.pricePerUnitTHS * 1.25,
    pricePerHourTHS: price.pricePerHourTHS * 1.25,
});

type PriceCellsProps = {
    price: EquipmentPrice;
    showWithVat: boolean;
    hidePriceType?: boolean;
};

const PriceCells: React.FC<PriceCellsProps> = ({ price, hidePriceType, showWithVat }: PriceCellsProps) =>
    price ? (
        <>
            <td>{hidePriceType ? null : price.name}</td>
            <td>
                <div>{formatPrice(showWithVat ? addVatToPrice(price) : price)}</div>
                <div className="text-muted">{formatTHSPrice(showWithVat ? addVatToPrice(price) : price)}</div>
            </td>
        </>
    ) : (
        <>
            <td></td>
            <td className="text-muted">Kontakta oss för pris</td>
        </>
    );

const PublicPricePage: React.FC = () => {
    const { data: equipment, error, isValidating } = useSwr('/api/public/equipment', equipmentsFetcher);
    const { data: equipmentCategories } = useSwr(
        '/api/public/equipmentPublicCategories',
        equipmentPublicCategoriesFetcher,
    );

    const [language, setLanguage] = useState<'sv' | 'en'>('sv');
    const [includeVat, setIncludeVAT] = useState(true);

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

            <ButtonGroup className="mb-3 mr-2">
                <Button variant={language === 'sv' ? 'primary' : 'secondary'} onClick={() => setLanguage('sv')}>
                    Svenska
                </Button>
                <Button variant={language === 'en' ? 'primary' : 'secondary'} onClick={() => setLanguage('en')}>
                    English
                </Button>
            </ButtonGroup>
            <ButtonGroup className="mb-3">
                <Button variant={includeVat ? 'primary' : 'secondary'} onClick={() => setIncludeVAT(true)}>
                    Inklusive moms
                </Button>
                <Button variant={!includeVat ? 'primary' : 'secondary'} onClick={() => setIncludeVAT(false)}>
                    Exklusive moms
                </Button>
            </ButtonGroup>

            {equipmentGroups.map((x) => (
                <div key={`category-${x.category.id}`} className="mb-5">
                    {x.category.name ? <h2 className="h5">{x.category.name}</h2> : null}
                    {x.category.description ? <div className="text-muted mb-3">{x.category.description}</div> : null}
                    <Table style={{ width: '100%' }}>
                        <colgroup>
                            <col style={{ width: 'auto' }} />
                            <col style={{ width: '160px' }} />
                            <col style={{ width: '160px' }} />
                        </colgroup>
                        <tbody>
                            {x.equipment.map((equipment) => (
                                <React.Fragment key={`equipment-${equipment.id}`}>
                                    <tr>
                                        <td rowSpan={equipment.prices.length > 0 ? equipment.prices.length : 1}>
                                            <div>{language === 'sv' ? equipment.name : equipment.nameEN}</div>
                                            <div className="text-muted">
                                                {language === 'sv' ? equipment.description : equipment.descriptionEN}
                                            </div>
                                        </td>
                                        <PriceCells
                                            price={equipment.prices[0]}
                                            hidePriceType={equipment.prices.length === 1}
                                            showWithVat={includeVat}
                                        ></PriceCells>
                                    </tr>
                                    {equipment.prices.slice(1).map((price) => (
                                        <tr key={`equipment-${equipment.id}-price-${price.id}`}>
                                            <PriceCells price={price} showWithVat={includeVat}></PriceCells>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ))}
        </div>
    );
};

export default PublicPricePage;
