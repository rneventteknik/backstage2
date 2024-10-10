import { Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { useTextResources } from '../../useTextResources';

const styles = StyleSheet.create({
    ...commonStyles,
});

type Props = {
    list: EquipmentList;
};
export const EquipmentListDiscountInfo: React.FC<Props> = ({ list }: Props) => {
    const { t } = useTextResources();

    if (list.discountPercentage === 0) {
        return null;
    }

    return (
        <Text style={styles.italic}>
            {t('common.equipment-list.discountPercentage')}: {list.discountPercentage}%
        </Text>
    );
};
