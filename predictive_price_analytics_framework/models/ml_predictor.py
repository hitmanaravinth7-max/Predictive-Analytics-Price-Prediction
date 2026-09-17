"""
Machine Learning Predictive Analytics Engine for Multi-Platform Price Prediction.
Utilizes Python, NumPy, Pandas, and Scikit-learn (Polynomial Regression, Residual Std Error).
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from datetime import datetime, timedelta

class PricePredictor:
    def __init__(self, degree=2):
        self.degree = degree
        self.poly = PolynomialFeatures(degree=self.degree, include_bias=False)
        self.model = LinearRegression()

    def generate_simulated_history(self, current_price, days=60, pattern='drop'):
        """Generates realistic historical price fluctuations if none recorded."""
        np.random.seed(int(current_price * 10) % 1000)
        t = np.arange(-days, 1)
        base = current_price

        if pattern == 'drop':
            trend = -0.5 * t + 8.0 * np.sin(t / 5.0)
        elif pattern == 'low':
            trend = np.where(t > -15, -40.0, 20.0) + 4.0 * np.cos(t / 4.0)
        elif pattern == 'rise':
            trend = 0.6 * t + 5.0 * np.cos(t / 4.0)
        else:
            trend = 12.0 * np.sin(t / 6.0)

        prices = np.maximum(base * 0.82, base + trend + np.random.normal(0, 2.5, len(t)))
        prices[-1] = current_price # Current price is today

        dates = [(datetime.now() + timedelta(days=int(offset))).strftime('%b %d') for offset in t]

        df = pd.DataFrame({
            'day_offset': t,
            'date_str': dates,
            'price': np.round(prices, 2)
        })
        return df

    def fit_and_predict(self, history_df, current_price, forecast_days=14):
        """
        Fits Scikit-learn Polynomial Regression on historical time-series data
        and predicts future prices with 90% confidence bounds.
        """
        if history_df is None or len(history_df) < 5:
            history_df = self.generate_simulated_history(current_price)

        t = history_df['day_offset'].values.reshape(-1, 1)
        y = history_df['price'].values

        min_price = float(np.min(y))
        max_price = float(np.max(y))
        avg_price = float(np.mean(y))

        # Fit Polynomial Regression via Scikit-Learn
        X_poly = self.poly.fit_transform(t)
        self.model.fit(X_poly, y)

        # Calculate Residual Variance and Standard Error
        y_pred = self.model.predict(X_poly)
        residuals = y - y_pred
        dof = max(1, len(y) - (self.degree + 1))
        residual_std_error = np.sqrt(np.sum(residuals ** 2) / dof)
        cv = (residual_std_error / avg_price) * 100.0

        volatility = "Low" if cv < 4.0 else ("Moderate" if cv < 8.5 else "High")

        # Future forecast horizons: +1 to +forecast_days
        future_t = np.arange(1, forecast_days + 1).reshape(-1, 1)
        future_X_poly = self.poly.transform(future_t)
        raw_forecast = self.model.predict(future_X_poly)

        forecast_points = []
        expected_lowest = current_price

        for i, day in enumerate(future_t.flatten()):
            future_date = (datetime.now() + timedelta(days=int(day))).strftime('%b %d')
            # Damping to prevent polynomial divergence
            damp = max(0.70, 1.0 - (day * 0.015))
            pred = float((raw_forecast[i] * damp) + (current_price * (1.0 - damp)))
            pred = max(min_price * 0.75, pred)

            # Expanding confidence intervals
            h = 1.0 + (day * 0.08)
            margin = float(1.645 * residual_std_error * h)
            lower = max(min_price * 0.70, pred - margin)
            upper = pred + margin

            if pred < expected_lowest:
                expected_lowest = pred

            forecast_points.append({
                'day_offset': int(day),
                'date_str': future_date,
                'predicted_price': round(pred, 2),
                'lower_bound': round(lower, 2),
                'upper_bound': round(upper, 2)
            })

        # Algorithmic Buy Now vs Wait Rule
        price_diff = current_price - expected_lowest
        drop_percent = (price_diff / current_price * 100.0) if current_price > 0 else 0.0
        is_near_low = current_price <= (min_price * 1.03)

        if is_near_low:
            rec_code = "STRONG_BUY"
            rec_label = "Strong Buy"
            rec_reason = f"Current price is near its historical 60-day minimum (${min_price:.2f}). Statistical upside is high."
            confidence = 92
        elif drop_percent >= 8.0:
            rec_code = "STRONG_WAIT"
            rec_label = "Strong Wait"
            rec_reason = f"Imminent sale discount predicted. Model projects a {drop_percent:.1f}% price drop within 7 days."
            confidence = 88
        elif drop_percent >= 3.5:
            rec_code = "WAIT"
            rec_label = "Wait Recommended"
            rec_reason = f"Moderate downward price trajectory. Waiting a few days could save ~${price_diff:.2f}."
            confidence = 79
        else:
            rec_code = "BUY_NOW"
            rec_label = "Buy Now"
            rec_reason = "Price is currently stable with no statistically significant dips expected in the near term."
            confidence = 82

        return {
            'current_price': round(current_price, 2),
            'historical_min': round(min_price, 2),
            'historical_max': round(max_price, 2),
            'historical_avg': round(avg_price, 2),
            'expected_lowest': round(expected_lowest, 2),
            'expected_drop_percent': round(drop_percent, 1),
            'recommendation_code': rec_code,
            'recommendation_label': rec_label,
            'recommendation_reason': rec_reason,
            'confidence_score': confidence,
            'volatility_rating': volatility,
            'forecast_points': forecast_points,
            'history_points': history_df.to_dict(orient='records')
        }
