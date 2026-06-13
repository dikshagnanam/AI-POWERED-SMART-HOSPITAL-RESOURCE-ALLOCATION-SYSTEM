# 🏥 AI-Powered Smart Hospital Resource Allocation System

A full-stack AI project that uses **LSTM Neural Networks**, **Linear Programming**, and **Greedy Scheduling** to predict patient admissions, allocate ICU beds, schedule staff, and minimize waiting times.

---

## 📁 Project Structure

```
hospital-system/
├── backend/
│   ├── app.py                  # Flask API server
│   ├── database.py             # SQLite setup
│   ├── requirements.txt        # Python dependencies
│   ├── data/
│   │   └── admissions.csv      # Synthetic training dataset (365 days)
│   └── ml/
│       ├── train_model.py      # LSTM model training script
│       ├── predictor.py        # Prediction utility
│       ├── icu_allocator.py    # Linear Programming ICU allocation
│       ├── scheduler.py        # Greedy staff scheduling
│       └── wait_optimizer.py   # Wait time optimization
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── App.css
│       └── components/
│           ├── PredictionPanel.js
│           ├── ICUPanel.js
│           ├── SchedulePanel.js
│           └── WaitTimePanel.js
└── README.md
```

---

## ⚙️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, Recharts, Axios         |
| Backend    | Python, Flask, Flask-CORS         |
| ML Model   | TensorFlow/Keras (LSTM)           |
| Optimizer  | PuLP (Linear Programming)         |
| Database   | SQLite                            |
| Scheduling | Greedy Algorithm (custom)         |

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

---

### Step 1 — Clone / Extract the Project

```bash
cd hospital-system
```

---

### Step 2 — Set Up Python Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

---

### Step 3 — Train the LSTM Model

> ⚠️ This step is required before running the server.

```bash
# Make sure you are inside the backend/ folder
python ml/train_model.py
```

You should see training progress over 30 epochs. When done, it saves:
- `ml/lstm_model.h5` — trained LSTM model
- `ml/scaler.pkl` — data scaler
- `ml/last_sequence.pkl` — last 7 days for prediction

Training takes about **1-3 minutes** depending on your machine.

---

### Step 4 — Start the Flask Backend

```bash
# Still inside backend/ folder
python app.py
```

You should see:
```
Starting Hospital Resource Allocation API...
 * Running on http://0.0.0.0:5000
```

The API is now live at **http://localhost:5000**

---

### Step 5 — Set Up and Start React Frontend

Open a **new terminal window**:

```bash
# Navigate to frontend folder
cd hospital-system/frontend

# Install Node dependencies
npm install

# Start the React development server
npm start
```

The dashboard opens automatically at **http://localhost:3000**

---

## 🌐 API Endpoints

| Endpoint               | Method      | Description                          |
|------------------------|-------------|--------------------------------------|
| `/`                    | GET         | Health check                         |
| `/predict-admissions`  | GET / POST  | LSTM prediction for N days           |
| `/allocate-icu`        | GET / POST  | LP-based ICU bed allocation          |
| `/schedule-staff`      | GET / POST  | Greedy staff scheduling              |
| `/optimize-wait-time`  | GET / POST  | Priority-based wait time optimizer   |

### Example POST request (using curl):

```bash
# Predict admissions for next 7 days
curl -X POST http://localhost:5000/predict-admissions \
  -H "Content-Type: application/json" \
  -d '{"days": 7}'

# Allocate ICU beds (30 total, 7 days)
curl -X POST http://localhost:5000/allocate-icu \
  -H "Content-Type: application/json" \
  -d '{"total_icu_beds": 30, "days": 7}'

# Generate staff schedule
curl -X POST http://localhost:5000/schedule-staff \
  -H "Content-Type: application/json" \
  -d '{"days": 7}'

# Optimize wait times
curl -X POST http://localhost:5000/optimize-wait-time \
  -H "Content-Type: application/json" \
  -d '{"days": 7, "doctors": 6, "nurses": 8}'
```

---

## 🧠 How Each Feature Works

### 1. Patient Admission Prediction (LSTM)
- Trained on 365 days of synthetic hospital admission data
- Uses a 7-day look-back window to predict the next N days
- Model architecture: 2 LSTM layers (50 units each) + Dense layers
- Output: predicted patient count per day

### 2. ICU Bed Allocation (Linear Programming)
- Uses PuLP to solve an optimization problem
- Allocates beds across 3 severity categories: Critical, Serious, Moderate
- Constraints: total beds ≤ available, critical patients get ≥ 40% priority
- Output: optimal bed distribution per day

### 3. Staff Scheduling (Greedy Algorithm)
- Sorts staff by availability
- Greedily assigns doctors and nurses to 3 shifts per day
- Scales staff count based on predicted load level (High/Medium/Low)
- Output: full shift-wise roster per day

### 4. Wait Time Optimization (Priority Queue Logic)
- Categorizes patients into 4 priority levels
- Calculates wait times based on throughput (doctors × 4 patients/hour)
- Generates recommendations: Normal / Warning / Critical
- Output: avg wait time, queue breakdown, hours to clear

---

## 📊 Dashboard Features

- **📈 Admission Prediction** — Area chart + daily breakdown table
- **🏥 ICU Allocation** — Stacked bar chart + day-by-day detail with utilization bars
- **👨‍⚕️ Staff Scheduling** — Shift cards showing doctor & nurse assignments
- **⏱️ Wait Time** — Line chart + priority queue breakdown with alert status

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| `Model not found` error | Run `python ml/train_model.py` first |
| CORS error in browser | Make sure Flask is running on port 5000 |
| `npm install` fails | Make sure Node.js 16+ is installed |
| TensorFlow install slow | Be patient — TF is large (~500MB) |
| Port 5000 in use | Change port in `app.py`: `port=5001` and update `API` constant in all frontend components |

---

## 📌 Notes for College Demo

- The dataset is **synthetic** but follows real-world patterns (weekends busier, seasonal trends, holidays)
- The LSTM model is intentionally kept simple (30 epochs) for fast training
- All 4 features are connected — prediction feeds into ICU, scheduling, and wait time modules
- SQLite logs every API call for demonstration purposes

---

## 👨‍💻 Project Credits

Built as a college demo project demonstrating:
- Deep Learning (LSTM time-series forecasting)
- Operations Research (Linear Programming with PuLP)
- Algorithm Design (Greedy Scheduling)
- Full-Stack Development (Flask + React)
"# AI-POWERED-SMART-HOSPITAL-RESOURCE-ALLOCATION-SYSTEM" 
"# AI-POWERED-SMART-HOSPITAL-RESOURCE-ALLOCATION-SYSTEM" 
