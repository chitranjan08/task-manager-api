# 🧠 Smart Task Manager

A full-stack, scalable, and secure **Task Management Application** built with **React**, **Node.js**, **Express**, **MongoDB**, and **Kafka**. It includes user roles, JWT authentication, task tracking, activity logs, email reminders, and real-time data streaming via Kafka. The project is **Dockerized** and ready for **CI/CD on AWS EC2**.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Kafka Integration](#kafka-integration)
- [Docker Setup](#docker-setup)
- [Deployment (AWS EC2 + CI/CD)](#deployment-aws-ec2--cicd)
- [License](#license)

---

## ✨ Features

### 🔙 Backend
- User registration and login with **JWT + refresh tokens**
- **Role-based access**: Admin, Manager, User
- CRUD operations for tasks
- Task status tracking (`todo`, `in-progress`, `done`)
- **Activity logs** for audit trail
- **Email reminders** for due tasks (via cron jobs)
- **Real-time data streaming** using **Kafka**
- Secure APIs with rate limiting and input validation
- **Dockerized** and CI/CD ready

### 🔜 Frontend
- Built with modern **React**
- **Login / Register / Logout** flows
- **Protected routes** using JWT
- Create, edit, delete, and filter tasks
- View real-time task updates via Kafka stream (e.g., WebSocket or polling Kafka consumer endpoint)
- Responsive UI and smooth UX

---

## 🧰 Tech Stack

| Layer       | Tech Stack                                       |
|-------------|--------------------------------------------------|
| Frontend    | React, Axios, React Router, Tailwind/Bootstrap   |
| Backend     | Node.js, Express, MongoDB, Mongoose              |
| Auth        | JWT (access + refresh tokens)                    |
| Messaging   | Apache Kafka                                     |
| Validation  | Joi or Zod                                       |
| Logging     | Winston                                           |
| Email       | Nodemailer                                       |
| DevOps      | Docker, GitHub Actions / Jenkins                 |
| Deployment  | AWS EC2                                          |

---


---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (>= 18.x)
- MongoDB (local or Atlas)
- Docker & Docker Compose
- Apache Kafka + Zookeeper (locally or via Docker)
- AWS EC2 (for deployment)

---

### 🔙 Backend Setup

```bash
cd backend
npm install

Create a .env file:

PORT=3000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=task-events


Run Kafka locally (if not using Docker):

# Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Kafka
bin/kafka-server-start.sh config/server.properties

Start the backend server:
npm run dev

🔜 Frontend Setup

cd frontend
npm install

Start the React development server:

npm start

🌐 API Endpoints
Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Login and receive token
GET	/tasks	Get all tasks
POST	/tasks	Create a task
POST	/tasks/:id	Update a task
POST	/tasks/:id	Delete a task
GET	/logs	Get activity logs
GET	/kafka/stream	Stream Kafka messages (optional endpoint)