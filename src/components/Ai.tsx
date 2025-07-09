import React, { useState } from 'react';
import useSwr from 'swr';
import { getResponseContentOrError } from '../lib/utils';
import { SVD } from 'svd-js';
import { Form, Table } from 'react-bootstrap';
import { Equipment } from '../models/interfaces';
import { ResultTypeForAi } from '../pages/api/ai';
import { equipmentsFetcher } from '../lib/fetchers';

const fetcher = (url: string) => fetch(url).then((response) => getResponseContentOrError<ResultTypeForAi>(response));

type Props = {
    equipment: Equipment[];
};

export const Ai: React.FC<Props> = ({ equipment }: Props) => {
    const { data, error } = useSwr('/api/ai', fetcher);
    const { data: equipmentData } = useSwr('/api/equipment', equipmentsFetcher);
    const [text, setText] = useState('');

    if (error) {
        return 'ERROR';
    }

    if (!data || !equipmentData) {
        return 'LOADING';
    }

    const { v, q } = SVD(data.matrix, true, true);

    const k = 150;
    const Vk = v.map((row) => row.slice(0, k)); // equipment factors
    const Sk = q.slice(0, k);

    // Equipment similarity matrix = V * S * V^T
    const similarityMatrix = Vk.map((rowI) =>
        Vk.map((rowJ, j) => rowI.reduce((sum, val, f) => sum + val * Sk[f] * Vk[j][f], 0)),
    );

    const equipments = Array.from({ length: Object.keys(data.columnToEquipmenIdMapping).length }, () => 0);

    // If equipment array contains equipment, set the index from mapping to 1
    equipment.forEach((eq) => {
        const index = data.equipmentIdToColumnMapping[eq.id];
        if (index !== undefined) {
            equipments[index] = 1;
        }
    });

    const getRecommendedEquipment = (currentBookingEquipment: number[]) => {
        // Compute scores for all equipment:
        const scores = similarityMatrix.map((_, equipIdx) =>
            currentBookingEquipment.reduce((sum, used, idx) => sum + used * similarityMatrix[equipIdx][idx], 0),
        );

        // Mask out already-used equipment:
        const recommended = scores
            .map((score, idx) => ({ idx, score }))
            .filter((item) => currentBookingEquipment[item.idx] === 0)
            .sort((a, b) => b.score - a.score);

        // console.log(recommended); // List of recommended equipment (by index)

        return recommended;
    };

    const getEquipmentFromRecommendedEquipment = (
        recommended: { idx: number; score: number }[],
    ): (Equipment & { score: number })[] => {
        return recommended.map((recommendation) => {
            const equipmentId = data.columnToEquipmenIdMapping[recommendation.idx];
            const equipment = equipmentData.find((eq: Equipment) => eq.id === equipmentId)!;
            return {
                ...equipment,
                score: recommendation.score,
            };
        });
    };

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
                    {getEquipmentFromRecommendedEquipment(getRecommendedEquipment(equipments))
                        .sort((a, b) => b.score - a.score) // Ensure sorting by score
                        .map((x, index) => (
                            <tr key={index}>
                                <td>{x.name}</td>
                                <td>{x.score.toFixed(2)}</td>
                            </tr>
                        ))}
                </tbody>
            </Table>

            {/* {JSON.stringify(u)}
            {JSON.stringify(v)}
            {JSON.stringify(q)} */}
        </div>
    );
};
