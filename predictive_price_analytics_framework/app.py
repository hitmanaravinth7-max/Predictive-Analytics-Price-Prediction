"""
A Predictive Analytics Framework for Multi-Platform Price Prediction and Smart Online Shopping
Flask Application Controller & REST API
"""

import os
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import execute_query, init_sqlite_if_needed
from models.ml_predictor import PricePredictor
import pandas as pd

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "smartprice_college_project_secret_key_2026")
predictor = PricePredictor(degree=2)

# Ensure database tables exist
init_sqlite_if_needed()

@app.context_processor
def inject_global_data():
    user = None
    alert_count = 0
    if 'user_id' in session:
        user = execute_query("SELECT * FROM users WHERE id = %s", (session['user_id'],), fetchone=True)
        alerts = execute_query("SELECT COUNT(*) as count FROM price_alerts WHERE user_id = %s", (session['user_id'],), fetchone=True)
        if alerts:
            alert_count = alerts.get('count', 0)
    return dict(current_user=user, alert_count=alert_count)

@app.route('/')
def index():
    products = execute_query("SELECT * FROM products LIMIT 6", fetchall=True) or []
    return render_template('index.html', products=products)

@app.route('/dashboard')
def dashboard():
    products = execute_query("SELECT * FROM products ORDER BY rating DESC", fetchall=True) or []
    total_products = len(products)
    alerts = []
    if 'user_id' in session:
        alerts = execute_query("SELECT * FROM price_alerts WHERE user_id = %s", (session['user_id'],), fetchall=True) or []
    
    # Calculate top predicted drops
    drops = []
    for prod in products[:4]:
        prediction = predictor.fit_and_predict(None, float(prod['current_lowest_price']))
        drops.append({
            'product': prod,
            'prediction': prediction
        })

    return render_template('dashboard.html', 
                           products=products, 
                           total_products=total_products,
                           alerts=alerts,
                           drops=drops)

@app.route('/search')
def search():
    query = request.args.get('q', '').strip()
    category = request.args.get('category', 'All').strip()
    sort_by = request.args.get('sort', 'lowest_price')

    sql = "SELECT * FROM products WHERE 1=1"
    params = []

    if query:
        sql += " AND (title LIKE %s OR brand LIKE %s OR description LIKE %s)"
        like_str = f"%{query}%"
        params.extend([like_str, like_str, like_str])

    if category and category != 'All':
        sql += " AND category = %s"
        params.append(category)

    if sort_by == 'lowest_price':
        sql += " ORDER BY current_lowest_price ASC"
    elif sort_by == 'highest_price':
        sql += " ORDER BY current_lowest_price DESC"
    elif sort_by == 'rating':
        sql += " ORDER BY rating DESC"
    else:
        sql += " ORDER BY current_lowest_price ASC"

    products = execute_query(sql, tuple(params), fetchall=True) or []
    categories = ['All', 'Smartphones', 'Laptops', 'Audio', 'Wearables', 'Gaming']

    return render_template('search.html', 
                           products=products, 
                           query=query, 
                           selected_category=category, 
                           sort_by=sort_by,
                           categories=categories)

@app.route('/product/<product_id>')
def product_detail(product_id):
    product = execute_query("SELECT * FROM products WHERE id = %s", (product_id,), fetchone=True)
    if not product:
        flash("Product not found.", "danger")
        return redirect(url_for('dashboard'))

    # Multi-platform prices
    platform_prices = execute_query(
        "SELECT * FROM platform_prices WHERE product_id = %s ORDER BY price ASC", 
        (product_id,), fetchall=True
    ) or []

    # Historical prices
    history_rows = execute_query(
        "SELECT day_offset, date_str, price FROM price_history WHERE product_id = %s ORDER BY day_offset ASC",
        (product_id,), fetchall=True
    ) or []

    history_df = pd.DataFrame(history_rows) if history_rows else None

    # Run ML prediction
    prediction = predictor.fit_and_predict(history_df, float(product['current_lowest_price']))

    return render_template('product_detail.html',
                           product=product,
                           platform_prices=platform_prices,
                           prediction=prediction)

