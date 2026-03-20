# 💊 Smart Medicine Reminder (Frontend UI)

This is the React + Vite frontend client for the Smart Medicine Reminder application, designed specifically for Alzheimer's patients and their caregivers.

---

## 🛑 Problem Statement
Alzheimer’s disease causes progressive memory loss and cognitive decline, making it incredibly difficult for patients to adhere to medication schedules. Caregivers face immense psychological burden trying to monitor their loved ones remotely, fearing missed doses or dangerous double dosing.

---

## 🔍 Team Problem Validation Approach
We validated the core issues through mapping the struggles of both patients and caregivers:
1. **Statistical Backing:** 55 million people live with dementia, with 70% missing critical doses.
2. **Empathy Mapping:** Standard digital alarms and "Click to Confirm" interfaces confuse patients suffering from cognitive decline.
3. **Hypothesis Validation:** We hypothesized that using multimodal interactions—**Voice and Camera AI**—would dramatically reduce friction for patients while providing concrete adherence evidence to caregivers.

---

## 🏗️ Architecture Overview
The system relies on a decoupled architecture:
- **Frontend (This repository):** React.js + Vite + Tailwind CSS. Providing role-based UX for patients (simplified UI, speech-to-text validation) and caregivers (data-dense charts and schedules).
- **Backend:** Node.js + Express.js + Node-Cron. Handles scheduled reminders, double-dose blocking logic, and logs authentication via MongoDB.
- **AI Service:** Python + FastAPI + EasyOCR. Simulates pill identification via camera images.

---

## 🧠 Key Design Decisions
1. **Role-Based Workflows:** The frontend dynamically changes layout based on login limits—patients get big buttons and voice commands; caregivers get analytics and patient linkage tools.
2. **Multimodal Accessibility:** Patients can say `"I took my medicine"` or hold their pill to the webcam to verify their dosage, mitigating motor-skill drops.
3. **Double-Dose Hard Blocks:** Working with the backend API, the frontend immediately flags "double_dose_attempt" if a patient accidentally tries logging a previously taken medication.

---

## 🚀 Key Steps to Start Backend and Frontend Services

To run the full application locally, you must start both the backend server and this frontend development server.

### Step 1: Start the Backend Service
*Open your first terminal window and navigate to the `backend` folder.*
```bash
cd backend
npm install
# Copy the environment example configuration
cp .env.example .env

# Edit .env with your MongoDB URI (e.g., mongodb://localhost:27017/medicine-db)

# Start the backend server
npm start 
# OR use "npm run dev" for nodemon
```
✅ The backend API and cron scheduler will be running on `http://localhost:5000`

### Step 2: Start the Frontend Service
*Open your second terminal window and navigate to the `frontend` folder.*
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```
✅ The frontend application will be running on `http://localhost:5173`

### Step 3: (Optional) Start the AI Microservice
*Open a third terminal window.*
```bash
cd ai-service
pip install -r requirements.txt

# Start the Python OCR server
python main.py
```
✅ The Verification AI will be running on `http://localhost:8000`
