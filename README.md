
# 📈 Brent Oil Price Event Impact Analysis

## 🛠 Introduction
This project analyzes the impact of various events on Brent crude oil prices. It includes data collection, machine learning modeling, and a web-based dashboard for visualization. The system integrates:

- **Data preprocessing and analysis**
- **Machine learning models for forecasting**
- **An interactive web dashboard to visualize trends**

## 🚀 Technologies Used

### Backend:
- **Flask** (API development)
- **Flask-CORS** (Cross-Origin Resource Sharing)
- **Pandas, NumPy** (Data processing)
- **Pickle** (Model serialization)

### Machine Learning:
- **ARIMA** (Time-series forecasting)
- **LSTM** (Deep learning model using TensorFlow/Keras)
- **GARCH** (Volatility modeling using Statsmodels)

### Frontend:
- **React + Next.js** (Web dashboard)
- **Chart.js** (Data visualization)
- **Tailwind CSS** (UI styling)
- **Radix UI** (Component library)

---

## 📁 Project Structure

```
BrentOil-Event-Impact-Analysis/
│── dashboard/        # React-based frontend and flask-based backend
│── data/             # Raw and processed datasets
│── docs/             # Documentation and reports
│── model/            # Pre-trained ML models
│── notebooks/        # Jupyter notebooks for analysis
│── scripts/          # Data processing and API scripts
│── requirements.txt  # Dependencies
│── README.md         # Project documentation
```

---

## ⚙️ Project Setup

### 1️⃣ Backend (Flask API)
The backend is responsible for serving data and forecasts.

#### Installation:
```bash
pip install -r requirements.txt
```

#### Running the API:
```bash
python scripts/api.py
```

#### API Endpoints:
- `/api/historical` → Fetch historical Brent oil prices
- `/api/predict/arima` → Get ARIMA model forecast
- `/api/predict/lstm` → Get LSTM model forecast
- `/api/metrics` → Get model performance metrics (RMSE, MAE)

---

### 2️⃣ Frontend (React Dashboard)
The React dashboard fetches and visualizes the API data.

#### Installation:
```bash
cd dashboard
npm install
```

#### Running the Dashboard:
```bash
npm run dev
```

---

## ⚡ Challenges and Solutions

### ❌ CORS Errors
- **Issue**: The frontend couldn't access the backend due to CORS restrictions.
- **Solution**: Enabled CORS in Flask using `flask-cors`:
  ```python
  from flask_cors import CORS
  CORS(app)
  ```

### ❌ LSTM Input Shape Mismatch
- **Issue**: The LSTM model expected a different input shape.
- **Solution**: Adjusted reshaping in the Flask API:
  ```python
  input_array = np.array(input_data).reshape(1, timesteps, 1)
  ```

### ❌ Forecast Data Not Displaying
- **Issue**: Data format mismatch between API and frontend.
- **Solution**: Transformed the forecast response data before visualization:
  ```javascript
  const forecastDates = Array.from({ length: steps }, (_, i) => {
    let date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toLocaleDateString();
  });
  ```

---

## 📸 Screenshots

![Screenshot From 2025-02-26 13-48-07](https://github.com/user-attachments/assets/12a295c4-f1b2-46f8-a2ea-397e8fd31c2d)

---
![Screenshot From 2025-02-26 13-48-00](https://github.com/user-attachments/assets/9dd4dd77-627a-4432-8f81-21db3b03280f)

## 🤝 Contributing
Feel free to submit issues or pull requests to improve this project.

---

## 📜 License
This project is licensed under the **MIT License**.

