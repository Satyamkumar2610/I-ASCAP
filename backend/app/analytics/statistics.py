"""
Statistics Module: Pure deterministic statistical calculations.
No side effects, no data access - just math.
"""
import math
from typing import List, Tuple, Optional


def calculate_mean(values: List[float]) -> float:
    """
    Calculate arithmetic mean.
    
    Args:
        values: List of numeric values
        
    Returns:
        Mean value, or 0 if empty list
    """
    if not values:
        return 0.0
    return sum(values) / len(values)


def calculate_variance(values: List[float], population: bool = True) -> float:
    """
    Calculate variance.
    
    Args:
        values: List of numeric values
        population: If True, use population variance (N); else sample variance (N-1)
        
    Returns:
        Variance value
    """
    if len(values) < 2:
        return 0.0
    
    mean = calculate_mean(values)
    squared_diffs = [(x - mean) ** 2 for x in values]
    
    divisor = len(values) if population else (len(values) - 1)
    return sum(squared_diffs) / divisor


def calculate_std_dev(values: List[float], population: bool = True) -> float:
    """Calculate standard deviation."""
    return math.sqrt(calculate_variance(values, population))


def calculate_cv(values: List[float]) -> float:
    """
    Calculate Coefficient of Variation (CV).
    CV = (std_dev / mean) * 100
    
    Measures relative variability as a percentage.
    Lower CV = more stable; Higher CV = more volatile.
    
    Args:
        values: List of numeric values
        
    Returns:
        CV as percentage (0-100+)
    """
    if not values or len(values) < 2:
        return 0.0
    
    mean = calculate_mean(values)
    if mean == 0:
        return 0.0
    
    std_dev = calculate_std_dev(values, population=True)
    return (std_dev / abs(mean)) * 100


def calculate_cagr(
    start_value: float, 
    end_value: float, 
    years: int
) -> float:
    """
    Calculate Compound Annual Growth Rate (CAGR).
    CAGR = (end/start)^(1/years) - 1
    
    Args:
        start_value: Initial value
        end_value: Final value
        years: Number of years between measurements
        
    Returns:
        CAGR as percentage
    """
    if start_value <= 0 or years < 1:
        return 0.0
    
    if end_value <= 0:
        return -100.0  # Complete decline
    
    ratio = end_value / start_value
    cagr = (ratio ** (1 / years)) - 1
    return cagr * 100


def calculate_cagr_from_series(values: List[float]) -> float:
    """
    Calculate CAGR from a time series.
    Uses first and last non-zero values.
    
    Args:
        values: Ordered time series values
        
    Returns:
        CAGR as percentage
    """
    if len(values) < 2:
        return 0.0
    
    # Find first and last non-zero values
    start_val = values[0]
    end_val = values[-1]
    years = len(values) - 1
    
    return calculate_cagr(start_val, end_val, years)


def detect_trend(values: List[float]) -> Tuple[str, float]:
    """
    Simple linear trend detection using least squares.
    
    Args:
        values: Time series values (assumed equal spacing)
        
    Returns:
        Tuple of (trend_direction, slope)
        trend_direction: "increasing", "decreasing", or "stable"
    """
    if len(values) < 3:
        return ("stable", 0.0)
    
    n = len(values)
    x = list(range(n))
    
    # Calculate slope using least squares
    x_mean = sum(x) / n
    y_mean = sum(values) / n
    
    numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
    
    if denominator == 0:
        return ("stable", 0.0)
    
    slope = numerator / denominator
    
    # Classify trend based on slope magnitude relative to mean
    relative_slope = slope / abs(y_mean) if y_mean != 0 else 0
    
    if relative_slope > 0.01:
        return ("increasing", slope)
    elif relative_slope < -0.01:
        return ("decreasing", slope)
    else:
        return ("stable", slope)


def calculate_period_stats(values: List[float]) -> dict:
    """
    Calculate comprehensive statistics for a period.
    
    Returns dict with: mean, variance, cv, cagr, n_observations
    """
    if not values:
        return {
            "mean": 0,
            "variance": 0,
            "cv": 0,
            "cagr": 0,
            "n_observations": 0,
        }
    
    return {
        "mean": calculate_mean(values),
        "variance": calculate_variance(values),
        "cv": calculate_cv(values),
        "cagr": calculate_cagr_from_series(values),
        "n_observations": len(values),
    }
