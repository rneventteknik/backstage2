import { Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { useTextResources } from '../../useTextResources';
import { commonStyles } from '../../utils';

const styles = StyleSheet.create({
    ...commonStyles,
    pageCount: {
        position: 'absolute',
        top: 15,
        right: 30,
    },
});

export const PageCount: React.FC = () => {
    const { t } = useTextResources();
    return (
        <Text
            render={({ pageNumber, totalPages }) => `${t('common.pagenumber.label')} ${pageNumber} / ${totalPages}`}
            style={styles.pageCount}
            fixed
        />
    );
};
