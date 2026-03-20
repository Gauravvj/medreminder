# 💊 Smart Medicine Reminder for Alzheimer's Patients

A full-stack web application designed to help Alzheimer's patients take their medicines on time, prevent double dosing, and empower caregivers to monitor medication adherence remotely.

---

## 🛑 Problem Statement

Alzheimer’s disease causes progressive memory loss and cognitive decline. One of the most immediate and dangerous challenges patients face is **medication adherence**. Patients frequently forget to take their medication or, more dangerously, forget they already took it and consume a **double dose**. 

Meanwhile, caregivers face immense psychological burden and anxiety, operating without real-time tools to remotely monitor if their loved ones are safe and adhering to their medical schedules.

---

## 🔍 Team Problem Validation Approach

Our team validated this problem through the following approach:
1. **Statistical Verification:** Research indicates over 55 million people live with dementia worldwide, and nearly 70% of those patients regularly struggle with medication adherence.
2. **Empathy Mapping:** We mapped the user journey of both the patient and the caregiver. We realized standard "click-to-confirm" digital interfaces fail for patients with declining motor and cognitive functions.
3. **Solution Hypothesis:** We hypothesized that a multimodal approach—using **Voice Recognition** and **Camera AI Verification**—would drastically lower the friction for patients while providing hard proof of adherence to the caregivers.

---

## 🏗️ Architecture Overview

The system operates on an decoupled **Client-Server-Microservice** architecture.

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| **Frontend UI** | React.js (Vite) + Tailwind CSS | Delivers role-specific dashboards. Patients get a simplified interface with voice/camera tools; Caregivers get analytics and schedules. |
| **Main Backend**| Node.js + Express.js + Node-Cron | Manages authentication, scheduled alerts, double-dose prevention logic, and stores logs. |
| **Database** | MongoDB + Mongoose | Persists patient data, medication histories, alerts, and relations between caregivers and patients. |
| **AI Service** | Python + FastAPI + EasyOCR | A specialized microservice that receives images, performs Optical Character Recognition (OCR), and verifies pill packets. |

---

## 🧠 Key Design Decisions

1. **Role-Based UX Separation:** 
   - *Patient View:* High-contrast, large text, minimal navigation, focused strictly on what to take *now*.
   - *Caregiver View:* Data-dense dashboard with adherence rates, miss counts, and scheduling controls.
2. **Multimodal Confirmation:** Recognizing that buttons confuse patients, we implemented the Web Speech API for voice confirmation and an external Python OCR service for camera-based pill validation.
3. **Hard Double-Dose Prevention:** The backend implements an aggressive time-window lock. If a dose is logged, secondary attempts trigger a `double_dose_attempt` alert directly to the caregiver instead of updating the log.
4. **Integrated Cognitive Therapy:** Added built-in Pattern Memory and Number Recall games to stimulate cognitive function natively within the patient's daily routine.

---

## 📁 Project Structure

```text
smart-medicine-reminder/
├── backend/                # Main Node.js API
│   ├── src/config/         
│   ├── src/controllers/    
│   ├── src/models/         
│   ├── src/routes/         
│   └── src/server.js       
├── frontend/               # React Vite Client
│   ├── src/components/     
│   ├── src/context/        
│   └── src/pages/          
├── ai-service/             # Python Verification Microservice
│   ├── main.py
│   └── requirements.txt
└── README.md
```

---

## 🚀 Key Setup Instructions

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Python 3.9+**

### 1. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run dev
```
*Runs on http://localhost:5000*

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Runs on http://localhost:5173*

### 3. Setup AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
# Run the Python service natively
python main.py
```
*Runs on http://localhost:8000*

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/auth/register` | Register new user |
| **POST** | `/api/auth/login` | Login user |
| **GET** | `/api/auth/patients` | List all patients |
| **POST** | `/api/medicines` | Add medicine |
| **GET** | `/api/medicines/:patientId` | Get patient's medicines |
| **POST** | `/api/logs` | Log medicine intake |
| **GET** | `/api/logs/stats/:patientId` | Get adherence stats |
| **GET** | `/api/alerts/:caregiverId` | Get caregiver alerts |
| **POST** | `/api/cognitive` | Save game result |

---

## ✨ Core Features

- **🔔 Smart Reminders** — Cron-based medication reminders evaluating schedule times aggressively.
- **🚫 Double Dose Prevention** — Smart logging that prevents duplications.
- **🎤 Voice & 📷 Camera Verification** — Next-level accessibility for patients.
- **📊 Caregiver Dashboard** — Centralized patient monitoring and alert resolution.
- **🧠 Cognitive Games** — Brain stimulation reporting directly to the caregiver.

---

## 📝 License

This project is built as a hackathon showcase demonstrating full-stack web development with a focus on accessible healthcare technologies.
