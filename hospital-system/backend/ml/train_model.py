import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.neural_network import MLPRegressor
import pickle
import os

def train_and_save_model():
    df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../data/admissions.csv'))
    data = df['admissions'].values.astype(float)

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data.reshape(-1, 1)).flatten()

    look_back = 7
    X, y = [], []
    for i in range(look_back, len(scaled_data)):
        X.append(scaled_data[i - look_back:i])
        y.append(scaled_data[i])

    X, y = np.array(X), np.array(y)

    model = MLPRegressor(
        hidden_layer_sizes=(64, 32),
        activation='relu',
        max_iter=500,
        random_state=42,
        verbose=False
    )

    print("Training model...")
    model.fit(X, y)
    print("Training complete!")

    model_dir = os.path.dirname(__file__)

    with open(os.path.join(model_dir, 'lstm_model.pkl'), 'wb') as f:
        pickle.dump(model, f)

    with open(os.path.join(model_dir, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)

    last_sequence = scaled_data[-look_back:].tolist()
    with open(os.path.join(model_dir, 'last_sequence.pkl'), 'wb') as f:
        pickle.dump(last_sequence, f)

    print("Model saved successfully!")

if __name__ == '__main__':
    train_and_save_model()
