import { View, StyleSheet } from '@react-pdf/renderer';
import React, { ReactNode } from 'react';
import { commonStyles } from '../../utils';

const styles = StyleSheet.create({
    ...commonStyles,
    mainContent: {
        padding: 10,
        flexGrow: 1,
    },
});

type Props = {
    children?: ReactNode;
};
export const MainContent: React.FC<Props> = ({ children }: Props) => <View style={styles.mainContent}>{children}</View>;
