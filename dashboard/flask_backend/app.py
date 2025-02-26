from flask import Flask, request, jsonify
import pickle
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMAResults
from tensorflow.keras.models import load_model

app = Flask(__name__)

# ----- Load Saved Models and Artifacts -----
# Load ARIMA model
arima_model = ARIMAResults.load("arima_model.pkl")

# Load GARCH model using pickle
with open("garch_model.pkl", "rb") as f:
    garch_model = pickle.load(f)

# Load VAR model using pickle (if applicable)
with open("var_model.pkl", "rb") as f:
    var_model = pickle.load(f)

# Load LSTM model (HDF5 format in this case)
lstm_model = load_model("lstm_model.h5")

# Load the scaler used in LSTM preprocessing
with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# Load the historical data (ensure the CSV file is in the same directory)
df = pd.read_csv('brent_data.csv', parse_dates=['Date'], index_col='Date')


# ----- API Endpoints -----

@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    """
    Returns historical Brent oil prices data.
    """
    data = df.reset_index().to_dict(orient='records')
    return jsonify(data)


@app.route('/api/predict/arima', methods=['POST'])
def predict_arima():
    """
    Returns an ARIMA forecast.
    Expects JSON input: {"steps": <number_of_steps>}
    """
    req_data = request.get_json()
    steps = req_data.get('steps', 30)
    forecast = arima_model.forecast(steps=steps)
    forecast_list = forecast.tolist()
    return jsonify({'forecast': forecast_list})


@app.route('/api/predict/lstm', methods=['POST'])
def predict_lstm():
    """
    Returns a prediction from the LSTM model.
    Expects JSON input: {"input": [list_of_values]}
    The input should be preprocessed as needed (e.g., a sequence of scaled values).
    """
    req_data = request.get_json()
    input_data = req_data.get('input')  # Expecting a list of values representing a sequence.
    
    # Convert to numpy array and reshape for LSTM: (batch_size, timesteps, features)
    input_array = np.array(input_data).reshape(1, -1, 1)
    
    # Get prediction
    pred = lstm_model.predict(input_array)
    
    # Optionally, inverse transform the prediction if you scaled the data
    pred_rescaled = scaler.inverse_transform(pred)
    return jsonify({'prediction': pred_rescaled.flatten().tolist()})


@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """
    Returns example evaluation metrics for the models.
    In a real scenario, you might store and update these metrics dynamically.
    """
    metrics = {
        'ARIMA': {'RMSE': 2.5, 'MAE': 1.8},
        'LSTM': {'RMSE': 2.0, 'MAE': 1.5},
        'GARCH': {'Note': 'Volatility analysis model - metrics to be defined'},
        'VAR': {'Note': 'Multivariate model - metrics to be defined'}
    }
    return jsonify(metrics)


# ----- Run the Flask App -----
if __name__ == '__main__':
    app.run(debug=True)
