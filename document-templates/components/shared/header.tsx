import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';

const styles = StyleSheet.create({
    ...commonStyles,
    header: {
        padding: 5,
        marginTop: 5,
        borderBottom: '1px solid black',
        fontSize: 12,
        fontFamily: 'Open Sans',
        flexDirection: 'row',
    },
    title: {
        flexGrow: 1,
        fontWeight: 'bold',
    },
    aside: {
        fontWeight: 'light',
    },
});

type Props = {
    title: string;
    documentId: string;
};
export const Header: React.FC<Props> = ({ title, documentId }: Props) => (
    <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.aside}>{documentId}</Text>
    </View>
);
