import numpy as np
import pickle
import os

MODEL_DIR = os.path.dirname(__file__)

def load_model_and_scaler():
    model_path = os.path.join(MODEL_DIR, 'lstm_model.pkl')
    scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
    seq_path = os.path.join(MODEL_DIR, 'last_sequence.pkl')

    if not os.path.exists(model_path):
        raise FileNotFoundError("Model not found. Please run train_model.py first.")

    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)

    with open(seq_path, 'rb') as f:
        last_sequence = pickle.load(f)

    return model, scaler, last_sequence

def predict_admissions(days=7):
    model, scaler, last_sequence = load_model_and_scaler()
    sequence = list(last_sequence)
    predictions = []

    for _ in range(days):
        seq_array = np.array(sequence[-7:]).reshape(1, -1)
        pred_scaled = model.predict(seq_array)[0]
        pred_actual = scaler.inverse_transform([[pred_scaled]])[0][0]
        predictions.append(round(float(pred_actual)))
        sequence.append(pred_scaled)

    return predictions
