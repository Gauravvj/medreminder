# 🎬 MedReminder — Video Demo Script (4–5 Minutes)

## Smart Medicine Reminder for Alzheimer's Patients

---

## INTRO (0:00 – 0:25)

**[Screen: Login Page]**

> "Hi everyone! Today we're presenting **MedReminder** — a Smart Medicine Reminder system built for **Alzheimer's patients** and their **caregivers**.
>
> Alzheimer's patients often forget their medicines, take the wrong pill, or accidentally double-dose. MedReminder solves this with **AI-powered pill verification**, **voice confirmation**, **real-time caregiver alerts**, and **cognitive brain games**.
>
> Let me start by logging in as a **patient** and walking through the four main sections."

**[Action: Type credentials → Click "Sign In" → Dashboard loads]**

---

## SECTION 1 — 🏠 Dashboard (0:25 – 1:30)

**[Screen: Patient Dashboard]**

> "This is the **Patient Dashboard** — the patient's home screen.
>
> At the top, we have a personalized greeting and **three stat cards** — Total Doses Logged, Adherence Rate, and Active Medicines. These give an instant health snapshot.
>
> Below, **Today's Medicines** — each card shows the medicine name, dosage, schedule times, and instructions. When a medicine is **due within 30 minutes**, the card gets a **pulsing glow** as a visual reminder."

**[Point to a glowing card]**

> "The patient can confirm by clicking **'I Took This Medicine'**. But for Alzheimer's patients, we need to **verify** they're taking the correct pill. Let me show you."

**[Action: Click "Use Voice or Camera" on a medicine]**

### Voice Confirmation (0:55 – 1:10)

> "**Voice Confirmation** — the patient clicks **'Start Listening'** and says *'I took my medicine'*, *'yes'*, or *'done'*. It supports **multiple languages** including Hindi and has a **10-second auto-timeout**."

**[Action: Click "Start Listening" → Say "I took my medicine" → Show ✅ confirmation]**

### Camera Pill Verification (1:10 – 1:30)

> "**Camera Pill Verification** — the patient opens the camera, shows the pill, and clicks **'Capture & Verify'**. The image is sent to our **FastAPI AI microservice**, which returns a **confidence score** and **pill name**."

**[Action: Open camera → Show pill → Capture & Verify → Show confidence bar + result]**

> "Both methods are logged to the database with the confirmation type — so caregivers know exactly **how** each dose was verified."

---

## SECTION 2 — 💊 Schedule (1:30 – 2:10)

**[Action: Click "Schedule" in navbar]**

**[Screen: Medicine Schedule Page]**

> "The **Schedule page** shows all of the patient's medicines in a clean list — each with its **name, dosage, schedule times**, and **instructions**.
>
> From the patient's view, this is a read-only overview. But when a **caregiver** is logged in, they can **add, edit, and delete** medicines — I'll show that in the caregiver section.
>
> Let me show the edit flow quickly."

**[Action: Click "Add Medicine" → Fill form: Medicine Name, Dosage, Times (e.g. 08:00, 14:00, 20:00), Instructions → Click "Add Medicine"]**

> "Adding a medicine is simple — name, dosage, comma-separated schedule times in 24-hour format, and optional instructions. The new medicine appears instantly in the list."

**[Show the new medicine in the schedule list with time pills]**

> "You can also **edit** any medicine or **delete** it if it's no longer needed."

**[Action: Click "Edit" on a medicine → change dosage → Save → Click "Delete" on another → Confirm]**

---

## SECTION 3 — 📋 History (2:10 – 2:45)

**[Action: Click "History" in navbar]**

**[Screen: Medication History Page]**

> "The **History page** gives a **complete log** of every medication event.
>
> At the top, we have **filter buttons** — All, Taken, and Missed — each with a count badge. Let me click **'Taken'** to filter."

**[Action: Click "✅ Taken" filter]**

> "The table shows the **medicine name**, **status** with a color-coded badge, the **confirmation method** — whether it was manual 👆, voice 🎤, or camera 📷 — and the **exact timestamp**.
>
> This data helps identify patterns — for example, if a patient consistently misses their **evening dose**, caregivers can step in.
>
> Let me also filter for **missed** doses."

**[Action: Click "❌ Missed" filter → Show missed entries]**

> "These missed doses are also sent as **alerts to caregivers**, which I'll show next."

---

## SECTION 4 — 🧠 Brain Games (2:45 – 3:25)

**[Action: Click "Brain Games" in navbar]**

**[Screen: Brain Games Page]**

