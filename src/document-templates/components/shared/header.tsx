import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';

const styles = StyleSheet.create({
    ...commonStyles,
    header: {
        padding: 5,
        marginTop: 5,
        borderBottom: '1px solid black',
        fontSize: 14,
        fontFamily: 'Open Sans',
        flexDirection: 'row',
    },
    titleContainer: {
        flexGrow: 1,
        marginBottom: 3,
    },
    title: {
        fontWeight: 'bold',
    },
    subTitle: {
        fontWeight: 'light',
    },
    aside: {
        fontWeight: 'light',
    },
});

type Props = {
    title: string;
    subTitle: string;
};
export const Header: React.FC<Props> = ({ title, subTitle }: Props) => (
    <View style={styles.header}>
        <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subTitle}>{subTitle}</Text>
        </View>
        <Text style={styles.aside}></Text>
    </View>
);