@app.route('/api/predict/<product_id>')
def api_predict(product_id):
    product = execute_query("SELECT * FROM products WHERE id = %s", (product_id,), fetchone=True)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    prediction = predictor.fit_and_predict(None, float(product['current_lowest_price']))
    return jsonify(prediction)

@app.route('/alerts')
def alerts():
    user_id = session.get('user_id', 1) # Default demo user if guest
    user_alerts = execute_query("""
        SELECT a.*, p.title as product_title, p.current_lowest_price as prod_current_price, p.image_url 
        FROM price_alerts a 
        JOIN products p ON a.product_id = p.id 
        WHERE a.user_id = %s 
        ORDER BY a.created_at DESC
    """, (user_id,), fetchall=True) or []

    return render_template('alerts.html', alerts=user_alerts)

@app.route('/alerts/create', methods=['POST'])
def create_alert():
    user_id = session.get('user_id', 1)
    product_id = request.form.get('product_id')
    target_price = request.form.get('target_price')

    if not product_id or not target_price:
        flash("Missing product or target price.", "warning")
        return redirect(request.referrer or url_for('dashboard'))

    try:
        target_val = float(target_price)
        prod = execute_query("SELECT * FROM products WHERE id = %s", (product_id,), fetchone=True)
        current_val = float(prod['current_lowest_price']) if prod else target_val * 1.1

        execute_query("""
            INSERT INTO price_alerts (user_id, product_id, target_price, current_price, is_triggered, note)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, product_id, target_val, current_val, 0, f"Alert set for target ${target_val:.2f}"))

        flash(f"Price alert successfully activated for ${target_val:.2f}!", "success")
    except ValueError:
        flash("Invalid price value entered.", "danger")

    return redirect(url_for('alerts'))

@app.route('/alerts/simulate/<int:alert_id>', methods=['POST'])
def simulate_alert(alert_id):
    alert = execute_query("SELECT * FROM price_alerts WHERE id = %s", (alert_id,), fetchone=True)
    if alert:
        new_state = 0 if alert.get('is_triggered') else 1
        execute_query("UPDATE price_alerts SET is_triggered = %s WHERE id = %s", (new_state, alert_id))
        flash("Alert trigger simulated successfully for testing.", "info")
    return redirect(url_for('alerts'))

@app.route('/alerts/delete/<int:alert_id>', methods=['POST'])
def delete_alert(alert_id):
    execute_query("DELETE FROM price_alerts WHERE id = %s", (alert_id,))
    flash("Alert removed.", "info")
    return redirect(url_for('alerts'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()

        user = execute_query("SELECT * FROM users WHERE email = %s", (email,), fetchone=True)
        # Demo bypass or password check
        if user and (email == 'student@smartprice.edu' or check_password_hash(user['password_hash'], password)):
            session['user_id'] = user['id']
            session['user_name'] = user['full_name']
            flash(f"Welcome back, {user['full_name']}!", "success")
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid email or password.", "danger")

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()

        if not name or not email or not password:
            flash("All fields are required.", "danger")
            return render_template('register.html')

        existing = execute_query("SELECT id FROM users WHERE email = %s", (email,), fetchone=True)
        if existing:
            flash("Email already registered. Please sign in.", "warning")
            return redirect(url_for('login'))

        p_hash = generate_password_hash(password)
        new_id = execute_query("""
            INSERT INTO users (full_name, email, password_hash) VALUES (%s, %s, %s)
        """, (name, email, p_hash))

        session['user_id'] = new_id
        session['user_name'] = name
        flash("Account created successfully! Welcome to SmartPrice.", "success")
        return redirect(url_for('dashboard'))

    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash("You have been signed out.", "info")
    return redirect(url_for('index'))

@app.route('/analytics')
def analytics():
    return render_template('analytics.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
