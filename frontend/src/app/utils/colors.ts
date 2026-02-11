export const AGRI_COLORS = ['#d1fae5', '#6ee7b7', '#10b981', '#059669', '#047857'];
export const RAINFALL_COLORS = ['#dbeafe', '#93c5fd', '#60a5fa', '#2563eb', '#1e40af'];

export const getAgriColor = (value: number, min: number, max: number) => {
    if (value <= 0) return '#1f2937'; // Gray for 0
    const ratio = (value - min) / (max - min || 1);
    if (ratio < 0.2) return AGRI_COLORS[0];
    if (ratio < 0.4) return AGRI_COLORS[1];
    if (ratio < 0.6) return AGRI_COLORS[2];
    if (ratio < 0.8) return AGRI_COLORS[3];
    return AGRI_COLORS[4];
};

export const getRainfallColor = (value: number, min: number, max: number) => {
    if (value <= 0) return '#1f2937'; // Gray for 0
    const ratio = (value - min) / (max - min || 1);
    if (ratio < 0.2) return RAINFALL_COLORS[0];
    if (ratio < 0.4) return RAINFALL_COLORS[1];
    if (ratio < 0.6) return RAINFALL_COLORS[2];
    if (ratio < 0.8) return RAINFALL_COLORS[3];
    return RAINFALL_COLORS[4];
};
