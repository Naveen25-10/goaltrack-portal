# GoalTrack Portal

An enterprise-grade, in-house **Goal Setting & Tracking Portal** built to align, track, and manage employee performance objectives seamlessly.

## 🚀 Overview

Organizations that rely on manual or fragmented goal-tracking methods often struggle with alignment, visibility, and accountability. Spreadsheets and emails create blind spots. **GoalTrack Portal** eliminates these pain points by supporting the full lifecycle of employee goals — from creation and manager alignment to quarterly check-ins and HR visibility.

Built on the robust **MERN stack** (MongoDB, Express, React, Node.js), this application is intuitive, reliable, and fully audit-ready.

---

## 🎯 Features by Role

### 👤 Employee
* **Create & Submit Goal Sheets**: Define Thrust Areas, Targets, UoM (Numeric, %, Timeline, Zero-based), and Weightage.
* **System Validations**: Enforces exactly 100% total weightage, max 8 goals, and min 10% weightage per goal.
* **Quarterly Check-ins**: Log "Actual Achievement" against targets during strictly enforced quarterly windows (Q1, Q2, Q3, Q4).
* **Progress Tracking**: See automatically calculated progress scores based on the Unit of Measurement formula.

### 👔 Manager (L1)
* **Team Dashboard**: View at a glance which team members have submitted goals or completed check-ins.
* **Goal Approval Workflow**: Review, edit targets/weightages inline, and approve or reject team goals.
* **Shared Goals (KPIs)**: Push departmental goals to the entire team at once. Progress updates by the primary owner automatically sync to all linked team members.
* **Check-in Reviews**: Review quarterly achievements and leave structured coaching feedback.

### 🛡️ Admin / HR
* **Real-time Analytics**: Visual pie and bar charts tracking organization-wide goal completion and statuses.
* **Audit Trail**: Every edit made to a locked (approved) goal is permanently recorded, tracking exactly who changed what, and when.
* **Goal Management**: Ability to unlock approved goals to allow mid-year revisions by employees.
* **Exportable Reports**: Generate and export CSV reports of Planned Targets vs Actual Achievements.

---

## 🛠️ Tech Stack

* **Frontend**: React.js (Vite), Tailwind CSS v4, Lucide React (Icons), Recharts (Data Visualization), React Router DOM.
* **Backend**: Node.js, Express.js, JWT (JSON Web Tokens) for Authentication.
* **Database**: MongoDB & Mongoose ORM.
* **Tooling**: Concurrently (to run both client and server simultaneously).

---

## 💻 Running the Project Locally

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB (Running locally on `mongodb://127.0.0.1:27017` or via an Atlas URI)

### 1. Installation

Clone the repository and install dependencies for both the root, client, and server:

```bash
# Install concurrently at the root level
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/atomquest
JWT_SECRET=supersecretjwtkey_change_in_production
```

### 3. Seed the Database

To test the application, you need users. Run the seeder script to populate Demo Accounts:

```bash
cd server
npm run seed
```

### 4. Start the Application

From the **root directory**, start both the frontend and backend simultaneously:

```bash
npm run dev
```

* **Frontend**: `http://localhost:5175` (or whatever port Vite assigns)
* **Backend**: `http://localhost:5000`

---

## 🔑 Demo Credentials

Use the following credentials to test the different user journeys (Password for all is `password123`):

* **Employee**: `employee@atomquest.com`
* **Manager**: `manager@atomquest.com`
* **Admin**: `admin@atomquest.com`

> *Note: There are quick-login demo buttons provided on the login page for convenience during evaluation.*

---

## 📅 Hackathon Notes
* **Mock Notifications**: Email notifications are fully functional but are logged to the Node.js terminal instead of using an SMTP server to ensure smooth offline testing during the demo.
* **Quarter Enforcement**: To test the quarterly check-in locks (Jul/Oct/Jan/Apr), use the **"Demo: Simulate Month"** toggle on the Employee Check-ins page.
