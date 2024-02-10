import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React, { ReactNode } from 'react';
import { commonStyles } from '../../utils';

const styles = StyleSheet.create({
    ...commonStyles,
    equipmentListSection: {
        padding: 5,
        flexDirection: 'column',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        width: '100%',
        borderBottom: '1px solid #DDDDDD',
        paddingBottom: 5,
        paddingTop: 5,
    },
    tableRowWithTopBorder: {
        flexDirection: 'row',
        width: '100%',
        borderTop: '1px solid #DDDDDD',
        paddingBottom: 5,
        paddingTop: 5,
    },
    tableRowWithNoBorder: {
        flexDirection: 'row',
        width: '100%',
        paddingBottom: 5,
        paddingTop: 0,
    },
    tableRowCompact: {
        paddingBottom: 2,
        paddingTop: 2,
        fontSize: 7,
    },
    tableRowWithTopBorderCompact: {
        paddingBottom: 2,
        paddingTop: 2,
        fontSize: 7,
    },
    tableRowWithNoBorderCompact: {
        paddingBottom: 2,
        fontSize: 7,
    },
});

type RowProps = {
    children?: ReactNode;
};
export const Row: React.FC<RowProps> = ({ children }: RowProps) => <View style={styles.row}>{children}</View>;

type ColProps = {
    children?: ReactNode;
};
export const Col: React.FC<ColProps> = ({ children }: ColProps) => <View style={styles.col}>{children}</View>;

type InfoItemProps = {
    title?: string;
    content?: string;
};
export const InfoItem: React.FC<InfoItemProps> = ({ title, content }: InfoItemProps) => (
    <View style={[styles.marginBottom, { flexDirection: 'row' }]}>
        <View style={[styles.flexGrow, { flex: '0 0 70' }]}>
            <Text>{title}:</Text>
        </View>
        <View style={styles.flexGrow}>
            <Text style={styles.bold}>{content}</Text>
        </View>
    </View>
);

type TableRowProps = {
    children?: ReactNode;
    compact?: boolean;
};
export const TableRow: React.FC<TableRowProps> = ({ children, compact = false }: TableRowProps) => (
    <View
        style={{
            ...styles.tableRow,
            ...(compact ? styles.tableRowCompact : {}),
        }}
    >
        {children}
    </View>
);

type TableRowWithTopBorderProps = {
    children?: ReactNode;
    compact?: boolean;
};
export const TableRowWithTopBorder: React.FC<TableRowWithTopBorderProps> = ({
    children,
    compact = false,
}: TableRowWithTopBorderProps) => (
    <View
        style={{
            ...styles.tableRowWithTopBorder,
            ...(compact ? styles.tableRowWithTopBorderCompact : {}),
        }}
    >
        {children}
    </View>
);

type TableRowWithNoBorderProps = {
    children?: ReactNode;
    compact?: boolean;
};
export const TableRowWithNoBorder: React.FC<TableRowWithNoBorderProps> = ({
    children,
    compact = false,
}: TableRowWithNoBorderProps) => (
    <View
        style={{
            ...styles.tableRowWithNoBorder,
            ...(compact ? styles.tableRowWithNoBorderCompact : {}),
        }}
    >
        {children}
    </View>
);

type TableCellFixedWidthProps = {
    children?: ReactNode;
    width: number;
    textAlign?: 'left' | 'right' | 'center' | 'justify' | undefined;
};
export const TableCellFixedWidth: React.FC<TableCellFixedWidthProps> = ({
    children,
    width,
    textAlign = 'left',
}: TableCellFixedWidthProps) => <View style={[{ flex: '0 0 ' + width, textAlign: textAlign }]}>{children}</View>;

type TableCellAutoWidthProps = {
    children?: ReactNode;
    textAlign?: 'left' | 'right' | 'center' | 'justify' | undefined;
    paddingLeft?: string;
};
export const TableCellAutoWidth: React.FC<TableCellAutoWidthProps> = ({
    children,
    textAlign = 'left',
    paddingLeft = '0px',
}: TableCellAutoWidthProps) => <View style={[styles.flexGrow, { textAlign, paddingLeft }]}>{children}</View>;
