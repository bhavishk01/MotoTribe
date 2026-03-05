# 🏍️ MotoTribe: A Website That Helps You Fix Your Vehicle.

MotoTribe is a full-stack MERN (MongoDB, Express, React, Node.js) application built to provide instant, intelligent support for vehicle breakdowns.

## ✨ Core Features

* **🔒 Secure Authentication:** Full user registration and login system connected to a local MongoDB database to keep user vehicle data private.(Google SSO yet to be implemented)
* **🤖 AI Diagnostic Interface:** Powered by Google's **Gemini 2.5 Flash API**. The AI acts strictly as an expert mechanic, helping users troubleshoot engine failures, weird noises, and starting issues in real-time.
* **📍 Geolocator Radar:** Uses HTML5 Geolocation and Google Maps API integration to instantly ping the user's exact coordinates, helping them find nearby certified repair shops.
* **💅 Premium UI/UX:** A highly responsive, custom-built interface featuring pitch-black backgrounds and interactive frosted-glass cards.

---

## 🛠️ Tech Stack

**Frontend:**
* React (via Vite)
* Custom CSS & inline styling 
* Google Fonts (Share Tech Mono & Montserrat)

**Backend:**
* Node.js & Express.js server environment
* MongoDB (Mongoose ODM for data modeling)
* `@google/generative-ai` SDK integration
* `dotenv` for strict environment variable security

---

## 🚀 How to Run Locally (Windows Setup)

To get a local copy up and running on your Windows machine, follow these steps.

### Prerequisites
* [Node.js](https://nodejs.org/) installed.
* [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`.
* A free [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### 1. Clone the Repository
```bash
git clone [https://github.com/bhavishk01/MotoTribe.git](https://github.com/bhavishk01/MotoTribe.git)
cd MotoTribe
```

### 2. Boot up the Backend Server
Open a terminal and navigate to the backend folder:
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` folder and add your AI key:
```text
GEMINI_API_KEY=your_actual_api_key_here
```
Start the Node.js server:
```bash
node server.js
```

### 3. Launch the Frontend
Open a **new, second terminal window** and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
Click the local link (usually `http://localhost:5173`) provided by Vite in your terminal to view the app!