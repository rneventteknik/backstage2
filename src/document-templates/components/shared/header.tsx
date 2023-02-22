import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import React from 'react';
import { getGlobalSetting } from '../../../lib/utils';
import { KeyValue } from '../../../models/interfaces/KeyValue';
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
        alignItems: 'center',
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
    image: {
        height: '20pt',
    },
});

type Props = {
    title: string;
    subTitle: string;
    globalSettings: KeyValue[];
};
export const Header: React.FC<Props> = ({ title, subTitle, globalSettings }: Props) => (
    <View style={styles.header}>
        <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subTitle}>{subTitle}</Text>
        </View>
        <Text style={styles.aside}></Text>
        <Image style={styles.image} src={getGlobalSetting('content.image.documentHeaderImage', globalSettings, '')} />
    </View>
);
