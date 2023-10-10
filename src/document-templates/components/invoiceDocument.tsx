import React from 'react';
import { Page, View, Text, Document, StyleSheet } from '@react-pdf/renderer';
import { commonStyles } from '../utils';
import { PageCount } from './shared/pageCount';
import { Header } from './shared/header';
import { MainContent } from './shared/mainContent';
import { Footer } from './shared/footer';
import { useTextResources } from '../useTextResources';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { InvoiceData, InvoiceRow, InvoiceRowType, PricedInvoiceRow } from '../../models/misc/Invoice';
import { InvoiceInfo } from './invoiceInfo';
import { groupBy, reduceSumFn } from '../../lib/utils';
import {
    TableCellAutoWidth,
    TableCellFixedWidth,
    TableRow,
    TableRowWithNoBorder,
    TableRowWithTopBorder,
} from './shared/utils';
import { formatNumberAsCurrency } from '../../lib/pricingUtils';

const styles = StyleSheet.create({
    ...commonStyles,
    totalPriceSection: {
        flexDirection: 'column',
        marginBottom: 15,
        marginLeft: 263,
    },
});

const getItemRows = (invoiceData: InvoiceData): PricedInvoiceRow[] =>
    invoiceData.invoiceRows.filter((invoiceRow) => invoiceRow.rowType === InvoiceRowType.ITEM) as PricedInvoiceRow[];

const calculateRowPriceSum = (invoiceRows: PricedInvoiceRow[]): number =>
    invoiceRows.map((invoiceRow) => invoiceRow.rowPrice).reduce(reduceSumFn);

const calculateTotalAmount = (invoiceData: InvoiceData): number => calculateRowPriceSum(getItemRows(invoiceData));

const calculateTotalVAT = (invoiceData: InvoiceData): number => calculateTotalAmount(invoiceData) * 0.25;

type InvoiceRowProps = {
    invoiceRow: InvoiceRow;
};

const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoiceRow }: InvoiceRowProps) => {
    switch (invoiceRow.rowType) {
        case InvoiceRowType.HEADING:
            return (
                <TableRowWithTopBorder compact={true}>
                    <Text style={{ ...styles.heading2, marginTop: 6 }}>{invoiceRow.text}</Text>
                </TableRowWithTopBorder>
            );
        case InvoiceRowType.ITEM:
            const pricedInvoiceRow = invoiceRow as PricedInvoiceRow;
            return (
                <TableRowWithTopBorder compact={true}>
                    <TableCellAutoWidth>
                        <Text>{pricedInvoiceRow.text}</Text>
                    </TableCellAutoWidth>
                    <TableCellFixedWidth width={90} textAlign="right">
                        <Text>{`${pricedInvoiceRow.numberOfUnits}${pricedInvoiceRow.unit}`}</Text>
                    </TableCellFixedWidth>
                    <TableCellFixedWidth width={90} textAlign="right">
                        <Text>{formatNumberAsCurrency(pricedInvoiceRow.pricePerUnit)}</Text>
                    </TableCellFixedWidth>
                    <TableCellFixedWidth width={90} textAlign="right">
                        <Text>{pricedInvoiceRow.account}</Text>
                    </TableCellFixedWidth>
                    <TableCellFixedWidth width={90} textAlign="right">
                        <Text>{formatNumberAsCurrency(pricedInvoiceRow.rowPrice)}</Text>
                    </TableCellFixedWidth>
                </TableRowWithTopBorder>
            );
        case InvoiceRowType.ITEM_COMMENT:
            return (
                <TableRowWithNoBorder compact={true}>
                    <Text style={{ color: '#999999' }}>{invoiceRow.text}</Text>
                </TableRowWithNoBorder>
            );
    }
};

type AccountRowsProps = {
    invoiceData: InvoiceData;
};

const AccountRows: React.FC<AccountRowsProps> = ({ invoiceData }: AccountRowsProps) => {
    const { t } = useTextResources();
    const rowsByAccount = groupBy(getItemRows(invoiceData), (invoiceRow) => invoiceRow.account);
    return (
        <View>
            {Object.keys(rowsByAccount).map((key) => (
                <TableRow key={key} compact={true}>
                    <TableCellAutoWidth>
                        <Text>{`${t('invoice.account')}: ${key}`}</Text>
                    </TableCellAutoWidth>
                    <TableCellFixedWidth width={90} textAlign="right">
                        <Text>{formatNumberAsCurrency(calculateRowPriceSum(rowsByAccount[key]))}</Text>
                    </TableCellFixedWidth>
                </TableRow>
            ))}
        </View>
    );
};

