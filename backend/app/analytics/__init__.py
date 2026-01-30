"""
Analytics module for I-ASCAP.
Provides statistical analysis, time series, and comparison tools.
"""

from app.analytics.statistics import (
    StatisticalAnalyzer,
    TrendDirection,
    TrendResult,
    StatisticResult,
    get_analyzer,
)

from app.analytics.timeseries import (
    TimeSeriesAnalyzer,
    TimeSeriesAnalysis,
    AnomalyResult,
    get_time_series_analyzer,
)

__all__ = [
    "StatisticalAnalyzer",
    "TrendDirection",
    "TrendResult",
    "StatisticResult",
    "get_analyzer",
    "TimeSeriesAnalyzer",
    "TimeSeriesAnalysis",
    "AnomalyResult",
    "get_time_series_analyzer",
]
