import React from 'react';
import useSwr from 'swr';
import { getResponseContentOrError } from '../lib/utils';
import { SVD } from 'svd-js';
import { Table } from 'react-bootstrap';
import { Equipment } from '../models/interfaces';
import { equipmentsFetcher } from '../lib/fetchers';

const fetchAndCalculateSimilarityMatrix = (url: string) =>
    fetch(url)
        .then((response) => getResponseContentOrError<number[][]>(response))
        .then((data) => calculateEquipmentMatrix(data))
        .then(({ equipmentMatrix, equipmentIdToColumnMapping, columnToEquipmenIdMapping }) => ({
            similarityMatrix: calculateSimilarityMatrix(equipmentMatrix),
            equipmentIdToColumnMapping,
            columnToEquipmenIdMapping,
        }));

type Props = {
    equipment: Equipment[];
};

export const Ai: React.FC<Props> = ({ equipment }: Props) => {
    const { data, error } = useSwr('/api/ai', fetchAndCalculateSimilarityMatrix, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    const { data: equipmentData } = useSwr('/api/equipment', equipmentsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    if (error) {
        return 'ERROR';
    }

    if (!data || !equipmentData) {
        return 'LOADING';
    }

    const currentEquipmentMatrixRow = getEquipmentMatrixRowForEquipment(equipment, data.equipmentIdToColumnMapping);
    const recommended = getRecommendedEquipment(currentEquipmentMatrixRow, data.similarityMatrix);
    const recommendedEquipment = getEquipmentFromRecommendedEquipment(
        recommended,
        data.columnToEquipmenIdMapping,
        equipmentData,
    );

    return (
        <div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>AI Equipment Recommendations</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {recommendedEquipment
                        .sort((a, b) => b.score - a.score) // Ensure sorting by score
                        .map((x, index) => (
                            <tr key={index}>
                                <td>{x.name}</td>
                                <td>{x.score.toFixed(2)}</td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </div>
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
        Vk.map((rowJ, j) => rowI.reduce((sum, val, f) => sum + val * Sk[f] * Vk[j][f], 0)),
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
