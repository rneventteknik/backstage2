import React from 'react';
import { Language } from '../models/enums/Language';
import EquipmentSearch, { ResultType, SearchResultViewModel } from './EquipmentSearch';
import { Equipment } from '../models/interfaces';
import useSwr from 'swr';
import { getResponseContentOrError } from '../lib/utils';
import { equipmentsFetcher } from '../lib/fetchers';
import { SVD } from 'svd-js';
import Skeleton from 'react-loading-skeleton';
import { BookingType } from '../models/enums/BookingType';

type Props = {
    id: string;
    placeholder?: string;
    includePackages?: boolean;
    includeTags?: boolean;
    language?: Language;
    onSelect?: (selected: SearchResultViewModel) => unknown;
    onFocus?: () => unknown;
    onBlur?: () => unknown;
    equipment: Equipment[];
    bookingType: BookingType;
};

const fetchAndCalculateSimilarityMatrix = (url: string) =>
    fetch(url)
        .then((response) => getResponseContentOrError<number[][]>(response))
        .then((data) => calculateEquipmentMatrix(data))
        .then(({ equipmentMatrix, equipmentIdToColumnMapping, columnToEquipmenIdMapping }) => ({
            similarityMatrix: calculateSimilarityMatrix(equipmentMatrix),
            equipmentIdToColumnMapping,
            columnToEquipmenIdMapping,
        }));

const EquipmentSearchWithAI: React.FC<Props> = ({ equipment, bookingType, ...rest }: Props) => {
    const similarityMatrixUrl = `/api/equipment-ids-per-booking-for-svd/${bookingType === BookingType.RENTAL ? 'rental' : 'gig'}`;
    const { data, error } = useSwr(similarityMatrixUrl, fetchAndCalculateSimilarityMatrix, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    const { data: equipmentData } = useSwr('/api/equipment', equipmentsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    if (error) {
        return <EquipmentSearch defaultResults={[]} {...rest} />
    }

    if (!data || !equipmentData) {
        return <Skeleton height={30} />;
    }

    const currentEquipmentMatrixRow = getEquipmentMatrixRowForEquipment(equipment, data.equipmentIdToColumnMapping);
    const recommended = getRecommendedEquipment(currentEquipmentMatrixRow, data.similarityMatrix);
    const recommendedEquipment = getEquipmentFromRecommendedEquipment(
        recommended,
        data.columnToEquipmenIdMapping,
        equipmentData,
    );

    const defaultResults: SearchResultViewModel[] = recommendedEquipment
        .filter((x) => x.score > 0.1)
        .slice(0, 8)
        .map((x) => ({
            type: ResultType.EQUIPMENT,
            aiSuggestion: true,
            url: '',
            ...x,
        }));

    return (
        <EquipmentSearch defaultResults={defaultResults} {...rest} />
    );
};

const calculateEquipmentMatrix = (
    bookingEquipmentSets: number[][],
): {
    equipmentMatrix: number[][];
    equipmentIdToColumnMapping: Record<number, number>;
    columnToEquipmenIdMapping: Record<number, number>;
} => {
    const equipmentIdToColumnMapping: Record<number, number> = {};
    const columnToEquipmenIdMapping: Record<number, number> = {};

    const uniqueEquipmentIds = [...new Set(bookingEquipmentSets.flatMap((x) => x))];

    uniqueEquipmentIds.forEach((equipmentId, index) => {
        equipmentIdToColumnMapping[equipmentId] = index;
        columnToEquipmenIdMapping[index] = equipmentId;
    });

    const equipmentMatrix = Array.from({ length: bookingEquipmentSets.length }, () =>
        Array(Object.keys(uniqueEquipmentIds).length).fill(0),
    );

    bookingEquipmentSets.forEach((equipmentIds, index) => {
        equipmentIds.forEach((equipmentId) => {
            const equipmentIndex = equipmentIdToColumnMapping[equipmentId];

            equipmentMatrix[index][equipmentIndex] = 1;
        });
    });

    return { equipmentMatrix, equipmentIdToColumnMapping, columnToEquipmenIdMapping };
};

const calculateSimilarityMatrix = (equipmentMatrix: number[][]) => {
    const { v, q } = SVD(equipmentMatrix, true, true);

    const k = 150;
    const Vk = v.map((row) => row.slice(0, k));
    const Sk = q.slice(0, k);

    // Equipment similarity matrix = V * S * V^T
    const similarityMatrix = Vk.map((rowI) =>
        Vk.map((_, j) => rowI.reduce((sum, val, f) => sum + val * Sk[f] * Vk[j][f], 0)),
    );

    return similarityMatrix;
};

const getEquipmentMatrixRowForEquipment = (
    equipments: Equipment[],
    equipmentIdToColumnMapping: Record<number, number>,
) => {
    const equipmentMatrixRow = Array.from({ length: Object.keys(equipmentIdToColumnMapping).length }, () => 0);

    equipments.forEach((equipment) => {
        const index = equipmentIdToColumnMapping[equipment.id];

        if (index !== undefined) {
            equipmentMatrixRow[index] = 1;
        }
    });

    return equipmentMatrixRow;
};

const getRecommendedEquipment = (currentEquipmentMatrixRow: number[], similarityMatrix: number[][]) => {
    // Compute scores for all equipment:
    const scores = similarityMatrix.map((_, equipIdx) =>
        currentEquipmentMatrixRow.reduce((sum, used, idx) => sum + used * similarityMatrix[equipIdx][idx], 0),
    );

    // Mask out already-used equipment:
    const recommended = scores
        .map((score, idx) => ({ idx, score }))
        .filter((item) => currentEquipmentMatrixRow[item.idx] === 0)
        .sort((a, b) => b.score - a.score);

    return recommended;
};

const getEquipmentFromRecommendedEquipment = (
    recommended: { idx: number; score: number }[],
    columnToEquipmenIdMapping: Record<number, number>,
    equipmentData: Equipment[],
): (Equipment & { score: number })[] => {
    return recommended.map((recommendation) => {
        const equipmentId = columnToEquipmenIdMapping[recommendation.idx];
        const equipment = equipmentData.find((eq: Equipment) => eq.id === equipmentId)!;
        return {
            ...equipment,
            score: recommendation.score,
        };
    });
};

export default EquipmentSearchWithAI;
