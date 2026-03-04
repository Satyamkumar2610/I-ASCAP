export interface EfficiencyResult {
    efficiency_score: number;
    potential_yield: number;
    district_yield: number;
    yield_gap_pct: number;
    percentile_rank: number;
}

export interface HistoricalEfficiencyResult {
    efficiency_ratio: number;
    current_yield: number;
    historical_mean: number;
    yield_diff: number;
    is_above_trend: boolean;
}

export interface EfficiencyData {
    relative_efficiency: EfficiencyResult;
    historical_efficiency: HistoricalEfficiencyResult;
}

export interface RiskProfile {
    risk_category: string;
    volatility_score: number;
    trend_stability: string;
    reliability_rating: string;
}

export interface ResilienceIndex {
    resilience_score: number;
    volatility_component: number;
    retention_component: number;
    drought_risk: string;
    reliability_rating: string;
}

export interface GrowthMatrix {
    cagr_5y: number;
    mean_yield_5y: number;
    matrix_quadrant: string;
    trend_direction: string;
    cagr_historical?: number;
    formula?: string;
}

export interface RiskData {
    risk_profile: RiskProfile;
    resilience_index: ResilienceIndex;
    growth_matrix: GrowthMatrix;
}

export interface DiversificationData {
    cdi: number;
    interpretation: string;
    dominant_crop: string;
    dominant_share: number;
    crop_count: number;
    breakdown: Record<string, number>;
}

export interface CorrelationData {
    correlations: {
        annual_rainfall: {
            r: number;
            interpretation: string;
            direction: string;
        };
        monsoon_rainfall: {
            r: number;
            interpretation: string;
            direction: string;
        };
    };
    note: string;
    data_points: {
        district: string;
        yield: number;
        annual_rainfall: number;
        monsoon_rainfall: number;
    }[];
    validity?: {
        climate_assumption: string;
        baseline_period: string;
        warning: string;
    };
}

export interface AnalysisExportData {
    efficiency: EfficiencyData | null;
    risk: RiskData | null;
}

export interface YieldTrendData {
    cdk: string;
    crop: string;
    period: string;
    start_yield_kg_ha: number;
    end_yield_kg_ha: number;
    cagr_percent: number | null;
    volatility_percent: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    risk_assessment: 'low' | 'medium' | 'high';
}

export interface YoyGrowthData {
    cdk: string;
    crop: string;
    period: string;
    data: { year: number; yield: number; yoy_growth: number | null }[];
    summary: {
        average_yoy_growth_percent: number;
        positive_growth_years: number;
        negative_growth_years: number;
    };
}

export interface CropCorrelationData {
    state: string;
    year: number;
    crops: string[];
    correlations: Record<string, Record<string, number | null>>;
}

export interface SplitImpactData {
    before: { average: number; years: number[] };
    after: { combined_average: number; by_child: Record<string, { avg: number }> };
    impact: { percent_change: number; assessment: 'positive' | 'negative' | 'neutral' };
}
