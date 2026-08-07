# ☀️ SolisIQ

**An AI-powered solar planning platform for homeowners that combines weather-based predictions, savings and ROI calculations, subsidy guidance, and a polished dashboard experience.**

![Status](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/backend-Flask-black?logo=flask)
![MySQL](https://img.shields.io/badge/database-MySQL-4479A1?logo=mysql&logoColor=white)
![Python](https://img.shields.io/badge/ML-scikit--learn-F7931E?logo=scikitlearn&logoColor=white)

---

## 📖 Overview

SolisIQ is a full-stack web application that helps homeowners answer a simple question: **"Is solar worth it for me?"**

The app combines real weather lookup, a trained machine learning model, ROI and savings calculations, subsidy estimates, and environmental impact analysis in one experience. It also includes authentication, calculation history, admin tools, and downloadable reports.

---

## ✨ Feature Set

### Core Experience
- 🏠 **Home page** with a polished hero section and project overview
- 🔐 **Authentication** for users, including signup, login, and protected dashboard access
- ⚡ **Solar calculator** for location, monthly bill, rooftop area, and state-based analysis
- 📊 **Interactive dashboard** with savings, payback, and environmental impact summaries
- 🕓 **Calculation history** so users can revisit and manage past analyses
- 📄 **PDF report export** for generated solar assessments
- 🎨 **Futuristic UI theme** with a card-based layout, dark mode support, and animated counters

### AI & Analytics Features
- 🤖 **Weather-based energy prediction** using a trained ML model
- 📈 **Model comparison** between Random Forest and Linear Regression baselines
- 🌦️ **Seasonal output variation** chart for month-by-month forecast behavior
- 🧠 **Community insights** section with aggregated usage statistics and top locations
- 🌱 **Carbon impact estimates** and tree-equivalent reporting

### Advanced Modules
- 🏛️ **Government subsidy checker** for state-based subsidy estimates
- 🎙️ **Voice input** for entering the monthly bill amount
- 🏠 **Roof layout visualization** showing an illustrative panel placement view
- 🔔 **Recent activity / notification feed** on the dashboard experience
- 📌 **Methodology disclaimer** and calculation explanation panel in the dashboard
- ✅ **Reliability improvements** including loading states, validation, empty states, and error handling

### Admin Features
- 🔑 **Admin login** and separate admin-only access
- 📈 **Admin dashboard** with user and calculation statistics
- 👥 **User management** tools for viewing and removing accounts

### Not Yet Implemented
The following items were checked against the current codebase and are not implemented yet:
- Confidence intervals on predictions
- Explainable AI / feature importance explanations
- Recommendation tiers such as “Highly Recommended / Recommended / Consider Alternatives”
- Battery storage add-on calculator
- Maintenance cost estimation in ROI calculations
- Slider-based inputs on the calculator
- A 25-year timeline scrubber
- Excel export
- A dedicated leaderboard-style community ranking page

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, React Router, Axios, Recharts |
| **UI Enhancements** | Custom animated counters, responsive card layouts, dark mode styling |
| **Backend** | Python, Flask, Flask-CORS, Flask-Bcrypt |
| **Database** | MySQL (via Laragon / phpMyAdmin) |
| **Authentication** | JWT-based auth with bcrypt password hashing |
| **Machine Learning** | scikit-learn, pandas, numpy, joblib |
| **PDF Generation** | ReportLab |
| **Weather Data** | Open-Meteo API (weather lookup and historical data) |

---

## 🏗️ System Architecture

```text
React Frontend
  └─ Flask Backend
       ├─ Weather lookup + ML prediction
       ├─ ROI / subsidy / carbon calculations
       ├─ MySQL storage for auth and saved calculations
       └─ PDF report generation
```

**Data flow:** User enters location and bill details → weather lookup runs → ML model predicts energy output → ROI, subsidy, and carbon calculations are generated → results are shown on the dashboard → optionally saved to history or exported as a PDF.

---

## 📂 Project Structure

```text
solis-iq/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── HomePage.jsx
│   │   ├── SolarInputForm.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CalculationHistory.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── AdminLoginPage.jsx
│   │   ├── AdminDashboardPage.jsx
│   │   ├── SubsidyCheckerPage.jsx
│   │   ├── reportDownload.js
│   │   ├── useCountUp.js
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── app.py
│   ├── data/
│   │   ├── fetch_data.py
│   │   └── weather_data.csv
│   ├── model/
│   │   ├── train_model.py
│   │   └── model_comparison.json
│   └── requirements.txt
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MySQL / Laragon (or any local MySQL server)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/solis-iq.git
cd solis-iq
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt --break-system-packages
python app.py
```
Backend runs on `http://localhost:5000` by default.

### 3. Database Setup
1. Start MySQL via Laragon (or your local server)
2. Open phpMyAdmin and create a database named `solar_advisor`
3. Import the schema from the backend data folder if available for your environment

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000` by default.

### 5. Train or refresh the ML model (optional)
```bash
cd backend/model
python train_model.py
```
This regenerates the model and refreshes the comparison metrics used by the homepage.

---

## 📊 Model Performance

The current implementation uses a Random Forest regressor trained on historical weather data, with a Linear Regression baseline shown for comparison on the homepage. The backend also serves seasonal breakdown and community insight data.

---

## 🔒 Security

- Passwords are hashed with bcrypt before storage
- JWT-based authentication is used for protected routes
- Input validation and error handling are included on the main flows

---

## 👤 Author

**Abhijeet Singh**
Project — AKTU
abhijeetsingh01122006@gmail.com

---

## 📄 License

    This project was developed for academic purposes as part of a final-year engineering project.