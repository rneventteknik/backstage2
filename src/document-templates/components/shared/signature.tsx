import { View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { commonStyles } from '../../utils';

const styles = StyleSheet.create({
    ...commonStyles,
    signature: {
        borderBottom: '1px solid #DDDDDD',
        paddingBottom: '20px',
    },
});

type Props = {
    label: string;
    light?: boolean;
};
export const Signature: React.FC<Props> = ({ label, light }: Props) => {
    return (
        <View style={[styles.signature, styles.marginBottomLarge, styles.marginTopLarge]}>
            <Text style={light ? [styles.italic, { color: 'grey' }] : []}>{label}</Text>
        </View>
    );
};