type InvoiceTotalPriceSectionProps = {
    invoiceData: InvoiceData;
};

const InvoiceTotalPriceSection: React.FC<InvoiceTotalPriceSectionProps> = ({
    invoiceData,
}: InvoiceTotalPriceSectionProps) => {
    const { t } = useTextResources();

    return (
        <View style={styles.totalPriceSection} wrap={false}>
            <Text style={{ ...styles.heading, ...styles.bold }}>{t('common.total-price-section.heading')}</Text>

            <AccountRows invoiceData={invoiceData} />

            <TableRow compact={true}>
                <TableCellAutoWidth>
                    <Text style={styles.bold}>{t('invoice.total-price-section.total-sum-ex-vat')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.bold}>{formatNumberAsCurrency(calculateTotalAmount(invoiceData))}</Text>
                </TableCellFixedWidth>
            </TableRow>

            <TableRow compact={true}>
                <TableCellAutoWidth>
                    <Text>{t('invoice.total-price-section.vat')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text>{formatNumberAsCurrency(calculateTotalVAT(invoiceData))}</Text>
                </TableCellFixedWidth>
            </TableRow>

            <TableRow compact={true}>
                <TableCellAutoWidth>
                    <Text style={styles.bold}>{t('invoice.total-price-section.total-sum-inc-vat')}</Text>
                </TableCellAutoWidth>
                <TableCellFixedWidth width={90} textAlign="right">
                    <Text style={styles.bold}>
                        {formatNumberAsCurrency(calculateTotalAmount(invoiceData) + calculateTotalVAT(invoiceData))}
                    </Text>
                </TableCellFixedWidth>
            </TableRow>
        </View>
    );
};

type InvoiceDocumentProps = {
    invoiceData: InvoiceData;
    globalSettings: KeyValue[];
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
    invoiceData,
    globalSettings,
}: InvoiceDocumentProps) => {
    const { t } = useTextResources();

    const hasComment = false; // TODO

    return (
        <Document title={t('invoice.title')}>
            <Page size="A4" style={styles.page}>
                <PageCount />

                <Header
                    title={t('invoice.title')}
                    subTitle={invoiceData.invoiceNumber}
                    globalSettings={globalSettings}
                />
                <InvoiceInfo invoiceData={invoiceData} />

                <MainContent>
                    {hasComment ? (
                        <>
                            <Text style={styles.bold}>{t('invoice.comment')}</Text>
                            <Text style={styles.marginBottomLarge}>{'Testkommentar'}</Text>
                        </>
                    ) : null}
                    <View style={styles.flexGrow}>
                        <TableRowWithNoBorder compact={true}>
                            <TableCellAutoWidth>
                                <Text style={styles.italic}>
                                    {t('common.equipment-list.table-header.specification')}
                                </Text>
                            </TableCellAutoWidth>
                            <TableCellFixedWidth width={90} textAlign="right">
                                <Text style={styles.italic}>{t('common.equipment-list.table-header.count')}</Text>
                            </TableCellFixedWidth>
                            <TableCellFixedWidth width={90} textAlign="right">
                                <Text style={styles.italic}>{t('common.equipment-list.table-header.price')}</Text>
                            </TableCellFixedWidth>
                            <TableCellFixedWidth width={90} textAlign="right">
                                <Text style={styles.italic}>{t('invoice.account')}</Text>
                            </TableCellFixedWidth>
                            <TableCellFixedWidth width={90} textAlign="right">
                                <Text style={styles.italic}>{t('common.equipment-list.table-header.total-price')}</Text>
                            </TableCellFixedWidth>
                        </TableRowWithNoBorder>
                        {invoiceData.invoiceRows.map((invoiceRow, index) => (
                            <InvoiceRow invoiceRow={invoiceRow} key={index} />
                        ))}
                    </View>

                    <InvoiceTotalPriceSection invoiceData={invoiceData} />
                </MainContent>

                <Footer />
            </Page>
        </Document>
    );
};
