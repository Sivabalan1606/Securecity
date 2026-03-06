# 🛡️ UrbanShield  
### Secure Access & API Protection for Urban Infrastructure Systems

UrbanShield is a **Smart City Cybersecurity Platform** designed to provide **secure access control and API protection for urban infrastructure systems**.

Modern city management platforms control sensitive infrastructure data such as **bridges, roads, pipelines, hospitals, and streetlights**. Without proper cybersecurity protections, these systems are vulnerable to **unauthorized access, API abuse, and cyber attacks**.

UrbanShield introduces a **secure access layer** that enforces:

- Authentication
- Authorization
- API protection
- Security monitoring
- Infrastructure asset tracking
- Audit logging

The platform simulates a **Smart City Command Center Dashboard** used by city administrators and engineers to monitor infrastructure while maintaining strong security.

---

# 🌆 Problem Statement

City infrastructure management platforms store critical operational data including:

- Bridge structural health reports
- Road maintenance records
- Water pipeline status
- Streetlight outage reports
- Emergency infrastructure alerts

Without proper security controls, these systems face risks such as:

- Unauthorized access
- API misuse
- Data tampering
- Insider threats
- Cyber attacks

UrbanShield solves this problem by implementing **secure access layers and API protection mechanisms**.

---

# 🚀 Key Features

## 🔐 Secure Authentication

UrbanShield implements a secure authentication system using:

- JWT Token Authentication
- bcrypt Password Hashing
- Secure Login Sessions
- Role Validation

Users must authenticate before accessing system APIs.

---

## 👥 Role Based Access Control (RBAC)

UrbanShield enforces **Role-Based Access Control** to ensure users only access permitted resources.

| Role | Permissions |
|-----|-------------|
| **Admin** | Manage users, view logs, configure system |
| **City Engineer** | Analyze infrastructure health |
| **Maintenance Staff** | Update maintenance records |
| **Public Viewer** | Read-only access |

Both **frontend UI components and backend APIs** are restricted based on roles.

---

# 🏗️ Infrastructure Asset Monitoring

UrbanShield monitors critical city infrastructure assets.

### Supported Infrastructure Types

- Bridges
- Roads
- Streetlights
- Water Pipelines
- Hospitals

Each asset includes the following data:

```

Asset ID
Asset Name
Location
Status (Good / Warning / Critical)
Last Inspection Date
Assigned Engineer

```

This helps city engineers monitor infrastructure health.

---

# 🗺️ Infrastructure Map Visualization

The system includes an **interactive city map** using **Leaflet.js**.

Infrastructure assets are displayed with status colors:

| Color | Meaning |
|------|--------|
| 🟢 Green | Healthy |
| 🟡 Yellow | Warning |
| 🔴 Red | Critical |

---

# 📊 Smart City Security Dashboard

UrbanShield includes a **command center dashboard** displaying system security metrics.

Metrics displayed:

- Active Users
- API Traffic
- Security Alerts
- Blocked Requests
- System Risk Level

Charts show:

- API request trends
- Login attempts
- Security incidents
- User activity

Charts are implemented using **Chart.js**.

---

# 🛡️ API Security Layer

All backend APIs are protected with multiple security mechanisms.

Security layers include:

- JWT Authentication
- Role Validation Middleware
- API Key Authentication
- Rate Limiting

Example protected APIs:

```

GET /api/infrastructure
GET /api/alerts
POST /api/maintenance
GET /api/security/logs
POST /api/users

```

Unauthorized access attempts are **blocked and logged**.

---

# 🔑 API Key Management

Admins can generate API keys for external integrations.

Features include:

- Create API keys
- Revoke API keys
- Track API key usage

External systems must include API keys when accessing backend APIs.

---

# 🚨 Suspicious Activity Detection

UrbanShield includes a **rule-based threat detection system**.

It detects events such as:

- Multiple failed login attempts
- Excessive API requests
- Unauthorized access attempts

When detected, the system generates **security alerts**.

---

# 📜 Activity Logging System

Every system event is logged for auditing purposes.

Examples of logged events:

- Login attempts
- Failed logins
- API requests
- Role changes
- Infrastructure updates
- Security violations

