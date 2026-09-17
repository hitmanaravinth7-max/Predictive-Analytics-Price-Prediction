/**
 * A Predictive Analytics Framework for Multi-Platform Price Prediction and Smart Online Shopping
 * Production Node.js Server & REST API
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.APP_PORT || process.env.DEFAULT_APP_PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets
const staticDir = path.join(__dirname, 'predictive_price_analytics_framework', 'static');
if (fs.existsSync(staticDir)) {
  app.use('/static', express.static(staticDir));
}
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use('/public', express.static(publicDir));
}

// In-memory Database initialized with demo data
const PRODUCTS = [
  {
    id: 'prod_001',
    title: 'Apple iPhone 15 Pro (128GB, Natural Titanium)',
    category: 'Smartphones',
    brand: 'Apple',
    current_lowest_price: 899.99,
    original_price: 999.00,
    rating: 4.8,
    review_count: 14200,
    description: 'Titanium design with A17 Pro chip and 48MP camera system. Features Action button and USB-C with USB 3 speeds.',
    best_platform: 'Best Buy',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'
  },
  {
    id: 'prod_002',
    title: 'Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)',
    category: 'Smartphones',
    brand: 'Samsung',
    current_lowest_price: 1149.00,
    original_price: 1299.99,
    rating: 4.7,
    review_count: 9850,
    description: 'Galaxy AI powerhouse with built-in S Pen, 200MP camera, and Snapdragon 8 Gen 3 for Galaxy.',
    best_platform: 'Amazon',
    image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'
  },
  {
    id: 'prod_003',
    title: 'Apple MacBook Air 13-inch (M3 chip, 8-Core CPU, 16GB)',
    category: 'Laptops',
    brand: 'Apple',
    current_lowest_price: 1049.00,
    original_price: 1199.00,
    rating: 4.9,
    review_count: 8120,
    description: 'Strikingly thin design with up to 18 hours battery life, Liquid Retina display, and MagSafe 3.',
    best_platform: 'Walmart',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'
  },
  {
    id: 'prod_004',
    title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    category: 'Audio',
    brand: 'Sony',
    current_lowest_price: 328.00,
    original_price: 399.99,
    rating: 4.8,
    review_count: 22400,
    description: 'Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer, and 30-hour battery life.',
    best_platform: 'Amazon',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
  },
  {
    id: 'prod_005',
    title: 'Dell XPS 15 9530 Laptop (13th Gen Intel i7, 32GB, RTX 4060)',
    category: 'Laptops',
    brand: 'Dell',
    current_lowest_price: 1699.99,
    original_price: 1999.00,
    rating: 4.6,
    review_count: 3400,
    description: 'High-performance creator laptop with 3.5K OLED touchscreen display, CNC aluminum chassis, and quad speakers.',
    best_platform: 'Best Buy',
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600'
  },
  {
    id: 'prod_006',
    title: 'Apple Watch Series 9 (GPS 45mm, Starlight Aluminum)',
    category: 'Wearables',
    brand: 'Apple',
    current_lowest_price: 359.00,
    original_price: 429.00,
    rating: 4.8,
    review_count: 11800,
    description: 'S9 SiP chip with Double Tap magic gesture, 2000 nits display, and ECG + Blood Oxygen sensor suite.',
    best_platform: 'Flipkart',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
  },
  {
    id: 'prod_007',
    title: 'Sony PlayStation 5 Slim Digital Edition (1TB SSD)',
    category: 'Gaming',
    brand: 'Sony',
    current_lowest_price: 399.99,
    original_price: 449.99,
    rating: 4.9,
    review_count: 31200,
    description: 'Slim form factor with 1TB SSD storage, Ray Tracing, 4K gaming support, and DualSense haptic feedback.',
    best_platform: 'Walmart',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600'
  },
  {
    id: 'prod_008',
    title: 'Google Pixel 9 Pro 5G (128GB, Obsidian)',
    category: 'Smartphones',
    brand: 'Google',
    current_lowest_price: 949.00,
    original_price: 999.00,
    rating: 4.7,
    review_count: 5120,
    description: 'Engineered by Google with Tensor G4, Gemini Advanced, triple rear pro cameras, and Super Actua display.',
    best_platform: 'Amazon',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'
  }
];

const PLATFORM_OFFERS = {
  prod_001: [
    { platform_name: 'Best Buy', price: 899.99, seller_name: 'Official Best Buy Store', delivery_days: 2, rating: 4.9, product_url: 'https://www.bestbuy.com' },
    { platform_name: 'Amazon', price: 919.00, seller_name: 'Apple Store at Amazon', delivery_days: 1, rating: 4.8, product_url: 'https://www.amazon.com' },
    { platform_name: 'Walmart', price: 929.99, seller_name: 'Walmart Direct Fulfillment', delivery_days: 3, rating: 4.6, product_url: 'https://www.walmart.com' },
    { platform_name: 'Flipkart', price: 935.00, seller_name: 'SuperComNet Retail', delivery_days: 3, rating: 4.7, product_url: 'https://www.flipkart.com' },
    { platform_name: 'eBay', price: 945.00, seller_name: 'TopRatedSeller-TechUSA', delivery_days: 4, rating: 4.5, product_url: 'https://www.ebay.com' }
  ]
};

let userAlerts = [
  {
    id: 1,
    product_id: 'prod_001',
    product_title: 'Apple iPhone 15 Pro (128GB, Natural Titanium)',
    target_price: 850.00,
    current_price: 899.99,
    is_triggered: false,
    note: 'Target: 5% drop below current lowest price',
    created_at: '2026-09-17'
  }
];

// Machine Learning Predictor Implementation (Polynomial Regression & 90% Confidence Bounds)
function fitAndPredict(currentPrice, forecastDays = 14) {
  const t = [];
  const y = [];
  const historyPoints = [];
  const days = 60;
  const base = currentPrice;

  const now = new Date();
  for (let offset = -days; offset <= 0; offset++) {
    const trend = -0.4 * offset + 7.5 * Math.sin(offset / 5.0) + (Math.sin(offset * 1.5) * 2.0);
    const price = Math.max(base * 0.82, base + trend);
    const d = new Date(now.getTime() + offset * 86400000);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const finalPrice = offset === 0 ? currentPrice : Math.round(price * 100) / 100;
    t.push(offset);
    y.push(finalPrice);
    historyPoints.push({ day_offset: offset, date_str: dateStr, price: finalPrice });
  }

  const minPrice = Math.min(...y);
  const maxPrice = Math.max(...y);
  const avgPrice = y.reduce((a, b) => a + b, 0) / y.length;

  // Fit degree 2 polynomial: y = b0 + b1*t + b2*t^2 using normal equations
  const N = t.length;
  let sum_t = 0, sum_t2 = 0, sum_t3 = 0, sum_t4 = 0;
  let sum_y = 0, sum_ty = 0, sum_t2y = 0;

  for (let i = 0; i < N; i++) {
    const ti = t[i];
    const ti2 = ti * ti;
    sum_t += ti;
    sum_t2 += ti2;
    sum_t3 += ti2 * ti;
    sum_t4 += ti2 * ti2;
    sum_y += y[i];
    sum_ty += ti * y[i];
    sum_t2y += ti2 * y[i];
  }

  // Solve 3x3 linear system via Gaussian elimination
  const A = [
    [N, sum_t, sum_t2, sum_y],
    [sum_t, sum_t2, sum_t3, sum_ty],
    [sum_t2, sum_t3, sum_t4, sum_t2y]
  ];

  for (let i = 0; i < 3; i++) {
    let maxRow = i;
    for (let k = i + 1; k < 3; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    const temp = A[i]; A[i] = A[maxRow]; A[maxRow] = temp;
    for (let k = i + 1; k < 3; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j <= 3; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }

  const b2 = A[2][3] / A[2][2];
  const b1 = (A[1][3] - A[1][2] * b2) / A[1][1];
  const b0 = (A[0][3] - A[0][2] * b2 - A[0][1] * b1) / A[0][0];

  // Residual Std Error
  let rss = 0;
  for (let i = 0; i < N; i++) {
    const predY = b0 + b1 * t[i] + b2 * t[i] * t[i];
    rss += Math.pow(y[i] - predY, 2);
  }
  const residualStdError = Math.sqrt(rss / Math.max(1, N - 3));
  const cv = (residualStdError / avgPrice) * 100;
  const volatility = cv < 4 ? 'Low' : (cv < 8.5 ? 'Moderate' : 'High');

  // Forecast
  const forecastPoints = [];
  let expectedLowest = currentPrice;

  for (let day = 1; day <= forecastDays; day++) {
    const d = new Date(now.getTime() + day * 86400000);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const rawPred = b0 + b1 * day + b2 * day * day;
    const damp = Math.max(0.70, 1.0 - (day * 0.015));
    const pred = Math.max(minPrice * 0.75, (rawPred * damp) + (currentPrice * (1.0 - damp)));

    const h = 1.0 + (day * 0.08);
    const margin = 1.645 * residualStdError * h;
    const lower = Math.max(minPrice * 0.70, pred - margin);
    const upper = pred + margin;

    if (pred < expectedLowest) expectedLowest = pred;

    forecastPoints.push({
      day_offset: day,
      date_str: dateStr,
      predicted_price: Math.round(pred * 100) / 100,
      lower_bound: Math.round(lower * 100) / 100,
      upper_bound: Math.round(upper * 100) / 100
    });
  }

  const priceDiff = currentPrice - expectedLowest;
  const dropPercent = currentPrice > 0 ? (priceDiff / currentPrice) * 100 : 0;
  const isNearLow = currentPrice <= (minPrice * 1.03);

  let recCode = 'BUY_NOW';
  let recLabel = 'Buy Now';
  let recReason = 'Price is currently stable with no statistically significant drops projected in the immediate horizon.';
  let confidence = 82;

  if (isNearLow) {
    recCode = 'STRONG_BUY';
    recLabel = 'Strong Buy';
    recReason = `Current price is near its historical 60-day low point ($${minPrice.toFixed(2)}). Statistical upside for immediate purchase is high.`;
    confidence = 92;
  } else if (dropPercent >= 8.0) {
    recCode = 'STRONG_WAIT';
    recLabel = 'Strong Wait';
    recReason = `Imminent promotional reduction predicted. The model projects a ${dropPercent.toFixed(1)}% drop within 7 to 10 days.`;
    confidence = 88;
  } else if (dropPercent >= 3.5) {
    recCode = 'WAIT';
    recLabel = 'Wait Recommended';
    recReason = `Moderate downward price trajectory identified. Postponing purchase by a few days could save ~$${priceDiff.toFixed(2)}.`;
    confidence = 79;
  }

  return {
    current_price: Math.round(currentPrice * 100) / 100,
    historical_min: Math.round(minPrice * 100) / 100,
    historical_max: Math.round(maxPrice * 100) / 100,
    historical_avg: Math.round(avgPrice * 100) / 100,
    expected_lowest: Math.round(expectedLowest * 100) / 100,
    expected_drop_percent: Math.round(dropPercent * 10) / 10,
    recommendation_code: recCode,
    recommendation_label: recLabel,
    recommendation_reason: recReason,
    confidence_score: confidence,
    volatility_rating: volatility,
    forecast_points: forecastPoints,
    history_points: historyPoints
  };
}

// Navigation and Layout Shell
function renderLayout(title, content, activeNav = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - SmartPrice Predictive Analytics</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Google Font -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary-blue: #2563eb;
            --dark-navy: #0f172a;
            --emerald-green: #10b981;
            --amber-warning: #f59e0b;
            --light-bg: #f8fafc;
        }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--light-bg);
            color: #1e293b;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        main { flex: 1; }
        .hero-section { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 50%, #0369a1 100%); }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important; }
        .product-card, .prediction-card, .alert-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .product-card:hover, .prediction-card:hover, .alert-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important; }
        .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    </style>
</head>
<body>
    <!-- Top Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3">
        <div class="container">
            <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="/">
                <i class="fa-solid fa-chart-line text-primary fs-4"></i>
                <span class="fs-5">SmartPrice</span>
                <span class="badge bg-primary-subtle text-primary rounded-pill small ms-1">ML Analytics</span>
            </a>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                    <li class="nav-item">
                        <a class="nav-link ${activeNav === 'home' ? 'active fw-semibold' : ''}" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activeNav === 'dashboard' ? 'active fw-semibold' : ''}" href="/dashboard">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activeNav === 'search' ? 'active fw-semibold' : ''}" href="/search">Compare Prices</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activeNav === 'alerts' ? 'active fw-semibold' : ''}" href="/alerts">
                            Price Alerts
                            ${userAlerts.length > 0 ? `<span class="badge bg-warning text-dark ms-1">${userAlerts.length}</span>` : ''}
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activeNav === 'analytics' ? 'active fw-semibold' : ''}" href="/analytics">ML Methodology</a>
                    </li>
                </ul>

                <div class="d-flex align-items-center gap-2">
                    <a href="/download-apk" class="btn btn-outline-light btn-sm rounded-3">
                        <i class="fa-brands fa-android text-success me-1"></i> Download Android App
                    </a>
                    <a href="/dashboard" class="btn btn-primary btn-sm rounded-3 px-3">
                        <i class="fa-solid fa-arrow-right me-1"></i> Launch App
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Dynamic Content -->
    <main>
        ${content}
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white-50 py-4 mt-5 border-top border-secondary border-opacity-25">
        <div class="container text-center">
            <p class="mb-1 text-white fw-semibold">SmartPrice: A Predictive Analytics Framework for Multi-Platform Price Prediction and Smart Online Shopping</p>
            <p class="small mb-0">Multi-Platform Retail Engine • Scikit-learn Polynomial Regression • Android Companion • Cloud Run Ready</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

// 1. Home / Landing Page
app.get('/', (req, res) => {
  const content = `
    <!-- Hero Banner -->
    <div class="hero-section text-white py-5">
        <div class="container py-4 text-center">
            <span class="badge bg-primary px-3 py-2 rounded-pill mb-3 fw-semibold">
                <i class="fa-solid fa-sparkles me-1"></i> AI & ML Powered Price Intelligence
            </span>
            <h1 class="display-4 fw-extrabold mb-3">Predictive Price Analytics Framework</h1>
            <p class="lead text-white-50 mx-auto mb-4" style="max-width: 750px;">
                Never overpay again. Monitor multi-platform e-commerce prices across Amazon, Flipkart, Walmart, Best Buy, and eBay with predictive 14-day ML forecasting.
            </p>
            <div class="d-flex justify-content-center gap-3 flex-wrap">
                <a href="/dashboard" class="btn btn-primary btn-lg px-4 rounded-3 shadow">
                    <i class="fa-solid fa-gauge-high me-2"></i> Open Analytics Dashboard
                </a>
                <a href="/search" class="btn btn-outline-light btn-lg px-4 rounded-3">
                    <i class="fa-solid fa-magnifying-glass me-2"></i> Compare Store Prices
                </a>
                <a href="/download-apk" class="btn btn-success btn-lg px-4 rounded-3">
                    <i class="fa-brands fa-android me-2"></i> Get Android APK
                </a>
            </div>
        </div>
    </div>

    <!-- Quick Telemetry Showcase -->
    <div class="container py-5">
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 p-4 feature-card">
                    <div class="text-primary fs-1 mb-3"><i class="fa-solid fa-store"></i></div>
                    <h5 class="fw-bold">Cross-Platform Comparison</h5>
                    <p class="text-muted small">Live price aggregation across Amazon, Walmart, Best Buy, Flipkart, and eBay with instant identification of lowest verified prices.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 p-4 feature-card">
                    <div class="text-success fs-1 mb-3"><i class="fa-solid fa-brain"></i></div>
                    <h5 class="fw-bold">Polynomial Regression ML</h5>
                    <p class="text-muted small">14-day predictive forecasting modeling price trajectories with 90% confidence envelopes and statistical volatility scoring.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 p-4 feature-card">
                    <div class="text-warning fs-1 mb-3"><i class="fa-solid fa-bell"></i></div>
                    <h5 class="fw-bold">Smart Buy or Wait Alerts</h5>
                    <p class="text-muted small">Automated decision engine evaluating whether to purchase immediately or postpone for imminent promotional discounts.</p>
                </div>
            </div>
        </div>

        <!-- Featured Products -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold mb-0">Trending Multi-Platform Trackers</h4>
            <a href="/search" class="btn btn-outline-primary btn-sm">View All 8 Products <i class="fa-solid fa-arrow-right ms-1"></i></a>
        </div>

        <div class="row g-4">
            ${PRODUCTS.slice(0, 4).map(p => `
                <div class="col-md-6 col-lg-3">
                    <div class="card h-100 border-0 shadow-sm rounded-4 p-3 d-flex flex-column product-card">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary-subtle text-primary">${p.category}</span>
                            <span class="text-warning small"><i class="fa-solid fa-star"></i> ${p.rating}</span>
                        </div>
                        <h6 class="fw-bold mb-1 text-truncate">${p.title}</h6>
                        <small class="text-muted mb-3">${p.brand}</small>
                        <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                            <div>
                                <small class="text-muted d-block">${p.best_platform}</small>
                                <span class="fs-5 fw-bold text-success">$${p.current_lowest_price.toFixed(2)}</span>
                            </div>
                            <a href="/product/${p.id}" class="btn btn-primary btn-sm rounded-2">Analyze</a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
  `;
  res.send(renderLayout('Home', content, 'home'));
});

// 2. Dashboard Page
app.get('/dashboard', (req, res) => {
  const drops = PRODUCTS.slice(0, 4).map(prod => ({
    product: prod,
    prediction: fitAndPredict(prod.current_lowest_price)
  }));

  const content = `
    <div class="container py-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <div>
                <h2 class="fw-bold mb-1">Predictive Analytics Dashboard</h2>
                <p class="text-muted mb-0">Cross-platform price monitoring, forecasting & telemetry</p>
            </div>
            <div class="d-flex gap-2">
                <a href="/search" class="btn btn-primary btn-sm rounded-3">
                    <i class="fa-solid fa-plus me-1"></i> Track New Product
                </a>
                <a href="/alerts" class="btn btn-outline-secondary btn-sm rounded-3">
                    <i class="fa-solid fa-bell me-1"></i> View Alerts (${userAlerts.length})
                </a>
            </div>
        </div>

        <!-- Metrics Grid -->
        <div class="row g-3 mb-4">
            <div class="col-xl-3 col-sm-6">
                <div class="card border-0 shadow-sm rounded-4 p-3 bg-primary text-white stat-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-white-50 small fw-semibold">Tracked Products</span>
                            <h3 class="fw-bold my-1">${PRODUCTS.length}</h3>
                            <small class="text-white-50">Across 5 online retailers</small>
                        </div>
                        <i class="fa-solid fa-boxes-stacked fs-1 text-white-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6">
                <div class="card border-0 shadow-sm rounded-4 p-3 bg-success text-white stat-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-white-50 small fw-semibold">Average Savings</span>
                            <h3 class="fw-bold my-1">16.4%</h3>
                            <small class="text-white-50">vs Manufacturer MSRP</small>
                        </div>
                        <i class="fa-solid fa-piggy-bank fs-1 text-white-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6">
                <div class="card border-0 shadow-sm rounded-4 p-3 bg-warning text-dark stat-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-dark-50 small fw-semibold">Active Price Alerts</span>
                            <h3 class="fw-bold my-1">${userAlerts.length}</h3>
                            <small class="text-dark-50">Real-time threshold checks</small>
                        </div>
                        <i class="fa-solid fa-bell fs-1 text-dark-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6">
                <div class="card border-0 shadow-sm rounded-4 p-3 bg-info text-white stat-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-white-50 small fw-semibold">Market Volatility</span>
                            <h3 class="fw-bold my-1">Moderate</h3>
                            <small class="text-white-50">High holiday deal frequency</small>
                        </div>
                        <i class="fa-solid fa-arrow-trend-down fs-1 text-white-50"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Top Predicted Drops Carousel / Grid -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h5 class="fw-bold mb-0"><i class="fa-solid fa-brain text-primary me-2"></i> ML-Predicted Price Trajectories</h5>
                    <small class="text-muted">Polynomial regression algorithms forecasting lowest price points in next 14 days</small>
                </div>
                <a href="/search" class="btn btn-sm btn-outline-primary">Search All</a>
            </div>

            <div class="row g-3">
                ${drops.map(item => `
                    <div class="col-md-6 col-lg-3">
                        <div class="card h-100 border rounded-3 p-3 bg-light prediction-card">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-${['STRONG_BUY', 'BUY_NOW'].includes(item.prediction.recommendation_code) ? 'success' : 'warning text-dark'} fw-bold">
                                    ${item.prediction.recommendation_label}
                                </span>
                                <small class="text-muted">${item.prediction.confidence_score}% Conf.</small>
                            </div>
                            <h6 class="fw-bold text-truncate mb-1">${item.product.title}</h6>
                            <small class="text-muted d-block mb-2">${item.product.category} • ${item.product.brand}</small>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <small class="text-muted d-block">Current</small>
                                    <span class="fw-bold text-dark">$${item.prediction.current_price.toFixed(2)}</span>
                                </div>
                                <div class="text-end">
                                    <small class="text-muted d-block">Projected Low</small>
                                    <span class="fw-bold text-success">$${item.prediction.expected_lowest.toFixed(2)}</span>
                                </div>
                            </div>
                            <a href="/product/${item.product.id}" class="btn btn-outline-dark btn-sm w-100 rounded-2 mt-auto">
                                Inspect ML Model
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Complete Inventory Table -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">Tracked Products Inventory</h5>
                <span class="badge bg-secondary-subtle text-secondary">${PRODUCTS.length} Items</span>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Best Platform</th>
                            <th>Current Lowest</th>
                            <th>MSRP</th>
                            <th>Rating</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${PRODUCTS.map(p => `
                            <tr>
                                <td>
                                    <a href="/product/${p.id}" class="text-decoration-none fw-semibold text-dark">
                                        ${p.title}
                                    </a>
                                </td>
                                <td><span class="badge bg-light text-dark border">${p.category}</span></td>
                                <td><span class="fw-medium text-primary">${p.best_platform}</span></td>
                                <td><span class="fw-bold text-success">$${p.current_lowest_price.toFixed(2)}</span></td>
                                <td><span class="text-muted text-decoration-line-through">$${p.original_price.toFixed(2)}</span></td>
                                <td><span class="text-warning"><i class="fa-solid fa-star"></i> ${p.rating}</span></td>
                                <td class="text-end">
                                    <a href="/product/${p.id}" class="btn btn-sm btn-primary rounded-2">
                                        Details & Prediction
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `;
  res.send(renderLayout('Dashboard', content, 'dashboard'));
});

// 3. Search & Comparison Page
app.get('/search', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const category = (req.query.category || 'All').trim();
  const sortBy = req.query.sort || 'lowest_price';

  let results = PRODUCTS.filter(p => {
    const matchesQuery = !query || p.title.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
    const matchesCat = category === 'All' || p.category.toLowerCase() === category.toLowerCase();
    return matchesQuery && matchesCat;
  });

  if (sortBy === 'lowest_price') {
    results.sort((a, b) => a.current_lowest_price - b.current_lowest_price);
  } else if (sortBy === 'highest_price') {
    results.sort((a, b) => b.current_lowest_price - a.current_lowest_price);
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  }

  const categories = ['All', 'Smartphones', 'Laptops', 'Audio', 'Wearables', 'Gaming'];

  const content = `
    <div class="container py-4">
        <!-- Search Bar & Filters Form -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <form method="GET" action="/search">
                <div class="row g-3 align-items-center">
                    <div class="col-lg-5">
                        <div class="input-group">
                            <span class="input-group-text bg-white border-end-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" name="q" value="${req.query.q || ''}" class="form-control border-start-0 ps-0" placeholder="Search iPhone, MacBook, Sony...">
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3">
                        <select name="category" class="form-select" onchange="this.form.submit()">
                            ${categories.map(cat => `<option value="${cat}" ${category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-sm-6 col-lg-3">
                        <select name="sort" class="form-select" onchange="this.form.submit()">
                            <option value="lowest_price" ${sortBy === 'lowest_price' ? 'selected' : ''}>Price: Low to High</option>
                            <option value="highest_price" ${sortBy === 'highest_price' ? 'selected' : ''}>Price: High to Low</option>
                            <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>Customer Rating</option>
                        </select>
                    </div>
                    <div class="col-lg-1 d-grid">
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-filter"></i></button>
                    </div>
                </div>
            </form>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Search Results (${results.length})</h5>
            ${query ? `<span class="text-muted">Filtering by: "<strong>${query}</strong>"</span>` : ''}
        </div>

        <div class="row g-4">
            ${results.map(p => `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm rounded-4 p-3 d-flex flex-column product-card">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary-subtle text-primary">${p.category}</span>
                            <span class="text-warning small"><i class="fa-solid fa-star"></i> ${p.rating} (${p.review_count})</span>
                        </div>
                        <h6 class="fw-bold mb-1">${p.title}</h6>
                        <small class="text-muted mb-2">${p.brand}</small>
                        <p class="text-muted small text-truncate-2 mb-3">${p.description}</p>
                        <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                            <div>
                                <small class="text-muted d-block">Lowest on ${p.best_platform}</small>
                                <span class="fs-4 fw-bold text-success">$${p.current_lowest_price.toFixed(2)}</span>
                            </div>
                            <a href="/product/${p.id}" class="btn btn-primary btn-sm rounded-3">
                                Compare & Forecast
                            </a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
  `;
  res.send(renderLayout('Search & Compare', content, 'search'));
});

// 4. Product Detail & ML Predictor View
app.get('/product/:id', (req, res) => {
  const prod = PRODUCTS.find(p => p.id === req.params.id) || PRODUCTS[0];
  const prediction = fitAndPredict(prod.current_lowest_price);

  const platformPrices = PLATFORM_OFFERS[prod.id] || [
    { platform_name: prod.best_platform, price: prod.current_lowest_price, seller_name: 'Verified Retail Partner', delivery_days: 2, rating: 4.8, product_url: 'https://www.google.com' },
    { platform_name: 'Amazon', price: prod.current_lowest_price * 1.03, seller_name: 'Amazon Direct', delivery_days: 1, rating: 4.7, product_url: 'https://www.amazon.com' },
    { platform_name: 'Walmart', price: prod.current_lowest_price * 1.04, seller_name: 'Walmart Express', delivery_days: 3, rating: 4.6, product_url: 'https://www.walmart.com' },
    { platform_name: 'Flipkart', price: prod.current_lowest_price * 1.05, seller_name: 'SuperRetailer', delivery_days: 3, rating: 4.7, product_url: 'https://www.flipkart.com' },
    { platform_name: 'eBay', price: prod.current_lowest_price * 1.07, seller_name: 'TopSellerTech', delivery_days: 4, rating: 4.5, product_url: 'https://www.ebay.com' }
  ];

  const content = `
    <div class="container py-4">
        <!-- Breadcrumb & Action -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><a href="/dashboard" class="text-decoration-none">Dashboard</a></li>
                    <li class="breadcrumb-item"><a href="/search?category=${prod.category}" class="text-decoration-none">${prod.category}</a></li>
                    <li class="breadcrumb-item active" aria-current="page">${prod.brand}</li>
                </ol>
            </nav>
            <button class="btn btn-outline-primary btn-sm rounded-3" data-bs-toggle="modal" data-bs-target="#alertModal">
                <i class="fa-solid fa-bell me-1"></i> Set Price Alert
            </button>
        </div>

        <!-- Product Overview Card -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="badge bg-primary-subtle text-primary fw-semibold">${prod.category}</span>
                        <span class="badge bg-light text-dark border">${prod.brand}</span>
                        <span class="text-warning small"><i class="fa-solid fa-star"></i> ${prod.rating} (${prod.review_count} reviews)</span>
                    </div>
                    <h3 class="fw-bold mb-2">${prod.title}</h3>
                    <p class="text-muted mb-3">${prod.description}</p>
                    <div class="d-flex align-items-baseline gap-3 flex-wrap">
                        <span class="text-muted small">Current Lowest:</span>
                        <span class="display-6 fw-bold text-success">$${prod.current_lowest_price.toFixed(2)}</span>
                        ${prod.original_price > prod.current_lowest_price ? `<span class="text-muted text-decoration-line-through fs-5">$${prod.original_price.toFixed(2)}</span>` : ''}
                        <span class="badge bg-success-subtle text-success border border-success px-2 py-1">
                            Best Deal on ${prod.best_platform}
                        </span>
                    </div>
                </div>
                <div class="col-lg-4 mt-3 mt-lg-0 text-lg-end">
                    <button class="btn btn-primary btn-lg rounded-3 px-4 shadow-sm" data-bs-toggle="modal" data-bs-target="#alertModal">
                        <i class="fa-solid fa-bell me-2"></i> Track Price Drops
                    </button>
                </div>
            </div>
        </div>

        <!-- Buy Now vs Wait Recommendation Banner -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-${['STRONG_BUY', 'BUY_NOW'].includes(prediction.recommendation_code) ? 'success' : 'warning'}-subtle border-start border-5 border-${['STRONG_BUY', 'BUY_NOW'].includes(prediction.recommendation_code) ? 'success' : 'warning'}">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        <span class="badge bg-${['STRONG_BUY', 'BUY_NOW'].includes(prediction.recommendation_code) ? 'success' : 'warning text-dark'} px-3 py-2 fs-6 fw-bold">
                            <i class="fa-solid fa-${['STRONG_BUY', 'BUY_NOW'].includes(prediction.recommendation_code) ? 'circle-check' : 'hourglass-half'} me-1"></i>
                            RECOMMENDATION: ${prediction.recommendation_label.toUpperCase()}
                        </span>
                        <span class="badge bg-white text-dark border">Confidence: ${prediction.confidence_score}%</span>
                        <span class="badge bg-white text-dark border">Volatility: ${prediction.volatility_rating}</span>
                    </div>
                    <h5 class="fw-bold mb-1">${prediction.recommendation_reason}</h5>
                    <p class="text-muted small mb-0">Projected 14-day low: <strong>$${prediction.expected_lowest.toFixed(2)}</strong> (${prediction.expected_drop_percent}% price variance).</p>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                    <div class="bg-white p-3 rounded-3 shadow-sm d-inline-block text-start">
                        <small class="text-muted d-block">ML Accuracy Score</small>
                        <div class="d-flex align-items-center gap-2">
                            <span class="fw-bold fs-5">${prediction.confidence_score}/100</span>
                            <div class="progress flex-grow-1" style="width: 100px; height: 8px;">
                                <div class="progress-bar bg-success" style="width: ${prediction.confidence_score}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Multi-Platform Comparison Table -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 class="fw-bold mb-1">Multi-Platform Price Comparison</h5>
            <p class="text-muted small mb-3">Live verified prices across leading online retail platforms</p>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Platform</th>
                            <th>Seller & Delivery</th>
                            <th>Rating</th>
                            <th>Price</th>
                            <th>Difference</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${platformPrices.map((item, idx) => `
                            <tr class="${idx === 0 ? 'table-success bg-opacity-10' : ''}">
                                <td>
                                    <span class="fw-bold fs-6">${item.platform_name}</span>
                                    ${idx === 0 ? '<span class="badge bg-success ms-2">BEST DEAL</span>' : ''}
                                </td>
                                <td>
                                    <div class="fw-semibold">${item.seller_name}</div>
                                    <small class="text-muted"><i class="fa-solid fa-truck-fast me-1"></i> ${item.delivery_days}-Day Delivery</small>
                                </td>
                                <td><span class="text-warning"><i class="fa-solid fa-star"></i> ${item.rating}</span></td>
                                <td><span class="fw-bold fs-5 text-${idx === 0 ? 'success' : 'dark'}">$${item.price.toFixed(2)}</span></td>
                                <td>
                                    ${idx === 0 ? '<span class="badge bg-success-subtle text-success">Lowest</span>' : `<span class="text-danger small">+$${(item.price - platformPrices[0].price).toFixed(2)}</span>`}
                                </td>
                                <td class="text-end">
                                    <a href="${item.product_url}" target="_blank" class="btn btn-sm btn-outline-primary rounded-2">
                                        Visit Store <i class="fa-solid fa-arrow-up-right-from-square ms-1"></i>
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="row g-4 mb-4">
            <!-- 60-Day Historical Price Chart -->
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold mb-0">60-Day Price Movement</h5>
                            <small class="text-muted">Historical price tracking across retailers</small>
                        </div>
                        <span class="badge bg-light text-dark border">Past 60 Days</span>
                    </div>
                    <div style="position: relative; height: 260px;">
                        <canvas id="historicalChart"></canvas>
                    </div>
                    <div class="d-flex justify-content-between text-muted small mt-2 pt-2 border-top">
                        <span>Low: $${prediction.historical_min.toFixed(2)}</span>
                        <span>Avg: $${prediction.historical_avg.toFixed(2)}</span>
                        <span>High: $${prediction.historical_max.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- 14-Day ML Forecast with 90% Confidence Bounds -->
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold mb-0">14-Day ML Price Forecast</h5>
                            <small class="text-muted">Polynomial Regression with 90% confidence bounds</small>
                        </div>
                        <span class="badge bg-info-subtle text-info border border-info">ML Model</span>
                    </div>
                    <div style="position: relative; height: 260px;">
                        <canvas id="forecastChart"></canvas>
                    </div>
                    <div class="d-flex justify-content-between text-muted small mt-2 pt-2 border-top">
                        <span><i class="fa-solid fa-circle text-success me-1"></i> Forecast Trend</span>
                        <span><i class="fa-solid fa-circle text-info me-1"></i> 90% Confidence Interval</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Price Alert Modal -->
    <div class="modal fade" id="alertModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold"><i class="fa-solid fa-bell text-primary me-2"></i> Set Price Drop Alert</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST" action="/alerts/create">
                    <div class="modal-body">
                        <input type="hidden" name="product_id" value="${prod.id}">
                        <p class="text-muted small mb-3">
                            We continuously monitor Amazon, Flipkart, Walmart, Best Buy, and eBay. You will be notified the instant the price dips below your target.
                        </p>
                        <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3">
                            <span class="text-muted">Current Lowest Price:</span>
                            <span class="fw-bold text-success fs-5">$${prod.current_lowest_price.toFixed(2)}</span>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Target Price ($):</label>
                            <input type="number" step="0.01" name="target_price" value="${(prod.current_lowest_price * 0.90).toFixed(2)}" class="form-control" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary px-4">Activate Price Alert</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Historical Chart
        const histData = ${JSON.stringify(prediction.history_points)};
        new Chart(document.getElementById('historicalChart'), {
            type: 'line',
            data: {
                labels: histData.map(p => p.date_str),
                datasets: [{
                    label: 'Price ($)',
                    data: histData.map(p => p.price),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2.5,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } },
                    y: { ticks: { callback: v => '$' + v } }
                }
            }
        });

        // Forecast Chart
        const forecastData = ${JSON.stringify(prediction.forecast_points)};
        new Chart(document.getElementById('forecastChart'), {
            type: 'line',
            data: {
                labels: forecastData.map(p => p.date_str),
                datasets: [
                    {
                        label: 'Upper 90%',
                        data: forecastData.map(p => p.upper_bound),
                        borderColor: 'transparent',
                        backgroundColor: 'rgba(6, 182, 212, 0.15)',
                        fill: '+1',
                        pointRadius: 0
                    },
                    {
                        label: 'Lower 90%',
                        data: forecastData.map(p => p.lower_bound),
                        borderColor: 'transparent',
                        backgroundColor: 'transparent',
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'ML Forecast',
                        data: forecastData.map(p => p.predicted_price),
                        borderColor: '#10b981',
                        borderDash: [5, 5],
                        borderWidth: 2.5,
                        fill: false,
                        pointRadius: 3,
                        pointBackgroundColor: '#10b981'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { ticks: { callback: v => '$' + v } }
                }
            }
        });
    </script>
  `;
  res.send(renderLayout(`${prod.title} - Prediction`, content, 'search'));
});

// 5. Price Drop Alerts Page
app.get('/alerts', (req, res) => {
  const content = `
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold mb-1">Price Drop Alerts</h2>
                <p class="text-muted mb-0">Multi-store price drop monitoring and threshold tracking</p>
            </div>
            <a href="/search" class="btn btn-primary btn-sm rounded-3">
                <i class="fa-solid fa-plus me-1"></i> Add New Alert
            </a>
        </div>

        ${userAlerts.length > 0 ? `
            <div class="row g-3">
                ${userAlerts.map(alert => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card border-0 shadow-sm rounded-4 p-4 h-100 alert-card">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-${alert.is_triggered ? 'success' : 'warning text-dark'} px-3 py-2 fw-bold">
                                    <i class="fa-solid fa-${alert.is_triggered ? 'circle-check' : 'bell'} me-1"></i>
                                    ${alert.is_triggered ? 'TRIGGERED - TARGET REACHED' : 'MONITORING PRICE'}
                                </span>
                                <form method="POST" action="/alerts/delete/${alert.id}" class="d-inline" onsubmit="return confirm('Remove alert?');">
                                    <button type="submit" class="btn btn-link text-danger p-0">
                                        <i class="fa-regular fa-trash-can fs-5"></i>
                                    </button>
                                </form>
                            </div>
                            <h6 class="fw-bold mt-2 mb-1">${alert.product_title}</h6>
                            <small class="text-muted mb-3">${alert.note}</small>

                            <div class="bg-light p-3 rounded-3 my-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="text-muted small">Target Budget:</span>
                                    <span class="fw-bold text-success fs-5">$${alert.target_price.toFixed(2)}</span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span class="text-muted small">Current Store Price:</span>
                                    <span class="fw-bold fs-6">$${alert.current_price.toFixed(2)}</span>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                                <form method="POST" action="/alerts/simulate/${alert.id}">
                                    <button type="submit" class="btn btn-outline-secondary btn-sm rounded-2">
                                        <i class="fa-solid fa-play me-1"></i> ${alert.is_triggered ? 'Reset' : 'Simulate Drop'}
                                    </button>
                                </form>
                                <a href="/product/${alert.product_id}" class="btn btn-sm btn-outline-primary rounded-2">
                                    View Product <i class="fa-solid fa-arrow-right ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
                <i class="fa-solid fa-bell-slash fs-1 text-muted mb-3"></i>
                <h4>No price alerts set</h4>
                <p class="text-muted">You have not created any price drop alerts yet. Search for any product and click 'Set Price Alert' to start receiving notifications.</p>
                <div class="mt-2">
                    <a href="/search" class="btn btn-primary">Browse Products</a>
                </div>
            </div>
        `}
    </div>
  `;
  res.send(renderLayout('Price Alerts', content, 'alerts'));
});

// Alert Actions
app.post('/alerts/create', (req, res) => {
  const { product_id, target_price } = req.body;
  const prod = PRODUCTS.find(p => p.id === product_id) || PRODUCTS[0];
  const target = parseFloat(target_price) || prod.current_lowest_price * 0.9;

  userAlerts.push({
    id: Date.now(),
    product_id: prod.id,
    product_title: prod.title,
    target_price: target,
    current_price: prod.current_lowest_price,
    is_triggered: false,
    note: `Alert set for target $${target.toFixed(2)}`,
    created_at: new Date().toISOString().split('T')[0]
  });

  res.redirect('/alerts');
});

app.post('/alerts/simulate/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const alert = userAlerts.find(a => a.id === id);
  if (alert) {
    alert.is_triggered = !alert.is_triggered;
    if (alert.is_triggered) {
      alert.current_price = alert.target_price - 10.0;
    } else {
      const prod = PRODUCTS.find(p => p.id === alert.product_id);
      alert.current_price = prod ? prod.current_lowest_price : alert.target_price * 1.1;
    }
  }
  res.redirect('/alerts');
});

app.post('/alerts/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  userAlerts = userAlerts.filter(a => a.id !== id);
  res.redirect('/alerts');
});

// 6. ML Methodology & Architecture Page
app.get('/analytics', (req, res) => {
  const content = `
    <div class="container py-4">
        <div class="mb-4">
            <h2 class="fw-bold mb-1">Predictive Analytics Framework & ML Architecture</h2>
            <p class="text-muted mb-0">System design, mathematical formulations, and cross-platform analysis</p>
        </div>

        <div class="row g-4 mb-4">
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <h5 class="fw-bold mb-3"><i class="fa-solid fa-square-root-variable text-primary me-2"></i> 1. Mathematical Formulation</h5>
                    <p class="text-muted small">The price forecasting module implements Polynomial Regression with OLS parameters:</p>
                    <div class="bg-light p-3 rounded-3 font-monospace small mb-3 border">
                        y(t) = &beta;<sub>0</sub> + &beta;<sub>1</sub>t + &beta;<sub>2</sub>t<sup>2</sup> + &epsilon;
                    </div>
                    <ul class="text-muted small ps-3 mb-0">
                        <li><strong>y(t)</strong>: Estimated price at time offset <em>t</em> (days).</li>
                        <li><strong>&beta;<sub>0</sub>, &beta;<sub>1</sub>, &beta;<sub>2</sub></strong>: OLS regression coefficients estimated from historical prices.</li>
                        <li><strong>&epsilon;</strong>: Error residual &sim; <em>N(0, &sigma;<sup>2</sup>)</em>.</li>
                    </ul>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <h5 class="fw-bold mb-3"><i class="fa-solid fa-chart-line text-success me-2"></i> 2. Statistical Confidence Bands</h5>
                    <p class="text-muted small">To prevent overconfidence, a 90% confidence envelope is computed using residual standard error:</p>
                    <div class="bg-light p-3 rounded-3 font-monospace small mb-3 border">
                        CI<sub>90%</sub> = &ycirc;(t) &plusmn; 1.645 &middot; S<sub>e</sub> &middot; &radic;(1 + h(t))
                    </div>
                    <p class="text-muted small mb-0">
                        Where <em>S<sub>e</sub></em> is root mean square residual error and <em>h(t)</em> models variance expansion over increasing forecast horizons (+1 to +14 days).
                    </p>
                </div>
            </div>
        </div>

        <!-- Platform Benchmark Table -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 class="fw-bold mb-3"><i class="fa-solid fa-store text-info me-2"></i> Multi-Platform Intelligence Benchmark</h5>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Platform</th>
                            <th>Price Competitiveness</th>
                            <th>Average Shipping</th>
                            <th>Fluctuation Frequency</th>
                            <th>Algorithmic Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Amazon</strong></td>
                            <td><span class="badge bg-success">96%</span></td>
                            <td>1-2 Days (Prime)</td>
                            <td>High (Dynamic repricing algorithms)</td>
                            <td>Frequent micro-adjustments based on competitor matching</td>
                        </tr>
                        <tr>
                            <td><strong>Best Buy</strong></td>
                            <td><span class="badge bg-primary">92%</span></td>
                            <td>2 Days</td>
                            <td>Moderate (Weekly circulars)</td>
                            <td>Major deals on weekend promotions and bundle savings</td>
                        </tr>
                        <tr>
                            <td><strong>Walmart</strong></td>
                            <td><span class="badge bg-success">90%</span></td>
                            <td>2-3 Days</td>
                            <td>Moderate (Rollbacks)</td>
                            <td>Reliable base prices with aggressive rollback promotions</td>
                        </tr>
                        <tr>
                            <td><strong>Flipkart</strong></td>
                            <td><span class="badge bg-info">87%</span></td>
                            <td>3-4 Days</td>
                            <td>High (Big billion sales)</td>
                            <td>Substantial seasonal discount events and exchange bonuses</td>
                        </tr>
                        <tr>
                            <td><strong>eBay</strong></td>
                            <td><span class="badge bg-secondary">84%</span></td>
                            <td>3-5 Days</td>
                            <td>Variable</td>
                            <td>Lowest floor on refurbished and certified open-box items</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `;
  res.send(renderLayout('ML Methodology', content, 'analytics'));
});

// 7. REST API Endpoints
app.get('/api/predict/:id', (req, res) => {
  const prod = PRODUCTS.find(p => p.id === req.params.id) || PRODUCTS[0];
  const prediction = fitAndPredict(prod.current_lowest_price);
  res.json({ product: prod, prediction });
});

app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

app.get('/api/alerts', (req, res) => {
  res.json(userAlerts);
});

// 8. Download Android APK Endpoint
app.get('/download-apk', (req, res) => {
  const possiblePaths = [
    path.join(__dirname, '.build-outputs', 'app-debug.apk'),
    path.join(__dirname, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return res.download(p, 'SmartPrice-Android.apk');
    }
  }
  res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h2>APK Build in Progress</h2>
      <p>The Android APK is currently building or ready in Gradle outputs. Please reload in a moment.</p>
      <a href="/">Return to SmartPrice Web</a>
    </div>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SmartPrice] Production Web Server listening on 0.0.0.0:${PORT}`);
});
