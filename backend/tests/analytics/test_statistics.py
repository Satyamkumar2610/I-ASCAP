"""
Tests for Analytics Engine: Statistics module.
Pure deterministic tests - no database required.
"""
import pytest
from app.analytics.statistics import (
    calculate_mean,
    calculate_variance,
    calculate_cv,
    calculate_cagr,
    calculate_cagr_from_series,
    detect_trend,
    calculate_period_stats,
)


class TestMean:
    def test_empty_list(self):
        assert calculate_mean([]) == 0.0
    
    def test_single_value(self):
        assert calculate_mean([100]) == 100.0
    
    def test_multiple_values(self):
        assert calculate_mean([100, 200, 300]) == 200.0


class TestVariance:
    def test_empty_list(self):
        assert calculate_variance([]) == 0.0
    
    def test_single_value(self):
        assert calculate_variance([100]) == 0.0
    
    def test_identical_values(self):
        assert calculate_variance([100, 100, 100]) == 0.0
    
    def test_varying_values(self):
        var = calculate_variance([10, 20, 30])
        assert var > 0


class TestCV:
    def test_empty_list(self):
        assert calculate_cv([]) == 0.0
    
    def test_identical_values(self):
        assert calculate_cv([100, 100, 100]) == 0.0
    
    def test_varying_values(self):
        cv = calculate_cv([100, 120, 110])
        assert cv > 0
        assert cv < 100  # Should be a reasonable percentage


class TestCAGR:
    def test_positive_growth(self):
        # 100 to 200 over 5 years = ~14.87% CAGR
        cagr = calculate_cagr(100, 200, 5)
        assert 14 < cagr < 15
    
    def test_no_growth(self):
        cagr = calculate_cagr(100, 100, 5)
        assert cagr == 0.0
    
    def test_negative_growth(self):
        cagr = calculate_cagr(200, 100, 5)
        assert cagr < 0
    
    def test_invalid_start(self):
        assert calculate_cagr(0, 100, 5) == 0.0
        assert calculate_cagr(-100, 200, 5) == 0.0


class TestCAGRFromSeries:
    def test_growing_series(self):
        values = [100, 110, 120, 130, 140]
        cagr = calculate_cagr_from_series(values)
        assert cagr > 0
    
    def test_declining_series(self):
        values = [140, 130, 120, 110, 100]
        cagr = calculate_cagr_from_series(values)
        assert cagr < 0


class TestTrendDetection:
    def test_increasing_trend(self):
        values = [100, 110, 120, 130, 140]
        direction, slope = detect_trend(values)
        assert direction == "increasing"
        assert slope > 0
    
    def test_decreasing_trend(self):
        values = [140, 130, 120, 110, 100]
        direction, slope = detect_trend(values)
        assert direction == "decreasing"
        assert slope < 0
    
    def test_stable_trend(self):
        values = [100, 101, 99, 100, 101]
        direction, slope = detect_trend(values)
        assert direction == "stable"


class TestPeriodStats:
    def test_comprehensive(self, sample_values):
        stats = calculate_period_stats(sample_values)
        assert "mean" in stats
        assert "variance" in stats
        assert "cv" in stats
        assert "cagr" in stats
        assert "n_observations" in stats
        assert stats["n_observations"] == len(sample_values)
