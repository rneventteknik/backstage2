import Head from 'next/head';
import React, { useState } from 'react';
import { fetchEquipmentPublicCategoriesPublic, fetchEquipmentsPublic } from '../../lib/db-access';
import { Button, ButtonGroup, Table } from 'react-bootstrap';
import EquipmentTagDisplay from '../../components/utils/EquipmentTagDisplay';
import { addVATToPriceWithTHS, convertPriceToCurrencyWithTHS, formatPrice, formatTHSPrice } from '../../lib/pricingUtils';
import { getGlobalSetting, groupBy, replaceEmptyStringWithNull } from '../../lib/utils';
import { IEquipmentObjectionModel } from '../../models/objection-models';
import {
    IEquipmentPriceObjectionModel,
    IEquipmentPublicCategoryObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { getGlobalSettings } from '../../lib/useUser';
import { KeyValue } from '../../models/interfaces/KeyValue';
import Image from 'next/image';
import Link from 'next/link';

const containerStyle: React.CSSProperties = {
    margin: 'auto',
    marginTop: '8rem',
    width: 1200,
    maxWidth: '100%',
    padding: '2rem',
};
const logoContainerStyle: React.CSSProperties = {
    margin: 'auto',
    paddingTop: '1.5rem',
    paddingBottom: '0.5rem',
    textAlign: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: '#1A1A1A',
};

const pageTitle = 'Prislista';

type PriceCellsProps = {
    price: IEquipmentPriceObjectionModel;
    showWithVat: boolean;
    showThsPrice: boolean;
    hidePriceType?: boolean;
};

type Props = {
    equipment: IEquipmentObjectionModel[];
    equipmentCategories: IEquipmentPublicCategoryObjectionModel[];
    globalSettings: KeyValue[];
};
export const getServerSideProps = async () => {
    const equipment = (await fetchEquipmentsPublic()).map((x) => x.toJSON());
    const equipmentCategories = (await fetchEquipmentPublicCategoriesPublic()).map((x) => x.toJSON());
    const globalSettings = await getGlobalSettings();

    return { props: { equipment, equipmentCategories, globalSettings } };
};

const PriceCells: React.FC<PriceCellsProps> = ({ price, hidePriceType, showWithVat, showThsPrice }: PriceCellsProps) =>
    price ? (
        <>
            <td>{hidePriceType ? null : price.name}</td>
            <td>
                {showThsPrice
                    ? formatTHSPrice(showWithVat ? addVATToPriceWithTHS(convertPriceToCurrencyWithTHS(price)) : convertPriceToCurrencyWithTHS(price))
                    : formatPrice(showWithVat ? addVATToPriceWithTHS(convertPriceToCurrencyWithTHS(price)) : convertPriceToCurrencyWithTHS(price))}
            </td>
        </>
    ) : (
        <>
            <td></td>
            <td className="text-muted">Kontakta oss för pris</td>
        </>
    );

const PublicPricePage: React.FC<Props> = ({ equipment, equipmentCategories, globalSettings }: Props) => {
    const [language, setLanguage] = useState<'sv' | 'en'>('sv');
    const [includeVat, setIncludeVAT] = useState(true);
    const [showThsPrice, setShowThsPrice] = useState(false);

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
        <>
            <Head>
                <title>{getGlobalSetting('content.public.publicPriceTitle', globalSettings, pageTitle)}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href={getGlobalSetting('content.image.favIcon', globalSettings, '')}
                />
            </Head>
            {replaceEmptyStringWithNull(
                getGlobalSetting('content.image.publicPriceHeaderImage', globalSettings, ''),
            ) !== null ? (
                <div style={logoContainerStyle}>
                    <Link href={getGlobalSetting('content.public.publicPriceHeaderImageLink', globalSettings, '')}>
                        <Image
                            src={getGlobalSetting('content.image.publicPriceHeaderImage', globalSettings, '')}
                            height={35}
                            width={285}
                            role="button"
                            alt="Logo"
                        />
                    </Link>
                </div>
            ) : null}
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
                <ButtonGroup className="mb-3 mr-2">
                    <Button variant={includeVat ? 'primary' : 'secondary'} onClick={() => setIncludeVAT(true)}>
                        Inklusive moms
                    </Button>
                    <Button variant={!includeVat ? 'primary' : 'secondary'} onClick={() => setIncludeVAT(false)}>
                        Exklusive moms
                    </Button>
                </ButtonGroup>
                <ButtonGroup className="mb-3">
                    <Button variant={!showThsPrice ? 'primary' : 'secondary'} onClick={() => setShowThsPrice(false)}>
                        Ordinarie pris
                    </Button>
                    <Button variant={showThsPrice ? 'primary' : 'secondary'} onClick={() => setShowThsPrice(true)}>
                        THS-pris
                    </Button>
                </ButtonGroup>
                {equipmentGroups.map((x) => (
                    <div key={`category-${x.category.id}`} className="mb-5">
                        {x.category.name ? <h2 className="h5">{x.category.name}</h2> : null}
                        {x.category.description ? (
                            <div className="text-muted mb-3">{x.category.description}</div>
                        ) : null}
                        <Table style={{ width: '100%' }}>
                            <colgroup>
                                <col style={{ width: 'auto' }} />
                                <col style={{ width: '180px' }} />
                                <col style={{ width: '180px' }} />
                            </colgroup>
                            <tbody>
                                {x.equipment.map((equipment) => (
                                    <React.Fragment key={`equipment-${equipment.id}`}>
                                        <tr>
                                            <td
                                                rowSpan={
                                                    equipment.prices && equipment.prices.length > 0
                                                        ? equipment.prices.length
                                                        : 1
                                                }
                                            >
                                                <div>{language === 'sv' ? equipment.name : equipment.nameEN}</div>
                                                <div className="text-muted">
                                                    {language === 'sv'
                                                        ? equipment.description
                                                        : equipment.descriptionEN}
                                                </div>
                                                <div>
                                                    {equipment.tags?.map((x) => (
                                                        <EquipmentTagDisplay tag={x} key={x.id} className="mr-1" />
                                                    ))}
                                                </div>
                                            </td>
                                            {equipment.prices ? (
                                                <PriceCells
                                                    price={equipment.prices[0]}
                                                    hidePriceType={equipment.prices.length === 1}
                                                    showWithVat={includeVat}
                                                    showThsPrice={showThsPrice}
                                                ></PriceCells>
                                            ) : null}
                                        </tr>
                                        {equipment.prices &&
                                            equipment.prices.slice(1).map((price) => (
                                                <tr key={`equipment-${equipment.id}-price-${price.id}`}>
                                                    <PriceCells
                                                        price={price}
                                                        showWithVat={includeVat}
                                                        showThsPrice={showThsPrice}
                                                    ></PriceCells>
                                                </tr>
                                            ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ))}
            </div>
        </>
    );
};

export default PublicPricePage;
