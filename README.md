# SafeSpot: A Comprehensive Crime Management System 🚀

SafeSpot is a **web-based crime management system** developed as part of our **Semester Project for Database Administration Management (DAM)**, this project empowers both citizens and administrators to enhance community safety through real-time incident reporting, collaborative verification, and data-driven insights.  

---

## 📌 Features

### 🌐 Citizen Portal
- Report incidents with categories and location details
- Verify and validate reports submitted by others
- Track the status of reports (pending, verified, resolved)
- View dynamic graphs:
  - Incident trends over time
  - Category distribution
  - Hotspot predictions

### 🛡️ Admin Portal
- Manage users, response teams, and incidents
- Assign incidents to response teams for investigation
- Verify user-submitted reports and monitor verification status
- Analyze incident trends and predict hotspots with visualizations

### 🤝 Collaborative Verification System
- Multi-user report validation
- Admin-approved final verification

### 🚑 Response Team Management
- Assign incidents to specific teams
- Monitor response team performance and efficiency

### 📊 Database Highlights
- **SQL Server** database with:
  - Stored Procedures for optimized queries
  - Triggers for automated notifications and workflows
  - Isolation Levels & Joins for data consistency
  - DAM principles for robust design

### 📈 Dynamic Visualizations
- Graphs and charts generated using **Matplotlib** for both Admin and Citizen dashboards

---

## 🛠️ Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | HTML, CSS, JavaScript (Responsive Dashboards) |
| Backend     | Python Flask (RESTful APIs)    |
| Database    | SQL Server                     |
| Visualizations | Matplotlib                   |

---

## 🚀 Setup Instructions

### 1️⃣ Create SQL Server Database

- Install **SQL Server** and **SQL Server Management Studio (SSMS)** if not already installed.
- Run the provided SQL scripts (already given) to create the required **tables**, **stored procedures**, **triggers**, and **relationships**.  


### 2️⃣ Configure `app.py` for Database Connection

- In `app.py`, update the **SQL Server connection details** (host, user, password, database name) as per your local setup.
  ```
  conn_str = (
    "DRIVER={SQL Server};"
    "SERVER=DESKTOP-E6QS9C9\\SQLEXPRESS;" #Replace with your Sql Server name  
    "DATABASE=SafeSpotProject;" #Replace with database name if you change
    "Trusted_Connection=yes;"
  )
  ```

### 3️⃣ Install Required Python Libraries

- Install the necessary dependencies by running:
  ```bash
  pip install Flask pyodbc matplotlib
  ```
### 4️⃣ Run the Application

- Start the Flask server:
  ```bash
  python app.py
  ```
- Access the application in your browser at:
  ```bash
  http://localhost:5000
  ```