Each log entry stores:

```

User ID
Action Performed
Timestamp
IP Address
Status

```

Logs are stored in MongoDB.

---

# 📑 Full Audit Trail

UrbanShield maintains a **complete audit trail** tracking:

```

Who accessed the system
Which resource was accessed
When it was accessed
What action was performed

```

This ensures **accountability in city operations**.

---

# 🧠 System Architecture

```

```
            +---------------------+
            |   React Frontend    |
            | Dashboard Interface |
            +----------+----------+
                       |
                       |
                 Secure APIs
                       |
            +----------v----------+
            |    Express Server   |
            |  Authentication     |
            |  RBAC Authorization |
            |  API Key Validation |
            |  Rate Limiting      |
            +----------+----------+
                       |
                       |
                 MongoDB Database
                       |
        +--------------v--------------+
        | Infrastructure Assets       |
        | User Accounts               |
        | Activity Logs               |
        | Security Alerts             |
        +-----------------------------+
```

```

---

# 🔐 Security Flow

```

User Login
|
v
Authentication (JWT)
|
v
Role Validation (RBAC)
|
v
API Gateway Protection
|
+---- JWT Verification
+---- API Key Validation
+---- Rate Limiting
|
v
Request Allowed or Blocked
|
v
Activity Logged in Database

```

---

# 🗄️ Database Schema (ER Diagram)

```

## Users

userId
name
email
password
role
lastLogin

## InfrastructureAssets

assetId
name
location
status
inspectionDate
assignedEngineer

## SecurityLogs

logId
userId
action
timestamp
ipAddress
status

## APIKeys

keyId
key
createdBy
createdAt
status


# 🧩 Technology Stack

## Frontend

- React
- TailwindCSS
- React Router
- Chart.js
- Leaflet.js
- Axios


## Backend

- Node.js
- Express.js

---

## Security

- JWT Authentication
- bcrypt Password Hashing
- Role Based Access Control
- API Key Protection
- Rate Limiting

---

## Database

- MongoDB
- Mongoose ODM

---

# 📁 Project Structure

```

UrbanShield
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── charts
│   │   ├── map
│   │   ├── services
│   │   └── context
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── models
│   ├── services
│   └── utils
│
└── README.md

```

---

# ⚙️ Installation Guide

### Clone Repository

```

git clone [https://github.com/Sivabalan 1606/Securecity.git](****https://github.com/your-username/UrbanShield.git)

```

---

### Install Dependencies

Frontend

```

cd frontend
npm install

```

Backend

```

cd backend
npm install

```

### Configure Environment Variables

Create `.env` file inside backend folder.

\
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

```

### Run Project

Start backend server


npm run server


Start frontend
]]`

npm start

```

---

# 📸 Screenshots

Add screenshots of the following pages:

- Login Page
- Smart City Dashboard
- Infrastructure Map
- Security Monitoring Dashboard
- User Management Panel
- Activity Logs Page

Example:

```

![Dashboard](screenshots/dashboard.png)

```

---

# 🔮 Future Enhancements

UrbanShield can be expanded with:

- AI-based anomaly detection
- Real-time intrusion detection
- IoT sensor integration
- Blockchain-based audit logs
- Smart city IoT device monitoring
- Automated cyber defense systems

---

# 🤝 Contributing

Contributions are welcome.

Steps to contribute:

1 Fork the repository  
2 Create a feature branch  
3 Commit your changes  
4 Submit a pull request  

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Authors

Developed as a **Smart City Cybersecurity Platform** demonstrating how secure access layers protect urban infrastructure systems.

---

# ⭐ Support

If you like this project, please consider giving it a **star ⭐ on GitHub**.
```

---

✅ This README is now **top-tier professional documentation**.

It includes:

* architecture
* diagrams
* API explanation
* security flow
* ER schema
* setup instructions

Exactly what **hackathon judges / recruiters expect**.

---

If you want, I can also give you **one more upgrade that makes your repo look INSANE professional**:

* **Animated GitHub README (live metrics, typing animation, dashboard GIF, tech icons)**
* **Professional system architecture diagram image**
* **Figma UI preview section**

This will make your **GitHub repo look like a startup product.**
