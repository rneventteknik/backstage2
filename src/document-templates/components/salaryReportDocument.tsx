import React from 'react';
import { Page, View, Document, Text, StyleSheet } from '@react-pdf/renderer';
import { commonStyles } from '../utils';
import { PageCount } from './shared/pageCount';
import { Header } from './shared/header';
import { MainContent } from './shared/mainContent';
import { SalaryReport } from '../../models/misc/Salary';
import { Footer } from './shared/footer';
import { TableRow, TableCellAutoWidth, TableCellFixedWidth, Col, InfoItem } from './shared/utils';
import { formatCurrency, formatNumberAsCurrency } from '../../lib/pricingUtils';
import { KeyValue } from '../../models/interfaces/KeyValue';

type Props = {
    salaryReport: SalaryReport;
    globalSettings: KeyValue[];
};

const styles = StyleSheet.create({
    ...commonStyles,
    infoSection: {
        padding: 5,
        flexDirection: 'row',
        borderBottom: '1px solid black',
    },
});

export const SalaryReportDocument: React.FC<Props> = ({ salaryReport, globalSettings }: Props) => {
    return (
        <Document title={salaryReport.name}>
            {salaryReport.userSalaryReports.map((userSalaryReport) => (
                <Page key={userSalaryReport.userId} size="A4" style={styles.page}>
                    <PageCount />

                    <Header
                        title={userSalaryReport.user.name}
                        subTitle={userSalaryReport.user.personalIdentityNumber ?? ''}
                        globalSettings={globalSettings}
                    />

                    <View style={styles.infoSection}>
                        <Col>
                            <InfoItem title={'E-mail'} content={userSalaryReport.user.emailAddress}></InfoItem>
                            <InfoItem title={'Telefon'} content={userSalaryReport.user.phoneNumber}></InfoItem>
                            <InfoItem title={'Adress'} content={userSalaryReport.user.homeAddress}></InfoItem>
                        </Col>
                        <Col>
                            <InfoItem title={'Banknamn'} content={userSalaryReport.user.bankName}></InfoItem>
                            <InfoItem
                                title={'Clearingnummer'}
                                content={userSalaryReport.user.clearingNumber}
                            ></InfoItem>
                            <InfoItem title={'Kontonummer'} content={userSalaryReport.user.bankAccount}></InfoItem>
                        </Col>
                    </View>

                    <MainContent>
                        <View style={styles.flexGrow}>
                            <TableRow>
                                <TableCellFixedWidth width={30}>
                                    <Text style={styles.italic}>RS</Text>
                                </TableCellFixedWidth>
                                <TableCellFixedWidth width={70}>
                                    <Text style={styles.italic}>Datum</Text>
                                </TableCellFixedWidth>
                                <TableCellAutoWidth>
                                    <Text style={styles.italic}>Specifikation</Text>
                                </TableCellAutoWidth>
                                <TableCellFixedWidth width={70} textAlign="right">
                                    <Text style={styles.italic}>Antal</Text>
                                </TableCellFixedWidth>
                                <TableCellFixedWidth width={70} textAlign="right">
                                    <Text style={styles.italic}>Timlön</Text>
                                </TableCellFixedWidth>
                                <TableCellFixedWidth width={70} textAlign="right">
                                    <Text style={styles.italic}>Belopp</Text>
                                </TableCellFixedWidth>
                            </TableRow>

                            {userSalaryReport.salaryLines.map((line) => (
                                <TableRow key={line.timeReportId}>
                                    <TableCellFixedWidth width={30}>
                                        <Text>{line.dimension1}</Text>
                                    </TableCellFixedWidth>
                                    <TableCellFixedWidth width={70}>
                                        <Text>{line.date}</Text>
                                    </TableCellFixedWidth>
                                    <TableCellAutoWidth>
                                        <Text>{line.name}</Text>
                                    </TableCellAutoWidth>
                                    <TableCellFixedWidth width={70} textAlign="right">
                                        <Text>{line.hours} h</Text>
                                    </TableCellFixedWidth>
                                    <TableCellFixedWidth width={70} textAlign="right">
                                        <Text>{formatNumberAsCurrency(line.hourlyRate)}</Text>
                                    </TableCellFixedWidth>
                                    <TableCellFixedWidth width={70} textAlign="right">
                                        <Text>{formatCurrency(line.sum)}</Text>
                                    </TableCellFixedWidth>
                                </TableRow>
                            ))}

                            <TableRow>
                                <TableCellAutoWidth>
                                    <Text style={styles.bold}>Totalt att betala SEK</Text>
                                </TableCellAutoWidth>
                                <TableCellFixedWidth width={90} textAlign="right">
                                    <Text style={styles.bold}>{formatCurrency(userSalaryReport.sum)}</Text>
                                </TableCellFixedWidth>
                            </TableRow>
                        </View>
                    </MainContent>

                    <Footer />
                </Page>
            ))}
        </Document>
    );
};
