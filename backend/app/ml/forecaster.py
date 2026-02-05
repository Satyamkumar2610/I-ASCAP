"""
Yield Forecasting Module.
Provides simple time-series based yield predictions.
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
import math


@dataclass
class ForecastPoint:
    """A single forecast point with confidence interval."""
    year: int
    predicted_yield: float
    lower_bound: float
    upper_bound: float
    confidence: float  # 0-1


@dataclass
class ForecastResult:
    """Complete forecast result with model details."""
    cdk: str
    crop: str
    historical_years: int
    method: str
    trend_direction: str
    forecasts: List[ForecastPoint]
    model_stats: Dict[str, float]
    
    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        result["forecasts"] = [asdict(f) for f in self.forecasts]
        return result


class YieldForecaster:
    """
    Simple yield forecasting using linear trend extrapolation.
    
    For production use, consider:
    - ARIMA/SARIMA for seasonal patterns
    - Prophet for handling trends and holidays
    - XGBoost with climate features
    """
    
    def __init__(self):
        self.min_data_points = 5
    
    def forecast(
        self,
        cdk: str,
        crop: str,
        historical_yields: Dict[int, float],
        horizon_years: int = 3,
        confidence_level: float = 0.95
    ) -> Optional[ForecastResult]:
        """
        Generate yield forecasts based on historical data.
        
        Args:
            cdk: District CDK
            crop: Crop name
            historical_yields: Dict of year -> yield (kg/ha)
            horizon_years: Number of years to forecast
            confidence_level: Confidence interval level
            
        Returns:
            ForecastResult with predictions and confidence intervals
        """
        # Filter valid data
        valid_data = {y: v for y, v in historical_yields.items() if v and v > 0}
        
        if len(valid_data) < self.min_data_points:
            return None
        
        years = sorted(valid_data.keys())
        yields = [valid_data[y] for y in years]
        
        # Fit linear trend
        n = len(years)
        x_mean = sum(years) / n
        y_mean = sum(yields) / n
        
        # Calculate slope and intercept
        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(years, yields))
        denominator = sum((x - x_mean) ** 2 for x in years)
        
        if denominator == 0:
            slope = 0
            intercept = y_mean
        else:
            slope = numerator / denominator
            intercept = y_mean - slope * x_mean
        
        # Calculate residuals for confidence interval
        predictions = [slope * x + intercept for x in years]
        residuals = [y - p for y, p in zip(yields, predictions)]
        
        # Standard error of prediction
        if n > 2:
            mse = sum(r ** 2 for r in residuals) / (n - 2)
            se = math.sqrt(mse)
        else:
            se = sum(abs(r) for r in residuals) / n if residuals else 0
        
        # R-squared
        ss_tot = sum((y - y_mean) ** 2 for y in yields)
        ss_res = sum(r ** 2 for r in residuals)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        # Generate forecasts
        last_year = max(years)
        forecasts = []
        
        # Z-score for confidence level (approximation for 95% = 1.96)
        z = 1.96 if confidence_level >= 0.95 else 1.645
        
        for i in range(1, horizon_years + 1):
            forecast_year = last_year + i
            predicted = slope * forecast_year + intercept
            
            # Wider interval further into future
            interval_width = z * se * math.sqrt(1 + 1/n + (forecast_year - x_mean)**2 / denominator) if denominator > 0 else z * se * (1 + 0.1 * i)
            
            # Ensure non-negative yields
            predicted = max(0, predicted)
            lower = max(0, predicted - interval_width)
            upper = predicted + interval_width
            
            # Confidence decreases with horizon
            conf = max(0.5, confidence_level - 0.05 * i)
            
            forecasts.append(ForecastPoint(
                year=forecast_year,
                predicted_yield=round(predicted, 2),
                lower_bound=round(lower, 2),
                upper_bound=round(upper, 2),
                confidence=round(conf, 2)
            ))
        
        # Determine trend direction
        if slope > 10:
            trend = "strong_increase"
        elif slope > 0:
            trend = "mild_increase"
        elif slope > -10:
            trend = "mild_decrease"
        else:
            trend = "strong_decrease"
        
        return ForecastResult(
            cdk=cdk,
            crop=crop,
            historical_years=n,
            method="linear_regression",
            trend_direction=trend,
            forecasts=forecasts,
            model_stats={
                "slope": round(slope, 4),
                "intercept": round(intercept, 2),
                "r_squared": round(r_squared, 4),
                "std_error": round(se, 2),
                "data_points": n
            }
        )


class CropRecommender:
    """
    Recommends crops based on historical performance and efficiency.
    """
    
    def __init__(self):
        self.major_crops = [
            "rice", "wheat", "maize", "sorghum", "pearl_millet",
            "chickpea", "pigeonpea", "groundnut", "soyabean",
            "sugarcane", "cotton"
        ]
    
    def recommend(
        self,
        crop_performances: Dict[str, Dict[str, float]],
        state_benchmarks: Dict[str, float],
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Recommend crops based on efficiency and growth potential.
        
        Args:
            crop_performances: Dict[crop] -> {yield, area, trend}
            state_benchmarks: Dict[crop] -> state average yield
            top_n: Number of recommendations
            
        Returns:
            List of crop recommendations with scores
        """
        recommendations = []
        
        for crop, data in crop_performances.items():
            if crop not in self.major_crops:
                continue
            
            district_yield = data.get("yield", 0)
            district_area = data.get("area", 0)
            trend = data.get("trend", 0)
            
            if district_yield <= 0:
                continue
            
            # Calculate efficiency vs state
            state_avg = state_benchmarks.get(crop, district_yield)
            efficiency = district_yield / state_avg if state_avg > 0 else 1.0
            
            # Score: efficiency + trend bonus
            score = efficiency * 0.7 + min(1.5, max(0.5, 1 + trend / 100)) * 0.3
            
            recommendations.append({
                "crop": crop,
                "score": round(score, 3),
                "efficiency": round(efficiency, 3),
                "current_yield": round(district_yield, 2),
                "state_average": round(state_avg, 2),
                "current_area": round(district_area, 2),
                "trend_pct": round(trend, 2),
                "recommendation": "expand" if score > 1.1 else "maintain" if score > 0.9 else "review"
            })
        
        # Sort by score
        recommendations.sort(key=lambda x: -x["score"])
        
        return recommendations[:top_n]
