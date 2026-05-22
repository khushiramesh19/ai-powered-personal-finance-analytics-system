# AI-Powered Personal Finance Analytics System


This system is a next-generation, full-stack personal finance management application that combines robust expense tracking with machine learning to predict future spending, analyze financial behavior, and offer automated, smart budgeting suggestions. 

Built using a microservice architecture, it showcases advanced data visualization, secure multi-tier authentication, and in-browser predictive analytics.


##  System Architecture

This system separates its user interface, data processing, and storage into a clean, decoupled full-stack architecture:

* **Frontend View Layer:** A single-page application built using **React** and **Tailwind CSS**. It handles interactive UI states, native dark mode configuration, and streams responsive data components via **Recharts**.
* **AI Intelligence Layer:** A native client-side analytical engine executing **Ordinary Least Squares (OLS) Linear Regression** directly in the browser for instant predictive expense forecasting.
* **Backend API Gateway Tier:** A restful API built on **Node.js** and **Express**. It handles secure, stateless user session controls, incoming HTTPS requests, JSON schemas, and routing traffic.
* **Database Storage Tier:** A robust **MongoDB** NoSQL database instance configured to store encrypted user profile credentials and historical ledger transactions.

##  Features

### Core Financial Modules (Full-Stack)

* **User Authentication :** Bulletproof Signup/Login workflows powered by JSON Web Tokens (JWT) stored securely, ensuring protected API routes.
* **Expense & Income Ledger :** Full CRUD capabilities to add, edit, or remove entries categorized dynamically (*Food, Travel, Shopping, Bills, Entertainment, Salary*).
* **Dashboard Analytics :** Sleek, high-performance visual data distribution graphs powered by Recharts (Pie, Bar, and Line charts).
* **Budget Setting Feature :** Set monthly fiscal limitations per category with real-time UI warning notifications when approaching limits.

### AI Features (Intelligence Layer) 

* **In-Browser Expense Prediction :** Runs a direct in-browser Ordinary Least Squares (OLS) linear regression forecasting engine to evaluate legacy transaction patterns and forecast upcoming spending trends.
* **Smart Spending Suggestions :** Algorithmic heuristics that generate plain-text structural advice: *"You saved 96% of your income this month. Consider locking a tighter budget for bills."*
* **AI Financial Health Score :** Calculates a real-time startup-level score (0-100) dynamically generated using savings-to-income ratios, overspending metrics, and earning consistency.

### Extra Features

* **Recurring Subscription Detection :** Smart recognition patterns that isolate and flag continuous billing cycles and active subscriptions.
* **Export Audit Statements :** Download comprehensive monthly financial statements and fiscal summaries instantly.
* **Dark Mode Toggle :** Visually stunning, recruiter-optimized interface built seamlessly using Tailwind's state configurations.
* **Mobile Responsive UI :** Completely fluid layouts designed from a mobile-first philosophy to ensure usability across any device viewport.

---

##  Tech Stack

| Component | Technology | Description |
| --- | --- | --- |
| **Frontend** | React | Declarative UI components & state management |
| **Styling** | Tailwind CSS | Utility-first responsive design framework & Dark Mode |
| **Charts** | Recharts / Chart.js | SVG/Canvas-based data visualization engine |
| **Backend API** | Node.js + Express | High-concurrency async processing API gateway |
| **Database** | MongoDB | NoSQL document store optimized for transactional data |
| **Machine Learning** | OLS Linear Regression | Native client-side mathematical predictive forecasting engine |
| **Authentication** | JWT (JSON Web Tokens) | Stateless, secure user session management |
| **Deployment** | Vercel & Render | Production-ready cloud staging and hosting pipelines |

---

##  Getting Started

### Prerequisites

* Node.js (v16 or higher)
* MongoDB Connection String

### Installation & Local Setup

1. **Clone the repository:**
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd AI-POWERED-PERSONAL-FINANCE-ANALYTICS-SYSTEM

```


2. **Configure Environment Variables:**
Create a `.env` file inside the `backend/` directory:
```text
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret

```


Create a `.env` file inside the `frontend/` directory:
```text
REACT_APP_API_URL=http://localhost:5000

```


3. **Run Backend (Node.js):**
```bash
cd backend
npm install
npm start

```


4. **Run Frontend (React):**
```bash
cd frontend
npm install
npm start

```



```

```
