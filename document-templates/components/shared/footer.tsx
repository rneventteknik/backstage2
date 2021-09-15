import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { useTextResources } from '../../useTextResources';
import { commonStyles } from '../../utils';

const styles = StyleSheet.create({
    ...commonStyles,
    footer: {
        padding: 10,
        borderTop: '1px solid black',
        textAlign: 'center',
        color: 'grey',
        fontSize: 6,
    },
});

export const Footer: React.FC = () => {
    const { t } = useTextResources();

    return (
        <View style={styles.footer}>
            <Text style={styles.bold}>{t('common.footer.title')}</Text>
            <Text>{t('common.footer.content')}</Text>
        </View>
    );
};
