import { AnalysisExportData } from '../types/analysis';

export function exportToCSV(data: AnalysisExportData, filename: string) {
    if (!data) return;

    // Flatten logic depends on structure. 
    // Generic flattener or specific formatter?
    // Let's make a specific formatter for our Analytics data.

    // We expect 'data' to be an object with sections: efficiency, risk, diversification, etc.
    const rows = [];

    // Header
    rows.push(['Metric', 'Value', 'Unit', 'Details']);

    // Efficiency
    if (data.efficiency) {
        rows.push(['Relative Efficiency', (data.efficiency.relative_efficiency.efficiency_score * 100).toFixed(1), '%', 'vs State Potential']);
        rows.push(['District Yield', data.efficiency.relative_efficiency.district_yield, 'kg/ha', '']);
        rows.push(['Potential Yield', data.efficiency.relative_efficiency.potential_yield, 'kg/ha', 'Top 5% of State']);
        rows.push(['Yield Gap', data.efficiency.relative_efficiency.yield_gap_pct.toFixed(1), '%', '']);

        rows.push(['Historical Efficiency', (data.efficiency.historical_efficiency.efficiency_ratio * 100).toFixed(1), '%', 'vs 10y Mean']);
        rows.push(['Historical Mean', data.efficiency.historical_efficiency.historical_mean.toFixed(1), 'kg/ha', '']);
    }

    // Risk
    if (data.risk) {
        rows.push(['Resilience Score', (data.risk.resilience_index.resilience_score * 100).toFixed(0), 'Index', 'Reliability: ' + data.risk.resilience_index.reliability_rating]);
        rows.push(['Risk Category', data.risk.risk_profile.risk_category, '', data.risk.risk_profile.trend_stability]);
        rows.push([' volatility (CV)', data.risk.risk_profile.volatility_score.toFixed(1), '%', '']);
        rows.push(['CAGR (5y)', data.risk.growth_matrix.cagr_5y, '%', data.risk.growth_matrix.trend_direction]);
    }

    // Convert to CSV string
    const csvContent = "data:text/csv;charset=utf-8,"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
