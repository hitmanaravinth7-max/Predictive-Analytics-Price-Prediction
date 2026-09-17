# A Predictive Analytics Framework for Multi-Platform Price Prediction and Smart Online Shopping

**Final Year Engineering Capstone Project**  
*Technologies: Python, Flask, MySQL, Scikit-learn, Pandas, NumPy, HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js, Jetpack Compose (Android Companion)*

---

## 📌 Abstract
E-commerce retail platforms such as Amazon, Flipkart, Walmart, Best Buy, and eBay apply dynamic, algorithmic pricing models that cause frequent price fluctuations. Consequently, consumers struggle to know whether to make an immediate purchase or wait for a price drop.

This project introduces **SmartPrice**, an end-to-end **Predictive Analytics Framework** that aggregates cross-platform pricing data, analyzes historical trends, and executes machine learning polynomial regression to forecast future 14-day prices with 90% confidence bands. The system computes a statistical recommendation (**Strong Buy**, **Buy Now**, **Wait**, or **Strong Wait**) and enables users to establish automatic price drop alerts.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, FontAwesome 6, Chart.js |
| **Backend** | Python Flask, Werkzeug Security, REST API Endpoints |
| **Database** | MySQL (with zero-configuration SQLite fallback) |
| **Machine Learning** | Python, Scikit-learn (`PolynomialFeatures`, `LinearRegression`), Pandas, NumPy |
| **Mobile Client** | Android Jetpack Compose, Kotlin, Room Database, Material 3 |

---

## 📊 System Architecture & Machine Learning Formulation

```
[Online Platforms] ---> [Multi-Platform Data Layer] ---> [MySQL / Room DB]
(Amazon, Flipkart,         (Prices, Sellers, Ratings)             |
 Walmart, Best Buy, eBay)                                          v
                                                       [ML Predictive Engine]
                                                       (Scikit-learn Polynomial Regression)
                                                                  |
              +---------------------------------------------------+
              v                                                   v
 [14-Day Price Forecast Curve]                       [Buy Now or Wait Decision Rule]
     y(t) = β₀ + β₁t + β₂t² + ε                        - Volatility Index
   90% Confidence Interval Band                         - Expected Savings %
              |                                                   |
              +---------------------------------------------------+
                                          v
                              [Web Dashboard & Android App]
                              - Interactive Historical Line Chart
                              - Cross-Platform Comparison Table
                              - Real-Time Price Drop Alert Engine
```

### 1. Polynomial Regression Model
$$y(t) = \beta_0 + \beta_1 t + \beta_2 t^2 + \varepsilon$$
- $t$: Time offset in days relative to today ($t=0$).
- $\beta_0, \beta_1, \beta_2$: Ordinary Least Squares (OLS) regression parameters.
- $\varepsilon \sim \mathcal{N}(0, \sigma^2)$: Residual error modeling price volatility.

### 2. Expanding 90% Confidence Interval
$$\text{CI}_{90\%} = \hat{y}(t) \pm 1.645 \cdot S_e \cdot \sqrt{1 + h(t)}$$
Where $S_e$ is the residual standard error and $h(t) = 1 + 0.08 \cdot t$ represents horizon variance expansion.

---

## 🚀 Quick Setup & Run Instructions (Web Application)

### Prerequisites
- Python 3.9+ installed
- MySQL Server (Optional: if MySQL is not installed, the application automatically boots in SQLite mode without any manual configuration!)

### Step 1: Install Dependencies
```bash
cd predictive_price_analytics_framework
pip install -r requirements.txt
```

### Step 2: (Optional) Set Up MySQL Database
If using MySQL:
```bash
mysql -u root -p < database/schema.sql
```
Set your environment variables (or leave default for local root):
```bash
export DB_HOST="localhost"
export DB_USER="root"
export DB_PASS="your_password"
export DB_NAME="smartprice_db"
```

### Step 3: Run the Application
```bash
python app.py
```
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 📱 Android Native Companion Application
This repository also contains the complete, production-ready Android companion application built with:
- **Kotlin & Jetpack Compose (Material 3)**
- **Room Database** with pre-seeded products, platforms, and price history
- **Offline ML Predictive Engine** mirroring the Scikit-learn polynomial regression logic
- **Interactive Canvas Charts** for price history and confidence forecast bands
- **Price Alert Simulation Engine** for live demonstrations

To run the Android app, build via Android Studio or run Gradle:
```bash
gradle assembleDebug
```

---

## 🎯 Project Features Checklist

- [x] **User Authentication**: Secure registration and sign-in with password hashing.
- [x] **Multi-Platform Price Comparison**: Side-by-side comparison across Amazon, Flipkart, Walmart, Best Buy, and eBay.
- [x] **Historical Price Analysis**: 60-day interactive time-series charts.
- [x] **Future Price Prediction**: 14-day polynomial regression forecasts with 90% confidence bands.
- [x] **Buy Now or Wait Advice**: Statistical decision engine outputting clear recommendation badges and rationale.
- [x] **Price Drop Alert Engine**: Custom target price thresholds with testing trigger simulations.
- [x] **Responsive Dashboard**: Metrics, top drop opportunities, and inventory explorer.
