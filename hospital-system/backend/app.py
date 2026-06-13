from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import sys

# Add ml directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml'))

from database import init_db, get_db
from ml.predictor import predict_admissions
from ml.icu_allocator import allocate_icu_beds
from ml.scheduler import greedy_schedule
from ml.wait_optimizer import optimize_wait_time

app = Flask(__name__)
CORS(app)

# Initialize DB on startup
init_db()


@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "running",
        "message": "Hospital Resource Allocation API is live",
        "endpoints": [
            "/predict-admissions",
            "/allocate-icu",
            "/schedule-staff",
            "/optimize-wait-time"
        ]
    })


@app.route('/predict-admissions', methods=['GET', 'POST'])
def api_predict_admissions():
    try:
        days = 7
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            days = int(body.get('days', 7))
        else:
            days = int(request.args.get('days', 7))
        
        days = max(1, min(days, 30))
        predictions = predict_admissions(days)
        
        # Log to DB
        conn = get_db()
        conn.execute(
            "INSERT INTO prediction_logs (days_requested, predictions) VALUES (?, ?)",
            (days, json.dumps(predictions))
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "days": days,
            "predictions": predictions,
            "labels": [f"Day {i+1}" for i in range(days)],
            "average": round(sum(predictions) / len(predictions), 1),
            "max": max(predictions),
            "min": min(predictions)
        })
    
    except FileNotFoundError as e:
        return jsonify({"success": False, "error": str(e)}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/allocate-icu', methods=['GET', 'POST'])
def api_allocate_icu():
    try:
        total_beds = 30
        days = 7
        
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            total_beds = int(body.get('total_icu_beds', 30))
            days = int(body.get('days', 7))
        else:
            total_beds = int(request.args.get('total_icu_beds', 30))
            days = int(request.args.get('days', 7))
        
        days = max(1, min(days, 30))
        total_beds = max(5, min(total_beds, 100))
        
        # First get predictions
        predictions = predict_admissions(days)
        
        # Run LP allocation
        allocation = allocate_icu_beds(predictions, total_icu_beds=total_beds)
        
        # Log to DB
        conn = get_db()
        conn.execute(
            "INSERT INTO icu_logs (total_icu_beds, allocation_result) VALUES (?, ?)",
            (total_beds, json.dumps(allocation))
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "total_icu_beds": total_beds,
            "allocation": allocation
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/schedule-staff', methods=['GET', 'POST'])
def api_schedule_staff():
    try:
        days = 7
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            days = int(body.get('days', 7))
        else:
            days = int(request.args.get('days', 7))
        
        days = max(1, min(days, 30))
        
        # Get predictions first
        predictions = predict_admissions(days)
        
        # Run greedy scheduling
        schedule = greedy_schedule(predictions)
        
        # Log to DB
        conn = get_db()
        conn.execute(
            "INSERT INTO schedule_logs (schedule_result) VALUES (?)",
            (json.dumps(schedule),)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "days": days,
            "schedule": schedule
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/optimize-wait-time', methods=['GET', 'POST'])
def api_optimize_wait_time():
    try:
        days = 7
        doctors = 6
        nurses = 8
        
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            days = int(body.get('days', 7))
            doctors = int(body.get('doctors', 6))
            nurses = int(body.get('nurses', 8))
        else:
            days = int(request.args.get('days', 7))
            doctors = int(request.args.get('doctors', 6))
            nurses = int(request.args.get('nurses', 8))
        
        days = max(1, min(days, 30))
        
        # Get predictions
        predictions = predict_admissions(days)
        
        # Run wait time optimization
        wait_results = optimize_wait_time(predictions, doctors, nurses)
        
        # Log to DB
        conn = get_db()
        conn.execute(
            "INSERT INTO wait_time_logs (wait_result) VALUES (?)",
            (json.dumps(wait_results),)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "days": days,
            "wait_optimization": wait_results
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    print("Starting Hospital Resource Allocation API...")
    print("Make sure you have trained the model first: python ml/train_model.py")
    app.run(debug=True, host='0.0.0.0', port=5000)