> "The **Brain Games** section helps Alzheimer's patients **exercise their memory** daily and lets caregivers **track cognitive decline**.
>
> We have **two games**:
>
> **Pattern Memory** — colored tiles light up in a sequence, and the patient must **repeat the pattern**. It gets progressively harder over 5 rounds."

**[Action: Click "Play" on Pattern Memory → Play 2 rounds → Show score]**

> "And **Number Recall** — a number flashes on screen, disappears, and the patient types it from memory.
>
> All scores are **saved to the database**. You can see **recent results** here at the bottom — each with the game type, score, and date. If scores start **declining over time**, it could signal disease progression, helping doctors adjust treatment."

**[Point to the Recent Results cards at the bottom]**

---

## SECTION 5 — 👨‍⚕️ Caregiver Dashboard (3:25 – 4:20)

**[Action: Log out → Log in as Caregiver]**

**[Screen: Caregiver Dashboard]**

> "Now let's switch to the **Caregiver's perspective**. This is the Caregiver Dashboard.
>
> At the top — **four overview stats**: Linked Patients, Unread Alerts, Average Adherence, and Total Missed Doses. One glance tells you how all your patients are doing."

**[Point to stat cards]**

> "Below, **Patient Cards** — each shows individual stats: doses taken, missed, and adherence percentage."

### Linking Patients (3:45 – 3:55)

> "Caregivers can **link new patients** to their account. Once linked, you receive **all alerts** for that patient."

**[Point to / click Link Patient section]**

### Alerts & Double Dose Prevention (3:55 – 4:15)

**[Scroll to Alerts section]**

> "Our backend runs a **cron job every minute** checking all scheduled medicines. If a patient **misses a dose**, the system automatically creates a **'Missed Dose' alert**.
>
> But the most critical feature — **Double Dose Prevention**. If a patient tries to log the **same medicine within 2 hours**, the system **blocks it** and sends a **'Double Dose Attempt' alert** to all linked caregivers."

**[Point to alert cards with missed_dose and double_dose_attempt badges]**

> "Each alert shows the type, timestamp, patient name, and message. Caregivers click **'Mark Read'** once addressed. The **notification bell** in the navbar shows the unread count in real-time."

**[Point to 🔔 bell icon with badge]**

---

## CLOSING (4:20 – 4:40)

**[Screen: Patient Dashboard or Login Page]**

> "To summarize — **MedReminder** provides:
>
> ✅ **Dashboard** with real-time stats and visual medicine reminders  
> ✅ **Voice confirmation** and **AI camera pill verification**  
> ✅ **Medicine schedule management** with full CRUD  
> ✅ **Complete medication history** with method tracking  
> ✅ **Brain games** for cognitive health monitoring  
> ✅ **Caregiver alerts** with missed dose detection  
> ✅ **Double dose prevention** — blocks and notifies caregivers
>
> Built with **React**, **Node.js**, **Express**, **MongoDB**, and a **FastAPI Python AI microservice**.
>
> Thank you!"

---

## 📋 Recording Checklist

| # | Section | Nav Tab | Duration | Key Action |
|---|---------|---------|----------|------------|
| 1 | Intro + Login | — | 25s | Show login page, explain problem |
| 2 | 🏠 Dashboard | Dashboard | 65s | Stats, medicine cards, voice demo, camera AI demo |
| 3 | 💊 Schedule | Schedule | 40s | View medicines, add/edit/delete |
| 4 | 📋 History | History | 35s | Filters, table with method & status |
| 5 | 🧠 Brain Games | Brain Games | 40s | Play Pattern Memory, show recent scores |
| 6 | 👨‍⚕️ Caregiver | (re-login) | 55s | Stats, patient cards, alerts, double dose |
| 7 | Closing | — | 20s | Recap features |
| | **Total** | | **~4:40** | |

## 💡 Pre-Recording Setup

1. **Start all 3 services**:
   - `cd backend && npm start`
   - `cd frontend && npm run dev`
   - `cd ai-service && python main.py`

2. **Create test accounts**:
   - Patient: `patient@test.com` / `password123`
   - Caregiver: `caregiver@test.com` / `password123`

3. **Prep data**:
   - Add 2-3 medicines for the patient (set one time close to your recording time for glow effect)
   - Link patient to caregiver
   - Log a few doses so stats and history have data
   - Play a brain game so Recent Results shows scores

4. **Have ready**: A pill bottle for the camera demo

5. **Recording tool**: OBS Studio, Loom, or Windows Game Bar (`Win + G`)
